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
async function fillWithCategories(trending: string[], needed: number) {
  const catCounts = await prisma.products.groupBy({
    by: ["categoryId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: needed,
  });
  const catIds = catCounts.map((c) => c.categoryId);
  if (!catIds.length) return;
  const cats = await prisma.categories.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true },
  });
  for (const c of cats) trending.push(c.name);
}

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

    if (trending.length < 8) {
      await fillWithCategories(trending, 8 - trending.length);
    }

    return ok({ trending });
  } catch (error) {
    logger.error("Error fetching trending searches", { error: error });
    return fail("INTERNAL_ERROR", "Error al obtener trending", 500);
  }
}
