import { NextRequest, NextResponse } from "next/server";

import { fail, ok } from "@/lib/apiResponse";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ApiResponse } from "@/types";

// Órdenes en estados "exitosos" — excluye canceladas y pendientes sin pago
const SUCCESSFUL_STATUSES = [
  ORDER_STATUS.PROCESSED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.PAYMENT_REVIEW,
  ORDER_STATUS.WAITING_TRANSFER_PROOF,
  ORDER_STATUS.RESERVED,
] as const;

// GET /api/search/trending - Devuelve búsquedas trending basadas en ventas
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ trending: string[] }>>> {
  try {
    // Fix #116: rate limit this endpoint to prevent sales data scraping
    const rl = await checkRateLimit(req, {
      key: makeKey("GET", "/api/search/trending"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }

    // Top products por cantidad vendida — solo en órdenes exitosas (excluir canceladas)
    const topProducts = await prisma.order_items.groupBy({
      by: ["productId"],
      where: {
        orders: {
          status: { in: [...SUCCESSFUL_STATUSES] },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    type TopProductType = (typeof topProducts)[0];
    const productIds = topProducts.map((t: TopProductType) => t.productId);
    const products =
      productIds.length > 0
        ? await prisma.products.findMany({
            where: { id: { in: productIds }, isActive: true },
            select: { id: true, name: true },
          })
        : [];

    type ProductNameType = (typeof products)[0];
    const trending: string[] = products.map((p: ProductNameType) => p.name);

    // Completar con categorías top si hace falta
    if (trending.length < 8) {
      const catCounts = await prisma.products.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8 - trending.length,
      });
      type CatCountType = (typeof catCounts)[0];
      const catIds = catCounts.map((c: CatCountType) => c.categoryId);
      const cats =
        catIds.length > 0
          ? await prisma.categories.findMany({
              where: { id: { in: catIds } },
              select: { id: true, name: true },
            })
          : [];
      type CatType = (typeof cats)[0];
      cats.forEach((c: CatType) => trending.push(c.name));
    }

    return ok({ trending });
  } catch (error) {
    logger.error("Error fetching trending searches", { error: error });
    return fail("INTERNAL_ERROR", "Error al obtener trending", 500);
  }
}
