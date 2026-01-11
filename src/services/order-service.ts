import prisma from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { OrderStatus } from "@prisma/client";
import { getStoreSettings } from "@/lib/store-settings";
import { emailService } from "@/lib/resend";
import { OrderItemInput, MercadoPagoPayer } from "@/types";
import { PROVINCIAS, ProvinceCode } from "@/lib/constants";

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
    if (mpStatus === "approved")
      return ORDER_STATUS.PENDING_PAYMENT as OrderStatus;
    if (mpStatus === "in_process" || mpStatus === "pending")
      return ORDER_STATUS.PENDING as OrderStatus;
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

      // 2. Determine if stock decrement is needed based on CURRENT db state
      // We only decrement if moving to PENDING_PAYMENT (Approved) from a non-approved state
      const isAlreadyPaid =
        order.status === ORDER_STATUS.PENDING_PAYMENT ||
        order.status === ORDER_STATUS.PROCESSED ||
        order.status === ORDER_STATUS.DELIVERED;

      const shouldDecrement =
        data.mappedStatus === ORDER_STATUS.PENDING_PAYMENT && !isAlreadyPaid;

      // 3. Update Order Status
      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          mpPaymentId: data.mpPaymentId,
          mpStatus: data.mpStatus,
          status: data.mappedStatus,
          updatedAt: new Date(),
        },
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
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 5. Return context for shipment/notifications
      // Use logic similar to before but with updated order object
      const isPickup = order.shippingMethod === "pickup";
      const shouldShip = shouldDecrement && !isPickup;

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
    let shippingCost = 0;
    const shippingId = metadata.shipping as string | undefined;

    // 1. Try to get explicit shipping cost from metadata (passed from checkout)
    if (metadata.shippingCost !== undefined && metadata.shippingCost !== null) {
      shippingCost = Number(metadata.shippingCost);
    } else {
      // 2. Fallback to old ID-based lookup if cost not provided
      const shippingId = metadata.shipping as string | undefined;
      if (shippingId) {
        const shippingMap: Record<string, { name: string; price: number }> = {
          pickup: { name: "Retiro en tienda", price: 0 },
          standard: { name: "Envío estándar", price: 1500 },
          express: { name: "Envío express", price: 2500 },
        };
        shippingCost = shippingMap[shippingId]?.price ?? 0;
      }
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
        shippingProvinceCode: (() => {
          if (!shippingProvince) return null;
          const normalized = shippingProvince
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          // Check strict match first
          const match = PROVINCIAS.find(
            (p) =>
              p.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === normalized
          );
          if (match) return match.code;
          // Heuristic for CABA
          if (normalized.includes("capital") || normalized.includes("caba"))
            return "C";
          // If no match, return null and let ShipmentService guess by CP
          return null;
        })(),
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
    const shouldDecrement = mappedStatus === ORDER_STATUS.PENDING_PAYMENT;

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
        // We log clearly. In a real system, we'd trigger an auto-refund or "Manual Review" flag.
        logger.error(
          "CRITICAL: Payment Approved but Stock Decrement FAILED (Race Condition)",
          {
            mpPaymentId,
            error,
          }
        );
        // Note: We do NOT throw here because the Order IS created and Paid.
        // We accept the "Overselling" risk rather than crashing the webhook (which would retry and duplicate).
        // The admin must resolve this manually.
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

  /**
   * Check if any item in the order has triggered a low stock alert
   */
  private async checkStockAlerts(
    items: Array<{ productId: string; products?: { id: string } }>
  ) {
    try {
      const settings = await getStoreSettings();
      if (!settings.stock.enableStockAlerts) return;

      const threshold = settings.stock.lowStockThreshold;

      // Get distinct product IDs
      const productIds = [
        ...new Set(items.map((i) => i.productId || i.products?.id)),
      ].filter(Boolean);

      const products = await prisma.products.findMany({
        where: { id: { in: productIds as string[] } },
        select: { id: true, name: true, stock: true },
      });

      for (const p of products) {
        if (p.stock <= threshold) {
          await emailService.sendLowStockAlert(
            p.name,
            p.stock,
            p.id,
            settings.adminEmail
          );
          logger.info(
            `[StockAlert] Sent alert for ${p.name} (Stock: ${p.stock})`
          );
        }
      }
    } catch (error) {
      logger.error("[StockAlert] Error processing alerts", { error });
    }
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
    paymentMethod: string = "mercadopago"
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
    const shippingCost = shippingData.cost ?? 0;
    const calculatedTotal = Number((itemsTotal + shippingCost).toFixed(2));

    logger.info("[OrderService] Creating full order (pre-payment)", {
      orderId,
      itemsTotal,
      shippingCost,
      calculatedTotal,
      paymentMethod,
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
        status: ORDER_STATUS.PENDING as OrderStatus,
        mpPaymentId: null, // Will be filled by webhook
        mpPreferenceId: null, // Will be filled by preference route response if needed, or webhook
        mpStatus: "pending",
        shippingStreet: shippingData.street,
        shippingCity: shippingData.city,
        shippingProvince: shippingData.province,
        shippingProvinceCode: (() => {
          if (!shippingData.province) return null;
          const normalized = shippingData.province
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const match = PROVINCIAS.find(
            (p) =>
              p.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") === normalized
          );
          if (match) return match.code;
          if (normalized.includes("capital") || normalized.includes("caba"))
            return "C";
          return null;
        })(),
        shippingPostalCode: shippingData.postalCode,
        shippingAgency: shippingData.agency,
        shippingMethod: shippingData.methodName, // The critical fix
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
