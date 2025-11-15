import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";
import { ApiResponse } from "@/types";
import { logger } from "@/lib/logger";

// GET /api/search/trending - Devuelve búsquedas trending basadas en ventas
export async function GET(): Promise<
  NextResponse<ApiResponse<{ trending: string[] }>>
> {
  try {
    // Top products by number of orderItems (proxy de ventas)
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const productIds = topProducts.map((t) => t.productId);
    const products =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          })
        : [];

    const trending: string[] = products.map((p) => p.name);

    // Completar con categorías top si hace falta
    if (trending.length < 8) {
      const catCounts = await prisma.product.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8 - trending.length,
      });
      const catIds = catCounts.map((c) => c.categoryId);
      const cats =
        catIds.length > 0
          ? await prisma.category.findMany({
              where: { id: { in: catIds } },
              select: { id: true, name: true },
            })
          : [];
      cats.forEach((c) => trending.push(c.name));
    }

    return ok({ trending });
  } catch (error) {
    logger.error("Error fetching trending searches", { error: error });
    return fail("INTERNAL_ERROR", "Error al obtener trending", 500);
  }
}
