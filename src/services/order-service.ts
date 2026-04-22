import { OrderStatus } from "@prisma/client";
import { add } from "date-fns";
import { nanoid } from "nanoid";

import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { MercadoPagoPayer } from "@/types";

import {
  buildOrderItemsCreate,
  calculateOrderTotals,
  type CouponInput,
  decrementLegacyOrderStock,
  decrementOrderItemsStock,
  decrementVariantStock,
  determineUpdateActions,
  extractShippingFromOrderMetadata,
  getLegacyShippingCost,
  incrementCouponUsage,
  parseLegacyItems,
  resolveProvinceCode,
  restoreOrderItemsStock,
  sendCashOrderEmailAsync,
  sendTransferOrderEmailAsync,
  validateAndPriceItems,
} from "./order-helpers";
import type { OrderMetadata, OrderUpdateData } from "./order-service.types";

export type { OrderMetadata, OrderUpdateData } from "./order-service.types";

export class OrderService {
  mapStatus(mpStatus: string): OrderStatus {
    if (mpStatus === "approved") return ORDER_STATUS.PROCESSED as OrderStatus; // Payment Confirmed -> PROCESSED
    if (mpStatus === "in_process" || mpStatus === "pending")
      return ORDER_STATUS.PENDING_PAYMENT as OrderStatus;
    if (mpStatus === "rejected" || mpStatus === "cancelled")
      return ORDER_STATUS.CANCELLED as OrderStatus;
    return ORDER_STATUS.PENDING as OrderStatus;
  }

  async updateOrder(orderId: string, data: OrderUpdateData) {
    // Transactional consistency: Fetch and update to prevent race conditions (double decrement)
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: {
            include: { products: true },
          },
        },
      });

      if (!order) return null;

      const { shouldDecrement, shouldRestore, shouldShip } =
        determineUpdateActions(order, data.mappedStatus);

      // Actualizar estado — guard de idempotencia: solo si el estado cambió
      const { count: updatedCount } = await tx.orders.updateMany({
        where: { id: orderId, status: { not: data.mappedStatus } },
        data: {
          mpPaymentId: data.mpPaymentId,
          mpStatus: data.mpStatus,
          status: data.mappedStatus,
          updatedAt: new Date(),
        },
      });

      if (updatedCount === 0) {
        const existing = await tx.orders.findUnique({ where: { id: orderId } });
        return existing ? { order: existing, shouldShip: false } : null;
      }

      const updatedOrder = await tx.orders.findUniqueOrThrow({
        where: { id: orderId },
      });

      if (shouldDecrement) {
        await decrementOrderItemsStock(tx, order.order_items);
      }

      if (shouldRestore) {
        await restoreOrderItemsStock(tx, order.order_items, order.couponId);
      }

      return { order: updatedOrder, shouldShip };
    });
  }

  async createFromMetadata(
    mpPaymentId: string,
    mpStatus: string,
    mappedStatus: OrderStatus,
    preferenceId: string | undefined,
    metadata: OrderMetadata,
    paymentPayer: MercadoPagoPayer
  ) {
    // Fix: We now use "Order First" pattern, so tempOrderId passed in metadata IS the real order ID.
    // We should try to find that order first.
    const orderIdFromMetadata = metadata.tempOrderId as string;

    // 1. Try to find existing order by ID (Order First flow)
    if (orderIdFromMetadata) {
      const existingOrder = await prisma.orders.findUnique({
        where: { id: orderIdFromMetadata },
        include: { order_items: true },
      });

      if (existingOrder) {
        logger.info("[OrderService] Updating existing order from webhook", {
          orderId: existingOrder.id,
          mpPaymentId,
          status: mappedStatus,
        });

        // Use updateOrder logic but carefully mapping fields
        const updateData: OrderUpdateData = {
          mpPaymentId,
          mpStatus,
          mappedStatus,
        };

        // We reuse updateOrder to handle atomic stock decrement if needed
        return this.updateOrder(existingOrder.id, updateData);
      }
    }

    // 2. Fallback: Check if we already processed this payment ID (Idempotency)
    // (This handles retries of the SAME webhook)
    const existingPayment = await prisma.orders.findFirst({
      where: { mpPaymentId: mpPaymentId },
    });

    if (existingPayment) {
      return this.updateOrder(existingPayment.id, {
        mpPaymentId,
        mpStatus,
        mappedStatus,
      });
    }

    // 3. Fallback: Create from metadata (Legacy flow or if Order First failed silently?)
    // This part remains as failsafe if for some reason "Order First" transaction failed but user still got to MP (unlikely)
    logger.warn(
      "[OrderService] Order not found by ID, falling back to metadata creation",
      { orderId: orderIdFromMetadata }
    );

    // Logic to extract customer data (prioritizing metadata vs payer)
    const customerName: string =
      (metadata.customerName as string) ||
      (paymentPayer?.first_name && paymentPayer?.last_name
        ? `${paymentPayer.first_name} ${paymentPayer.last_name}`
        : paymentPayer?.first_name || "Cliente");

    const customerPhone: string =
      (metadata.customerPhone as string) || paymentPayer?.phone?.number || "";

    const customerAddress: string | undefined =
      metadata.customerAddress as string;
    const customerEmail: string | undefined =
      (metadata.customerEmail as string) || paymentPayer?.email;

    const {
      shippingStreet,
      shippingCity,
      shippingProvince,
      shippingPostalCode,
      shippingAgencyCode,
      shippingMethodId,
    } = extractShippingFromOrderMetadata(metadata);

    const metaItems = parseLegacyItems(metadata);
    if (metaItems.length === 0) {
      logger.warn("[OrderService] No items to create order", { mpPaymentId });
      throw new Error("No items found to create order");
    }

    const productIds = metaItems.map((i) => String(i.productId));
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true },
    });

    const discountPercent = Number(metadata.discountPercent || 0);
    const safeDiscount =
      isFinite(discountPercent) && discountPercent >= 0 && discountPercent <= 1
        ? discountPercent
        : 0;

    const orderItemsData = metaItems.map((it) => {
      const prod = dbProducts.find((p) => p.id === it.productId);
      if (!prod) throw new Error(`Product not found: ${it.productId}`);
      const unitPrice = Number(
        (Number(prod.price) * (1 - safeDiscount)).toFixed(2)
      );
      return {
        productId: prod.id,
        quantity: Number(it.quantity) || 1,
        unitPrice,
        price: unitPrice,
        size: it.size,
        color: it.color,
      };
    });

    const shippingCost = getLegacyShippingCost(metadata);
    const itemsTotal = orderItemsData.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const total = Number((itemsTotal + shippingCost).toFixed(2));

    const newOrder = await prisma.orders.create({
      data: {
        id:
          (metadata.tempOrderId as string) ||
          `ord_${mpPaymentId}_${Date.now()}`,
        customerName,
        customerPhone,
        customerAddress,
        customerEmail,
        total,
        shippingCost,
        status: mappedStatus,
        paymentMethod: "mercadopago",
        mpPaymentId,
        mpPreferenceId: preferenceId,
        mpStatus,
        shippingStreet,
        shippingCity,
        shippingProvince: shippingProvince,
        shippingProvinceCode: resolveProvinceCode(shippingProvince),
        shippingPostalCode: shippingPostalCode,
        shippingAgency: shippingAgencyCode,
        shippingMethod: shippingMethodId,
        updatedAt: new Date(),
        order_items: {
          create: orderItemsData.map((it) => ({
            id: `${mpPaymentId}-${it.productId}-${Date.now()}`,
            quantity: it.quantity,
            price: it.unitPrice,
            size: it.size,
            color: it.color,
            products: { connect: { id: it.productId } },
          })),
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (mappedStatus === ORDER_STATUS.PROCESSED) {
      await decrementLegacyOrderStock(newOrder.id, orderItemsData, mpPaymentId);
    }

    const isPickup =
      shippingMethodId === "pickup" ||
      (metadata.shipping as string) === "pickup";
    return {
      order: newOrder,
      shouldShip: mappedStatus === ORDER_STATUS.PROCESSED && !isPickup,
    };
  }

  async createCashOrder(
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      province?: string;
    },
    items: Array<{
      productId: string;
      quantity: number;
      price?: number;
      size?: string;
      color?: string;
    }>,
    _total: number, // Ignored — server recalculates
    shippingData?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      agency?: string;
      methodName?: string;
      cost?: number;
    },
    coupon?: CouponInput
  ) {
    const orderId = `ord_${nanoid(10)}`;
    const shippingCost = shippingData?.cost ?? 0;
    const settings = await getStoreSettings();
    const discountPercent = (settings.payments?.cashDiscount || 0) / 100;
    const expiresAt = add(new Date(), {
      hours: settings.payments?.cashExpirationHours || 72,
    });

    const order = await prisma.$transaction(async (tx) => {
      // 1+2. Fetch & validate items (price + stock check)
      const validatedItems = await validateAndPriceItems(
        tx,
        items,
        discountPercent
      );

      const { itemsTotal, couponDiscount, calculatedTotal } =
        calculateOrderTotals(validatedItems, shippingCost, coupon);

      logger.info("[OrderService] Creating CASH order", {
        orderId,
        itemsTotal,
        calculatedTotal,
        couponDiscount,
        discountPercent,
      });

      // 3. Create Order
      const newOrder = await tx.orders.create({
        data: {
          id: orderId,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          customerAddress: customer.address
            ? `${customer.address}, ${customer.city}, ${customer.province || ""}`
            : "",
          total: calculatedTotal,
          subtotal: itemsTotal,
          discount: couponDiscount,
          shippingCost: shippingCost,
          status: ORDER_STATUS.RESERVED as OrderStatus,
          paymentMethod: "cash",
          expiresAt: expiresAt,
          mpPaymentId: null,
          mpPreferenceId: null,
          mpStatus: "cash",
          updatedAt: new Date(),
          order_items: {
            create: buildOrderItemsCreate(orderId, validatedItems),
          },
          shippingStreet: shippingData?.street,
          shippingCity: shippingData?.city,
          shippingProvince: shippingData?.province,
          shippingPostalCode: shippingData?.postalCode,
          shippingAgency: shippingData?.agency,
          shippingMethod: shippingData?.methodName,
          couponId: coupon?.id ?? null,
        },
        include: { order_items: { include: { products: true } } },
      });

      // 4. Decrement stock (products + variants)
      await decrementVariantStock(tx, validatedItems);

      // 5. Incrementar usageCount del cupón (atómico)
      if (coupon) await incrementCouponUsage(tx, coupon.id);

      return newOrder;
    });

    // 6. Send Customer Email (async, non-blocking)
    sendCashOrderEmailAsync(order);

    return order;
  }

  /**
   * Creates a full order record in the database before payment processing.
   * This ensures faithful data persistence (customer details, shipping name, etc.)
   * independently of the payment gateway's metadata limitations.
   */
  async createFullOrder(
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      province?: string;
      postalCode?: string;
    },
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
    }>,
    shippingData: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      agency?: string;
      methodName?: string;
      cost: number;
    },
    paymentMethod: string = "mercadopago",
    coupon?: CouponInput
  ) {
    const orderId = `ord_${nanoid(10)}`;
    const settings = await getStoreSettings();
    const discountPercent = (settings.payments?.mpDiscount || 0) / 100;
    const expiresAt = add(new Date(), {
      minutes: settings.payments?.mpExpirationMinutes || 60,
    });

    const order = await prisma.$transaction(async (tx) => {
      // 1+2. Fetch & validate items (price + stock check)
      const validatedItems = await validateAndPriceItems(
        tx,
        items,
        discountPercent
      );

      const shippingCost = shippingData.cost ?? 0;
      const { itemsTotal, couponDiscount, calculatedTotal } =
        calculateOrderTotals(validatedItems, shippingCost, coupon);

      logger.info(
        "[OrderService] Creating full order (pre-payment) with reservation",
        {
          orderId,
          itemsTotal,
          shippingCost,
          calculatedTotal,
          couponDiscount,
          paymentMethod,
          discountPercent,
        }
      );

      // 3. Create Order
      const newOrder = await tx.orders.create({
        data: {
          id: orderId,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          customerAddress: customer.address
            ? `${customer.address}, ${customer.city}, ${customer.province || ""}`
            : "",
          total: calculatedTotal,
          subtotal: itemsTotal,
          discount: couponDiscount,
          shippingCost: shippingCost,
          status: ORDER_STATUS.PENDING_PAYMENT as OrderStatus,
          paymentMethod,
          paymentReminderSent: false,
          mpPaymentId: null,
          mpPreferenceId: null,
          mpStatus: "pending",
          shippingStreet: shippingData.street,
          shippingCity: shippingData.city,
          shippingProvince: shippingData.province,
          shippingProvinceCode: resolveProvinceCode(shippingData.province),
          shippingPostalCode: shippingData.postalCode,
          shippingAgency: shippingData.agency,
          shippingMethod: shippingData.methodName,
          updatedAt: new Date(),
          couponId: coupon?.id ?? null,
          order_items: {
            create: buildOrderItemsCreate(orderId, validatedItems),
          },
        },
        include: { order_items: { include: { products: true } } },
      });

      // 4. Decrement stock (products + variants)
      await decrementVariantStock(tx, validatedItems);

      // 5. Incrementar usageCount del cupón (atómico)
      if (coupon) await incrementCouponUsage(tx, coupon.id);

      return newOrder;
    });

    return order;
  }

  async createTransferOrder(
    customer: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      province?: string;
      postalCode?: string;
    },
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
    }>,
    shippingData: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      agency?: string;
      methodName?: string;
      cost: number;
    },
    coupon?: CouponInput
  ) {
    const orderId = `ord_${nanoid(10)}`;
    const settings = await getStoreSettings();
    const discountPercent = (settings.payments?.transferDiscount || 0) / 100;
    const expiresAt = add(new Date(), {
      hours: settings.payments?.transferExpirationHours || 48,
    });

    const order = await prisma.$transaction(async (tx) => {
      // 1+2. Fetch & validate items (price + stock check)
      const validatedItems = await validateAndPriceItems(
        tx,
        items,
        discountPercent
      );

      const shippingCost = shippingData.cost ?? 0;
      const { itemsTotal, couponDiscount, calculatedTotal } =
        calculateOrderTotals(validatedItems, shippingCost, coupon);

      logger.info("[OrderService] Creating TRANSFER order", {
        orderId,
        itemsTotal,
        shippingCost,
        calculatedTotal,
        couponDiscount,
        discountPercent,
      });

      // 3. Create Order
      const newOrder = await tx.orders.create({
        data: {
          id: orderId,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          customerAddress: customer.address
            ? `${customer.address}, ${customer.city}, ${customer.province || ""}`
            : "",
          total: calculatedTotal,
          subtotal: itemsTotal,
          discount: couponDiscount,
          shippingCost: shippingCost,
          status: ORDER_STATUS.WAITING_TRANSFER_PROOF as OrderStatus,
          paymentMethod: "transfer",
          expiresAt: expiresAt,
          mpPaymentId: null,
          mpPreferenceId: null,
          mpStatus: "transfer",
          shippingStreet: shippingData.street,
          shippingCity: shippingData.city,
          shippingProvince: shippingData.province,
          shippingProvinceCode: resolveProvinceCode(shippingData.province),
          shippingPostalCode: shippingData.postalCode,
          shippingAgency: shippingData.agency,
          shippingMethod: shippingData.methodName,
          updatedAt: new Date(),
          couponId: coupon?.id ?? null,
          order_items: {
            create: buildOrderItemsCreate(orderId, validatedItems),
          },
        },
        include: { order_items: { include: { products: true } } },
      });

      // 4. Decrement stock (products + variants)
      await decrementVariantStock(tx, validatedItems);

      // 5. Incrementar usageCount del cupón (atómico)
      if (coupon) await incrementCouponUsage(tx, coupon.id);

      return newOrder;
    });

    // Email de instrucciones de transferencia (async, non-blocking)
    sendTransferOrderEmailAsync(order);

    return order;
  }
}

export const orderService = new OrderService();
