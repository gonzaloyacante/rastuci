import { OrderStatus, Prisma } from "@prisma/client";
import { add } from "date-fns";
import { nanoid } from "nanoid";

import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/resend";
import { getStoreSettings } from "@/lib/store-settings";
import { MercadoPagoPayer, OrderItemInput } from "@/types";

import {
  calculateCouponDiscount,
  type CouponInput,
  decrementCouponUsage,
  decrementVariantStock,
  incrementCouponUsage,
  resolveProvinceCode,
  validateAndPriceItems,
} from "./order-helpers";

export interface OrderMetadata {
  tempOrderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerProvince?: string;
  customerPostalCode?: string;
  shippingAgencyCode?: string;
  shippingMethodId?: string;
  shippingMethodName?: string;
  shippingCost?: string | number;
  items: string | OrderItemInput[];
  discountPercent?: string | number;
  shipping?: string;
}

export type OrderUpdateData = {
  mpPaymentId: string;
  mpStatus: string;
  mappedStatus: OrderStatus;
};

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
      // 1. Lock/Fetch current order state
      const order = await tx.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
        },
      });

      if (!order) return null;
      // PENDING_PAYMENT orders already had stock decremented at createFullOrder time.
      // Only decrement here for orders that did NOT pre-reserve stock (legacy/metadata fallback).
      const isStockAlreadyReserved =
        order.status === ORDER_STATUS.PROCESSED ||
        order.status === ORDER_STATUS.RESERVED || // Cash: stock held at creation
        order.status === ORDER_STATUS.PENDING_PAYMENT || // MP: stock held at createFullOrder
        order.status === ORDER_STATUS.DELIVERED;

      // We decrement if we are moving to PROCESSED (Paid) and stock wasn't already held
      const shouldDecrement =
        data.mappedStatus === ORDER_STATUS.PROCESSED && !isStockAlreadyReserved;

      // Restore stock when cancelling an order that had stock pre-reserved at creation time
      // (PENDING_PAYMENT = MP pre-reserve, RESERVED = cash/transfer pre-reserve)
      const shouldRestore =
        (data.mappedStatus as string) === ORDER_STATUS.CANCELLED &&
        (order.status === ORDER_STATUS.PENDING_PAYMENT ||
          order.status === ORDER_STATUS.RESERVED);

      // Ship/notify on last transition to PROCESSED (independent of stock action)
      const isFirstApproval =
        data.mappedStatus === ORDER_STATUS.PROCESSED &&
        order.status !== ORDER_STATUS.PROCESSED &&
        order.status !== ORDER_STATUS.DELIVERED;

      // 3. Update Order Status — guard de idempotencia: solo actualiza si el estado cambió
      const { count: updatedCount } = await tx.orders.updateMany({
        where: { id: orderId, status: { not: data.mappedStatus } },
        data: {
          mpPaymentId: data.mpPaymentId,
          mpStatus: data.mpStatus,
          status: data.mappedStatus,
          updatedAt: new Date(),
        },
      });

      // Si no se actualizó, ya estaba en este estado (webhook duplicado) — retornar sin efecto
      if (updatedCount === 0) {
        const existing = await tx.orders.findUnique({ where: { id: orderId } });
        return existing ? { order: existing, shouldShip: false } : null;
      }

      // Recargar para tener el registro actualizado
      const updatedOrder = await tx.orders.findUniqueOrThrow({
        where: { id: orderId },
      });

      // 4. Handle Stock Decrement (Atomic within transaction)
      if (shouldDecrement) {
        for (const item of order.order_items) {
          // Check stock before decrementing to avoid negative stock errors
          // Note: We use updateMany or standard update.
          // Since we are inside a transaction, if this fails, the whole order update rolls back.
          // This is desired: we don't want to mark an order as PAID if we can't fulfill it.
          const product = await tx.products.findUnique({
            where: { id: item.productId },
            select: { stock: true, name: true },
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para ${product?.name ?? "producto"}`
            );
          }

          await tx.products.update({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          // Also decrement variant stock if the item specifies a variant
          if (item.color && item.size) {
            await tx.product_variants.updateMany({
              where: {
                productId: item.productId,
                color: item.color,
                size: item.size,
                stock: { gte: item.quantity },
              },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }

      // 4b. Restore Stock for cancelled pre-reserved orders (atomic within transaction)
      if (shouldRestore) {
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          if (item.color && item.size) {
            await tx.product_variants.updateMany({
              where: {
                productId: item.productId,
                color: item.color,
                size: item.size,
              },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // 4c. Restore coupon usage if order had a coupon applied
        if (order.couponId) {
          await decrementCouponUsage(tx, order.couponId);
        }
      }

      // 5. Return context for shipment/notifications
      // Use isFirstApproval (not shouldDecrement) so MP orders in PENDING_PAYMENT
      // correctly trigger shipment and notifications on payment approval.
      const isPickup = order.shippingMethod === "pickup";
      const shouldShip = isFirstApproval && !isPickup;

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

    // ... (rest of imports/methods until createFromMetadata)

    // In createFromMetadata:

    // Shipping fields
    const shippingStreet =
      typeof metadata.customerAddress === "string"
        ? metadata.customerAddress
        : undefined;
    const shippingCity =
      typeof metadata.customerCity === "string"
        ? metadata.customerCity
        : undefined;
    const shippingProvince =
      typeof metadata.customerProvince === "string"
        ? metadata.customerProvince
        : undefined;
    const shippingPostalCode =
      typeof metadata.customerPostalCode === "string"
        ? metadata.customerPostalCode
        : undefined;
    const shippingAgencyCode =
      typeof metadata.shippingAgencyCode === "string"
        ? metadata.shippingAgencyCode
        : undefined;

    // Fix: Prioritize shippingMethodName if available for clear display, fallback to ID
    const shippingMethodId =
      typeof metadata.shippingMethodName === "string"
        ? metadata.shippingMethodName
        : typeof metadata.shippingMethodId === "string"
          ? metadata.shippingMethodId
          : undefined;

    // Items parsing
    let metaItems: OrderItemInput[] = [];
    if (Array.isArray(metadata.items)) {
      metaItems = metadata.items;
    } else if (typeof metadata.items === "string") {
      try {
        metaItems = JSON.parse(metadata.items);
        if (!Array.isArray(metaItems)) metaItems = [];
      } catch (e) {
        logger.error("[OrderService] Failed to parse items", { error: e });
      }
    }

    if (metaItems.length === 0) {
      logger.warn("[OrderService] No items to create order", { mpPaymentId });
      throw new Error("No items found to create order");
    }

    // Fetch products for price security
    const productIds = metaItems.map((i: { productId: string }) =>
      String(i.productId)
    );
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true },
    });

    const discountPercent = Number(metadata.discountPercent || 0);
    const safeDiscount =
      isFinite(discountPercent) && discountPercent >= 0 && discountPercent <= 1
        ? discountPercent
        : 0;

    const orderItemsData = metaItems.map(
      (it: {
        productId: string;
        quantity: number | string;
        size?: string;
        color?: string;
      }) => {
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
      }
    );

    // Shipping Cost Logic
    let shippingCost = 0;
    const shippingId = metadata.shipping as string | undefined;

    // 1. Try to get explicit shipping cost from metadata (passed from checkout)
    if (metadata.shippingCost !== undefined && metadata.shippingCost !== null) {
      shippingCost = Number(metadata.shippingCost);
    } else if (shippingId) {
      // 2. Fallback to old ID-based lookup if cost not provided
      const shippingMap: Record<string, { name: string; price: number }> = {
        pickup: { name: "Retiro en tienda", price: 0 },
        standard: { name: "Envío estándar", price: 1500 },
        express: { name: "Envío express", price: 2500 },
      };
      shippingCost = shippingMap[shippingId]?.price ?? 0;
    }

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
        shippingCost, // Persist shipping cost
        status: mappedStatus,
        mpPaymentId,
        mpPreferenceId: preferenceId,
        mpStatus,
        shippingStreet,
        shippingCity,
        shippingProvince: shippingProvince,
        shippingProvinceCode: resolveProvinceCode(shippingProvince),
        shippingPostalCode: shippingPostalCode,
        shippingAgency: shippingAgencyCode,
        shippingMethod: shippingMethodId, // Saved correctly now
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

    // Stock decrement logic
    const shouldDecrement = mappedStatus === ORDER_STATUS.PROCESSED;

    if (shouldDecrement) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const it of orderItemsData) {
            await tx.products.update({
              where: {
                id: it.productId,
                stock: { gte: Number(it.quantity) },
              },
              data: { stock: { decrement: Number(it.quantity) } },
            });
          }
        });
      } catch (error) {
        // Critical: If stock decrement fails after Payment Approved, we have a problem.
        logger.error(
          "CRITICAL: Payment Approved but Stock Decrement FAILED (Race Condition)",
          {
            mpPaymentId,
            orderId: newOrder.id,
            error,
          }
        );
        // Flag the order for manual admin review instead of silently overselling.
        // We do NOT re-throw (would cause webhook retries and duplicate orders).
        try {
          await prisma.orders.update({
            where: { id: newOrder.id },
            data: {
              status: ORDER_STATUS.PAYMENT_REVIEW,
              caImportError: `Stock decrement failed (race condition) — manual review required: ${String(error)}`,
            },
          });
          logger.warn(
            "[OrderService] Order flagged PAYMENT_REVIEW due to stock decrement failure",
            { orderId: newOrder.id, mpPaymentId }
          );
        } catch (updateErr) {
          logger.error(
            "CRITICAL: Could not flag order for manual review after stock failure",
            { orderId: newOrder.id, mpPaymentId, updateErr }
          );
        }
      }
    }

    const isPickup = shippingMethodId === "pickup" || shippingId === "pickup";
    return { order: newOrder, shouldShip: shouldDecrement && !isPickup };
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

      const itemsTotal = validatedItems.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0
      );

      const couponDiscount = calculateCouponDiscount(itemsTotal, coupon);
      const calculatedTotal = Number(
        (itemsTotal + shippingCost - couponDiscount).toFixed(2)
      );

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
            create: validatedItems.map((item) => ({
              id: `${orderId}_${item.productId}_${nanoid(8)}`,
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
              color: item.color || null,
              products: { connect: { id: item.productId } },
            })),
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
    const emailItems = (order.order_items ?? []).map((oi) => ({
      productId: oi.productId,
      quantity: oi.quantity,
      price: Number(oi.price),
      name: oi.products?.name ?? "Producto",
      size: oi.size ?? undefined,
      color: oi.color ?? undefined,
    }));
    // Email al cliente (async, non-blocking - errores se loguean pero no bloquean la respuesta)
    emailService
      .sendOrderConfirmation(
        {
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail || "",
          total: Number(order.total),
          subtotal: order.subtotal ? Number(order.subtotal) : undefined,
          discount: order.discount ? Number(order.discount) : undefined,
          shippingCost: order.shippingCost
            ? Number(order.shippingCost)
            : undefined,
        },
        emailItems
      )
      .catch((err: unknown) =>
        logger.error(
          "[OrderService] Error enviando email de confirmación de orden:",
          { err, orderId: order.id }
        )
      );

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

      const itemsTotal = validatedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const shippingCost = shippingData.cost ?? 0;
      const couponDiscount = calculateCouponDiscount(itemsTotal, coupon);
      const calculatedTotal = Number(
        (itemsTotal + shippingCost - couponDiscount).toFixed(2)
      );

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
          paymentMethod: "mercadopago",
          expiresAt: expiresAt,
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
            create: validatedItems.map((item) => ({
              id: `${orderId}_${item.productId}_${nanoid(8)}`,
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
              color: item.color || null,
              products: { connect: { id: item.productId } },
            })),
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

      const itemsTotal = validatedItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const shippingCost = shippingData.cost ?? 0;
      const couponDiscount = calculateCouponDiscount(itemsTotal, coupon);
      const calculatedTotal = Number(
        (itemsTotal + shippingCost - couponDiscount).toFixed(2)
      );

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
            create: validatedItems.map((item) => ({
              id: `${orderId}_${item.productId}_${nanoid(8)}`,
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
              color: item.color || null,
              products: { connect: { id: item.productId } },
            })),
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
    if (order.customerEmail) {
      emailService
        .sendBankTransferInstructions({
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          total: Number(order.total),
        })
        .catch((err: unknown) =>
          logger.error(
            "[OrderService] Error enviando instrucciones de transferencia:",
            { err, orderId: order.id }
          )
        );
    }

    return order;
  }
}

export const orderService = new OrderService();
