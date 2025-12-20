import prisma from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { OrderStatus } from "@prisma/client";

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
  items: string | any[]; // Kept loose for parsing but stricter than 'any'
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
    if (mpStatus === "approved")
      return ORDER_STATUS.PENDING_PAYMENT as OrderStatus;
    if (mpStatus === "in_process" || mpStatus === "pending")
      return ORDER_STATUS.PENDING as OrderStatus;
    return ORDER_STATUS.PENDING as OrderStatus;
  }

  async updateOrder(orderId: string, data: OrderUpdateData) {
    const order = await prisma.orders.findUnique({
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

    // Update status
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        mpPaymentId: data.mpPaymentId,
        mpStatus: data.mpStatus,
        status: data.mappedStatus,
        updatedAt: new Date(),
      },
    });

    // Handle Stock Decrement
    const shouldDecrement =
      data.mappedStatus === ORDER_STATUS.PENDING_PAYMENT &&
      order.status !== ORDER_STATUS.PENDING_PAYMENT &&
      order.status !== ORDER_STATUS.PROCESSED &&
      order.status !== ORDER_STATUS.DELIVERED;

    if (shouldDecrement) {
      for (const item of order.order_items) {
        await prisma.products.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Handle CA Shipment Creation logic availability
    // Note: Actual shipment creation calls should be done by the controller/webhook using ShipmentService
    // We return a flag indicating if it should be attempted.
    if (shouldDecrement && data.mappedStatus === ORDER_STATUS.PENDING_PAYMENT) {
      return { order, shouldShip: true };
    }

    return { order, shouldShip: false };
  }

  async createFromMetadata(
    mpPaymentId: string,
    mpStatus: string,
    mappedStatus: OrderStatus,
    preferenceId: string | undefined,
    metadata: OrderMetadata,
    paymentPayer: any
  ) {
    // Idempotency check
    const existing = await prisma.orders.findFirst({
      where: { mpPaymentId: mpPaymentId },
    });
    if (existing) {
      return this.updateOrder(existing.id, {
        mpPaymentId,
        mpStatus,
        mappedStatus,
      });
    }

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
    const shippingMethodId =
      typeof metadata.shippingMethodId === "string"
        ? metadata.shippingMethodId
        : undefined;

    // Items parsing
    let metaItems: any[] = [];
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
        const unitPrice = Number((prod.price * (1 - safeDiscount)).toFixed(2));
        return {
          productId: prod.id,
          quantity: Number(it.quantity) || 1,
          unitPrice,
          size: it.size,
          color: it.color,
        };
      }
    );

    // Shipping Cost Logic
    const shippingId = metadata.shipping as string | undefined;
    let shippingCost = 0;
    if (shippingId) {
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
        status: mappedStatus,
        mpPaymentId,
        mpPreferenceId: preferenceId,
        mpStatus,
        shippingStreet,
        shippingCity,
        shippingProvince,
        shippingPostalCode,
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

    // Stock decrement logic
    const shouldDecrement = mappedStatus === ORDER_STATUS.PENDING_PAYMENT;

    if (shouldDecrement) {
      for (const it of orderItemsData) {
        await prisma.products.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }
    }

    return { order: newOrder, shouldShip: shouldDecrement };
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
    _total: number, // Ignored - we calculate server-side
    shippingData?: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      agency?: string;
      methodName?: string;
      cost?: number;
    }
  ) {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // SECURITY: Fetch product prices from database to prevent price manipulation
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, salePrice: true, onSale: true },
    });

    // Build validated order items with DB prices
    const validatedItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      // Use sale price if product is on sale, otherwise regular price
      const unitPrice =
        dbProduct.onSale && dbProduct.salePrice
          ? dbProduct.salePrice
          : dbProduct.price;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
        size: item.size,
        color: item.color,
      };
    });

    // Calculate total server-side
    const itemsTotal = validatedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const shippingCost = shippingData?.cost ?? 0;
    const calculatedTotal = Number((itemsTotal + shippingCost).toFixed(2));

    logger.info("[OrderService] Creating cash order with validated prices", {
      orderId,
      itemsTotal,
      shippingCost,
      calculatedTotal,
    });

    const order = await prisma.orders.create({
      data: {
        id: orderId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address
          ? `${customer.address}, ${customer.city}, ${customer.province || ""}`
          : "",
        total: calculatedTotal,
        shippingCost: shippingCost,
        // Using strict enum types
        status: ORDER_STATUS.PENDING as OrderStatus,
        mpPaymentId: null,
        mpPreferenceId: null,
        mpStatus: "cash_payment",
        updatedAt: new Date(),
        order_items: {
          create: validatedItems.map((item) => ({
            id: `${orderId}_${item.productId}_${Date.now()}`,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
            products: {
              connect: { id: item.productId },
            },
          })),
        },
        shippingStreet: shippingData?.street,
        shippingCity: shippingData?.city,
        shippingProvince: shippingData?.province,
        shippingPostalCode: shippingData?.postalCode,
        shippingAgency: shippingData?.agency,
        shippingMethod: shippingData?.methodName,
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });
    return order;
  }
}

export const orderService = new OrderService();
