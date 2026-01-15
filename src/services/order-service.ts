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

import { nanoid } from "nanoid";

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

      // 2. Determine if stock decrement is needed based on CURRENT db state
      // We only decrement if moving to PENDING_PAYMENT (Approved) from a non-approved state
      const isAlreadyPaid =
        order.status === ORDER_STATUS.PROCESSED ||
        order.status === ORDER_STATUS.RESERVED || // Reserved also implies stock held
        order.status === ORDER_STATUS.DELIVERED;

      // We decrement if we are moving to PROCESSED (Paid) and weren't already holding stock
      const shouldDecrement =
        data.mappedStatus === ORDER_STATUS.PROCESSED && !isAlreadyPaid;

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
    // FIX: Use nanoid for unique, collision-resistant ID (10 chars is sufficient for readable but unique orders)
    const orderId = `ord_${nanoid(10)}`;
    const shippingCost = shippingData?.cost ?? 0;

    // Context for emails
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let emailContext: any = null;

    // Use transaction to ensure stock is reserved/checked atomically
    const order = await prisma.$transaction(async (tx) => {
      // 1. Fetch products to validate prices and STOCK
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          price: true,
          salePrice: true,
          onSale: true,
          name: true,
          stock: true,
        },
      });

      // 2. Validate Items & Stock
      const validatedItems = items.map((item) => {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        if (!dbProduct) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        // Stock Check
        if (dbProduct.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${dbProduct.name} (Disponible: ${dbProduct.stock})`
          );
        }

        // Price Logic
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

      // Save context
      emailContext = { validatedItems, dbProducts };

      // 3. Calculate Total
      const itemsTotal = validatedItems.reduce(
        (sum, i) => sum + Number(i.price) * i.quantity,
        0
      );
      const calculatedTotal = Number((itemsTotal + shippingCost).toFixed(2));

      logger.info("[OrderService] Creating cash order with stock reservation", {
        orderId,
        itemsTotal,
        calculatedTotal,
      });

      // 4. Create Order
      const order = await tx.orders.create({
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
          // Status: RESERVED - Explicitly means "Stock Held, Waiting for Pickup/Payment"
          status: ORDER_STATUS.RESERVED as OrderStatus,
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

      // 5. Decrement Stock
      for (const item of validatedItems) {
        await tx.products.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    // 6. Send Emails (Fire and forget, don't block response)
    if (emailContext) {
      const { validatedItems, dbProducts } = emailContext;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emailItems = validatedItems.map((i: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prod = dbProducts.find((p: any) => p.id === i.productId);
        return {
          name: prod?.name || "Producto",
          quantity: i.quantity,
          price: i.price,
          color: i.color,
          size: i.size,
        };
      });

      // Send Customer Email
      emailService.sendOrderConfirmation(
        {
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail || "",
          total: Number(order.total),
        },
        emailItems
      );

      // Send Admin Alert with full customer details
      getStoreSettings().then((settings) => {
        if (settings.adminEmail) {
          emailService.sendAdminNewOrderAlert(
            {
              id: order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail || "",
              customerPhone: order.customerPhone || "",
              customerAddress: order.customerAddress || "",
              total: Number(order.total),
            },
            emailItems,
            settings.adminEmail
          );
        }
      });
    }

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

      // Dynamic Stock Alerts Logic
      // We check if the product falls into a status configured as 'error' or 'warning'
      const { stockStatuses } = settings;

      // Get distinct product IDs
      const productIds = [
        ...new Set(items.map((i) => i.productId || i.products?.id)),
      ].filter(Boolean);

      const products = await prisma.products.findMany({
        where: { id: { in: productIds as string[] } },
        select: { id: true, name: true, stock: true },
      });

      for (const p of products) {
        // Find matching rule
        const status = stockStatuses.find(
          (s) =>
            p.stock >= s.min &&
            (s.max === null || s.max === undefined || p.stock <= s.max)
        );

        // If status exists and indicates a warning/error (low stock), send alert
        if (
          status &&
          (status.color === "error" || status.color === "warning")
        ) {
          // Prevent spamming if already alerted? (Currently system doesn't track alert state per product, relies on trigger event)
          await emailService.sendLowStockAlert(
            p.name,
            p.stock,
            p.id,
            settings.adminEmail
          );
          logger.info(
            `[StockAlert] Sent alert for ${p.name} (Stock: ${p.stock}, Status: ${status.label})`
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
    // FIX: Use nanoid for unique ID
    const orderId = `ord_${nanoid(10)}`;

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
          ? Number(dbProduct.salePrice)
          : Number(dbProduct.price);

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
        // Status: PENDING_PAYMENT (Explicitly waiting for payment, stock NOT reserved)
        status: ORDER_STATUS.PENDING_PAYMENT as OrderStatus,
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
