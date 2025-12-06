import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

// GET /api/search/trending - Devuelve búsquedas trending basadas en ventas
export async function GET(): Promise<
  NextResponse<ApiResponse<{ trending: string[] }>>
> {
  try {
    // Top products by number of orderItems (proxy de ventas)
    const topProducts = await prisma.order_items.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    type TopProductType = (typeof topProducts)[0];
    const productIds = topProducts.map((t: TopProductType) => t.productId);
    const products =
      productIds.length > 0
        ? await prisma.products.findMany({
            where: { id: { in: productIds } },
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
