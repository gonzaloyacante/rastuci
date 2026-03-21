/**
 * order-helpers.ts — Funciones auxiliares extraídas de OrderService.
 * Ninguna de estas funciones usa `this`, por lo que pueden vivir como
 * funciones de módulo reutilizables e individualmente testeables.
 */
import { Prisma } from "@prisma/client";

import { PROVINCIAS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/resend";
import { getStoreSettings } from "@/lib/store-settings";
import { formatCurrency } from "@/lib/utils";

export type ValidatedOrderItem = {
  productId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  size?: string;
  color?: string;
};

export type CouponInput = {
  id: string;
  discount: number;
  discountType: string;
  minOrderTotal: number | null;
};

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
  for (const item of items) {
    await tx.products.update({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
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

    const { stockStatuses } = settings;
    const productIds = [
      ...new Set(items.map((i) => i.productId || i.products?.id)),
    ].filter(Boolean);

    const products = await prisma.products.findMany({
      where: { id: { in: productIds as string[] } },
      select: { id: true, name: true, stock: true },
    });

    for (const p of products) {
      const status = stockStatuses.find(
        (s) =>
          p.stock >= s.min &&
          (s.max === null || s.max === undefined || p.stock <= s.max)
      );
      if (status && (status.color === "error" || status.color === "warning")) {
        await emailService.sendLowStockAlert(
          p.name,
          p.stock,
          p.id,
          settings.adminEmail || "admin@rastuci.com"
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
