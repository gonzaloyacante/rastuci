/**
 * order-helpers.ts — Funciones auxiliares extraídas de OrderService.
 * Ninguna de estas funciones usa `this`, por lo que pueden vivir como
 * funciones de módulo reutilizables e individualmente testeables.
 */
import { OrderStatus, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

import { invalidateProductCache } from "@/lib/cache";
import { ORDER_STATUS, PROVINCIAS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/resend";
import { getStoreSettings } from "@/lib/store-settings";
import { formatCurrency } from "@/utils/formatters";

import type {
  CouponInput,
  OrderMetadata,
  ShippingFields,
  ValidatedOrderItem,
} from "./order-service.types";

export type { CouponInput, ValidatedOrderItem } from "./order-service.types";

export function resolveProvinceCode(
  province: string | undefined
): string | null {
  if (!province) return null;
  const normalized = province
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
  if (normalized.includes("capital") || normalized.includes("caba")) return "C";
  return null;
}

export async function validateAndPriceItems(
  tx: Prisma.TransactionClient,
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>,
  discountPercent: number
): Promise<ValidatedOrderItem[]> {
  const productIds = items.map((i) => i.productId);
  const dbProducts = await tx.products.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: {
      id: true,
      price: true,
      salePrice: true,
      onSale: true,
      stock: true,
      name: true,
    },
  });
  return Promise.all(
    items.map(async (item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct)
        throw new Error(`Producto no encontrado: ${item.productId}`);
      if (dbProduct.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${dbProduct.name} (Disponible: ${dbProduct.stock})`
        );
      }
      if (item.color && item.size) {
        const variant = await tx.product_variants.findFirst({
          where: {
            productId: item.productId,
            color: item.color,
            size: item.size,
          },
          select: { stock: true },
        });
        if (!variant) {
          throw new Error(
            `La variante ${item.color}/${item.size} de ${dbProduct.name} ya no está disponible`
          );
        }
        if (variant.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${dbProduct.name} talle ${item.size} color ${item.color}`
          );
        }
      }
      const basePrice =
        dbProduct.onSale && dbProduct.salePrice
          ? Number(dbProduct.salePrice)
          : Number(dbProduct.price);
      const price = Number((basePrice * (1 - discountPercent)).toFixed(2));
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        originalPrice: basePrice,
        size: item.size,
        color: item.color,
      };
    })
  );
}

export function calculateCouponDiscount(
  itemsTotal: number,
  coupon: CouponInput | undefined
): number {
  if (!coupon) return 0;
  if (coupon.minOrderTotal !== null && itemsTotal < coupon.minOrderTotal) {
    throw new Error(
      `El monto mínimo para usar este cupón es ${formatCurrency(Number(coupon.minOrderTotal))}`
    );
  }
  if (coupon.discountType === "PERCENTAGE") {
    return Number(((itemsTotal * coupon.discount) / 100).toFixed(2));
  }
  return Math.min(coupon.discount, itemsTotal);
}

export async function decrementVariantStock(
  tx: Prisma.TransactionClient,
  items: ValidatedOrderItem[]
): Promise<void> {
  const affectedProducts = new Set<string>();
  for (const item of items) {
    await tx.products.update({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    affectedProducts.add(item.productId);
    if (item.color && item.size) {
      const variantResult = await tx.product_variants.updateMany({
        where: {
          productId: item.productId,
          color: item.color,
          size: item.size,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (variantResult.count === 0) {
        const variantExists = await tx.product_variants.findFirst({
          where: {
            productId: item.productId,
            color: item.color,
            size: item.size,
          },
          select: { stock: true },
        });
        if (variantExists !== null) {
          throw new Error(
            `Stock insuficiente para la variante ${item.color}/${item.size}`
          );
        }
      }
    }
  }

  // Invalidate product cache for affected products so public lists reflect stock changes
  try {
    for (const pid of affectedProducts) {
      invalidateProductCache(pid);
    }
  } catch (e) {
    logger.warn("invalidateProductCache failed in decrementVariantStock", {
      error: e,
    });
  }
}

export async function incrementCouponUsage(
  tx: Prisma.TransactionClient,
  couponId: string
): Promise<void> {
  const affected = await tx.$executeRaw`
    UPDATE coupons
    SET "usageCount" = "usageCount" + 1
    WHERE id = ${couponId}
      AND ("usageLimit" IS NULL OR "usageCount" < "usageLimit")
  `;
  if (affected === 0) {
    throw new Error("El cupón ha alcanzado su límite de usos");
  }
}

export async function decrementCouponUsage(
  tx: Prisma.TransactionClient,
  couponId: string
): Promise<void> {
  await tx.$executeRaw`
    UPDATE coupons
    SET "usageCount" = GREATEST("usageCount" - 1, 0)
    WHERE id = ${couponId}
  `;
}

/** @internal Determina si un producto está en estado de stock bajo o critico. */
function isLowStockStatus(
  productStock: number,
  stockStatuses: Array<{ min: number; max?: number | null; color: string }>
): boolean {
  const status = stockStatuses.find(
    (s) => productStock >= s.min && (s.max == null || productStock <= s.max)
  );
  return !!status && (status.color === "error" || status.color === "warning");
}

/**
 * Verifica si algún item quedó con stock bajo y envía alertas de email.
 * Función async fire-and-forget — los errores se capturan internamente.
 */
export async function checkStockAlerts(
  items: Array<{ productId: string; products?: { id: string } }>
): Promise<void> {
  try {
    const settings = await getStoreSettings();
    if (!settings.stock.enableStockAlerts) return;

    const productIds = [
      ...new Set(items.map((i) => i.productId || i.products?.id)),
    ].filter(Boolean);

    const products = await prisma.products.findMany({
      where: { id: { in: productIds as string[] } },
      select: { id: true, name: true, stock: true, lowStockAlertedAt: true },
    });

    const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
    const now = new Date();

    for (const p of products) {
      if (!isLowStockStatus(p.stock, settings.stockStatuses)) continue;

      // Dedup: no reenviar alerta si ya se envió dentro de las últimas 24 hs
      // Aseguramos el tipo antes de llamar `getTime` para evitar errores de TS
      const alertedAt = p.lowStockAlertedAt as unknown as Date | null;
      if (
        alertedAt &&
        now.getTime() - alertedAt.getTime() < ALERT_COOLDOWN_MS
      ) {
        continue;
      }

      await emailService.sendLowStockAlert(
        p.name,
        p.stock,
        p.id,
        settings.adminEmail || "admin@rastuci.com"
      );

      // Registrar timestamp de alerta para cooldown
      await prisma.products.update({
        where: { id: p.id },
        data: { lowStockAlertedAt: now },
      });

      logger.info(`[StockAlert] Sent alert for ${p.name} (Stock: ${p.stock})`);
    }
  } catch (error) {
    logger.error("[StockAlert] Error processing alerts", { error });
  }
}

// ─── Nuevos helpers para reducir CCN en OrderService ──────────────────────────

/** Tipo mínimo para manipular stock de items de una orden existente. */
type OrderItemForStock = {
  productId: string;
  quantity: number;
  color: string | null;
  size: string | null;
};

/** Tipo mínimo para una orden con datos de email. */
type EmailableOrder = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  total: Prisma.Decimal | number | string;
  subtotal?: Prisma.Decimal | number | string | null;
  discount?: Prisma.Decimal | number | string | null;
  shippingCost?: Prisma.Decimal | number | string | null;
  paymentMethod?: string | null;
  shippingMethod?: string | null;
  order_items?: Array<{
    productId: string;
    quantity: number;
    price: Prisma.Decimal | number | string;
    products?: { name: string } | null;
    size: string | null;
    color: string | null;
  }>;
};

/** Tipo mínimo de un item en metadata de MP legacy. */
export type LegacyOrderItemInput = {
  productId: string;
  quantity: number | string;
  size?: string;
  color?: string;
};

/**
 * Calcula los totales de la orden: subtotal de items, descuento de cupón y total final.
 */
export function calculateOrderTotals(
  validatedItems: ValidatedOrderItem[],
  shippingCost: number,
  coupon?: CouponInput
): { itemsTotal: number; couponDiscount: number; calculatedTotal: number } {
  const itemsTotal = validatedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const couponDiscount = calculateCouponDiscount(itemsTotal, coupon);
  const calculatedTotal = Number(
    (itemsTotal + shippingCost - couponDiscount).toFixed(2)
  );
  return { itemsTotal, couponDiscount, calculatedTotal };
}

/**
 * Construye el array `order_items.create` de Prisma para una nueva orden.
 */
export function buildOrderItemsCreate(
  orderId: string,
  validatedItems: ValidatedOrderItem[]
) {
  return validatedItems.map((item) => ({
    id: `${orderId}_${item.productId}_${nanoid(8)}`,
    quantity: item.quantity,
    price: item.price,
    size: item.size || null,
    color: item.color || null,
    products: { connect: { id: item.productId } },
  }));
}

/**
 * Determina las acciones de stock y notificación a tomar en updateOrder.
 * Extraído para reducir CCN del método principal.
 */
export function determineUpdateActions(
  order: { status: OrderStatus; shippingMethod: string | null },
  mappedStatus: OrderStatus
): {
  shouldDecrement: boolean;
  shouldRestore: boolean;
  isFirstApproval: boolean;
  shouldShip: boolean;
} {
  // States where stock is already held (decremented at order creation).
  // Each payment method decrements stock immediately:
  //   MP → PENDING_PAYMENT (createFullOrder pre-decrements)
  //   Cash → RESERVED (createCashOrder pre-decrements)
  //   Transfer → WAITING_TRANSFER_PROOF (createTransferOrder pre-decrements)
  // Subsequent transitions from any of these must NOT decrement again.
  // CANCELLED is excluded because stock is restored when an order is cancelled.
  const STOCK_HELD = new Set<string>([
    ORDER_STATUS.PENDING_PAYMENT, // MP: stock held before webhook fires
    ORDER_STATUS.RESERVED, // Cash: stock held awaiting cash collection
    ORDER_STATUS.WAITING_TRANSFER_PROOF, // Transfer: stock held awaiting proof
    ORDER_STATUS.PAYMENT_REVIEW, // Transfer: proof uploaded, admin reviewing
    ORDER_STATUS.PROCESSED, // Payment confirmed
    ORDER_STATUS.DELIVERED, // Delivered (stock already consumed)
  ]);

  // States where PAYMENT was already confirmed — prevents duplicate notifications and CA shipments.
  // NOTE: PENDING_PAYMENT means "payment not yet confirmed" — it must NOT be in this set!
  // That's the core bug fix: PENDING_PAYMENT → PROCESSED via MP webhook IS the "first approval".
  const PAYMENT_CONFIRMED = new Set<string>([
    ORDER_STATUS.PROCESSED,
    ORDER_STATUS.DELIVERED,
  ]);

  // States from which stock should be restored when an order is cancelled via MP webhook.
  // Transfer/WAITING states are cancelled via admin routes (not webhook), so not included here.
  const RESTORABLE = new Set<string>([
    ORDER_STATUS.PENDING_PAYMENT, // MP: restore if webhook returns rejected/cancelled
    ORDER_STATUS.RESERVED, // Cash (edge case): restore if cancelled
  ]);

  const isStockAlreadyHeld = STOCK_HELD.has(order.status);
  const shouldDecrement =
    mappedStatus === ORDER_STATUS.PROCESSED && !isStockAlreadyHeld;
  const shouldRestore =
    (mappedStatus as string) === ORDER_STATUS.CANCELLED &&
    RESTORABLE.has(order.status);
  // isFirstApproval uses PAYMENT_CONFIRMED (not STOCK_HELD) because PENDING_PAYMENT
  // means "payment not yet confirmed" — the MP webhook is the first time payment is approved.
  const isFirstApproval =
    mappedStatus === ORDER_STATUS.PROCESSED &&
    !PAYMENT_CONFIRMED.has(order.status);

  const isPickup = order.shippingMethod === "pickup";
  return {
    shouldDecrement,
    shouldRestore,
    isFirstApproval,
    shouldShip: isFirstApproval && !isPickup,
  };
}

/**
 * Decrementa el stock de productos (y variantes) para los items de una orden ya creada.
 * Lanza error si no hay stock suficiente (rollback de la transacción en curso).
 */
export async function decrementOrderItemsStock(
  tx: Prisma.TransactionClient,
  orderItems: OrderItemForStock[]
): Promise<void> {
  for (const item of orderItems) {
    const product = await tx.products.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true },
    });
    if (!product || product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para ${product?.name ?? "producto"}`);
    }
    await tx.products.update({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
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

/**
 * Restaura el stock de productos (y variantes) para una orden cancelada.
 * Opcionalmente decrementa el uso del cupón aplicado.
 */
export async function restoreOrderItemsStock(
  tx: Prisma.TransactionClient,
  orderItems: OrderItemForStock[],
  couponId: string | null
): Promise<void> {
  for (const item of orderItems) {
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
  if (couponId) await decrementCouponUsage(tx, couponId);
}

/**
 * Parsea los items del metadata de MP legacy (pueden llegar como JSON string o array).
 */
export function parseLegacyItems(metadata: {
  items: unknown;
}): LegacyOrderItemInput[] {
  if (Array.isArray(metadata.items))
    return metadata.items as LegacyOrderItemInput[];
  if (typeof metadata.items !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(metadata.items);
    return Array.isArray(parsed) ? (parsed as LegacyOrderItemInput[]) : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene el costo de envío del metadata de MP legacy.
 */
export function getLegacyShippingCost(metadata: {
  shippingCost?: unknown;
  shipping?: unknown;
}): number {
  if (metadata.shippingCost !== undefined && metadata.shippingCost !== null) {
    return Number(metadata.shippingCost);
  }
  const shippingId = metadata.shipping as string | undefined;
  if (!shippingId) return 0;
  const shippingMap: Record<string, number> = {
    pickup: 0,
    standard: 1500,
    express: 2500,
  };
  return shippingMap[shippingId] ?? 0;
}

/**
 * Decrementa el stock de productos tras un pago legado aprobado.
 * Si falla, marca la orden en PAYMENT_REVIEW en lugar de hacer rollback del webhook.
 */
export async function decrementLegacyOrderStock(
  orderId: string,
  orderItemsData: Array<{ productId: string; quantity: number | string }>,
  mpPaymentId: string
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const it of orderItemsData) {
        await tx.products.update({
          where: { id: it.productId, stock: { gte: Number(it.quantity) } },
          data: { stock: { decrement: Number(it.quantity) } },
        });
      }
    });
  } catch (error) {
    logger.error(
      "CRITICAL: Payment Approved but Stock Decrement FAILED (Race Condition)",
      { mpPaymentId, orderId, error }
    );
    await flagOrderForReview(orderId, mpPaymentId, error);
  }
}

async function flagOrderForReview(
  orderId: string,
  mpPaymentId: string,
  error: unknown
): Promise<void> {
  try {
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.PAYMENT_REVIEW,
        caImportError: `Stock decrement failed (race condition) — manual review required: ${String(error)}`,
      },
    });
    logger.warn(
      "[OrderService] Order flagged PAYMENT_REVIEW due to stock decrement failure",
      { orderId, mpPaymentId }
    );
  } catch (updateErr) {
    logger.error(
      "CRITICAL: Could not flag order for manual review after stock failure",
      { orderId, mpPaymentId, updateErr }
    );
  }
}

/**
 * Envía el email de confirmación de orden (cash) de forma no bloqueante.
 * También notifica al admin de la nueva venta.
 */
export function sendCashOrderEmailAsync(order: EmailableOrder): void {
  const emailItems = (order.order_items ?? []).map((oi) => ({
    productId: oi.productId,
    quantity: oi.quantity,
    price: Number(oi.price),
    name: oi.products?.name ?? "Producto",
    size: oi.size ?? undefined,
    color: oi.color ?? undefined,
  }));

  const orderSummary = {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail || "",
    total: Number(order.total),
    subtotal: order.subtotal ? Number(order.subtotal) : undefined,
    discount: order.discount ? Number(order.discount) : undefined,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    paymentMethod: order.paymentMethod ?? "cash",
    shippingMethod: order.shippingMethod ?? undefined,
  };

  emailService
    .sendOrderConfirmation(orderSummary, emailItems)
    .catch((err: unknown) =>
      logger.error(
        "[OrderService] Error enviando email de confirmación (cash):",
        {
          err,
          orderId: order.id,
        }
      )
    );

  getStoreSettings()
    .then((settings) => {
      const adminEmail = (settings as Record<string, unknown>)?.adminEmail as
        | string
        | undefined;
      if (!adminEmail) return;
      return emailService.sendAdminNewOrderAlert(
        orderSummary,
        emailItems,
        adminEmail
      );
    })
    .catch((err: unknown) =>
      logger.error("[OrderService] Error notificando admin (cash):", {
        err,
        orderId: order.id,
      })
    );
}

/**
 * Envía el email de instrucciones de transferencia de forma no bloqueante.
 * También notifica al admin de la nueva venta.
 */
export function sendTransferOrderEmailAsync(order: EmailableOrder): void {
  if (!order.customerEmail) return;

  const orderSummary = {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: Number(order.total),
    subtotal: order.subtotal ? Number(order.subtotal) : undefined,
    discount: order.discount ? Number(order.discount) : undefined,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    paymentMethod: order.paymentMethod ?? "transfer",
    shippingMethod: order.shippingMethod ?? undefined,
  };

  const emailItems = (order.order_items ?? []).map((oi) => ({
    productId: oi.productId,
    quantity: oi.quantity,
    price: Number(oi.price),
    name: oi.products?.name ?? "Producto",
    size: oi.size ?? undefined,
    color: oi.color ?? undefined,
  }));

  emailService
    .sendBankTransferInstructions(orderSummary)
    .catch((err: unknown) =>
      logger.error(
        "[OrderService] Error enviando instrucciones de transferencia:",
        { err, orderId: order.id }
      )
    );

  getStoreSettings()
    .then((settings) => {
      const adminEmail = (settings as Record<string, unknown>)?.adminEmail as
        | string
        | undefined;
      if (!adminEmail) return;
      return emailService.sendAdminNewOrderAlert(
        orderSummary,
        emailItems,
        adminEmail
      );
    })
    .catch((err: unknown) =>
      logger.error("[OrderService] Error notificando admin (transfer):", {
        err,
        orderId: order.id,
      })
    );
}

export function extractShippingFromOrderMetadata(
  metadata: OrderMetadata
): ShippingFields {
  const s = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;
  return {
    shippingStreet: s(metadata.customerAddress),
    shippingCity: s(metadata.customerCity),
    shippingProvince: s(metadata.customerProvince),
    shippingPostalCode: s(metadata.customerPostalCode),
    shippingAgencyCode: s(metadata.shippingAgencyCode),
    shippingMethodId:
      s(metadata.shippingMethodName) ?? s(metadata.shippingMethodId),
  };
}
