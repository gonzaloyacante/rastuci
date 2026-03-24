import { NextResponse } from "next/server";

import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";

type ProductType = {
  sizes: string[];
  colors: string[];
  rating: number | null;
  categoryId: string | null;
};

function countStrings(list: string[], acc: Record<string, number>) {
  for (const s of list) acc[s] = (acc[s] || 0) + 1;
}

function aggregateProductCounts(products: ProductType[]) {
  const sizeCounts: Record<string, number> = {};
  const colorCounts: Record<string, number> = {};
  const ratingCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let hasRatings = false;
  for (const p of products) {
    countStrings(p.sizes || [], sizeCounts);
    countStrings(p.colors || [], colorCounts);
    if (typeof p.rating === "number") {
      hasRatings = true;
      const key = Math.floor(p.rating).toString();
      ratingCounts[key] = (ratingCounts[key] || 0) + 1;
    }
    if (p.categoryId)
      categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
  }
  return { sizeCounts, colorCounts, ratingCounts, categoryCounts, hasRatings };
}

// GET /api/products/stats - Estadísticas para filtros dinámicos e inventario
export async function GET(): Promise<
  NextResponse<ApiResponse<Record<string, unknown>>>
> {
  try {
    const [totalProducts, inStock, lowStock, outOfStock, priceAgg] =
      await Promise.all([
        prisma.products.count(),
        prisma.products.count({ where: { stock: { gt: 0 } } }),
        prisma.products.count({ where: { stock: { gt: 0, lte: 5 } } }),
        prisma.products.count({ where: { stock: 0 } }),
        prisma.products.aggregate({
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

    const products = await prisma.products.findMany({
      select: { sizes: true, colors: true, rating: true, categoryId: true },
    });
    const {
      sizeCounts,
      colorCounts,
      ratingCounts,
      categoryCounts,
      hasRatings,
    } = aggregateProductCounts(products);

    const response = ok({
      inventory: { total: totalProducts, inStock, lowStock, outOfStock },
      minPrice: priceAgg._min.price ?? 0,
      maxPrice: priceAgg._max.price ?? 0,
      availableSizes: Object.keys(sizeCounts),
      sizeCounts,
      availableColors: Object.keys(colorCounts),
      colorCounts,
      hasRatings,
      ratingCounts,
      categoryCounts,
    });
    response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
    return response;
  } catch (error) {
    logger.error("Error fetching product stats", { error: error });
    return fail(
      "INTERNAL_ERROR",
      "Error al obtener estadísticas de productos",
      500
    );
  }
}
