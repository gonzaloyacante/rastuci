import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

// GET /api/products/stats - Estadísticas para filtros dinámicos e inventario
export async function GET(): Promise<
  NextResponse<ApiResponse<Record<string, unknown>>>
> {
  try {
    // Estadísticas de inventario (ejecutar en paralelo)
    const [totalProducts, inStock, lowStock, outOfStock, priceAgg] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { stock: { gt: 0 } } }),
        prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
        prisma.product.count({ where: { stock: 0 } }),
        // Min/Max price
        prisma.product.aggregate({
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

    // Sizes and colors aggregation (scan products)
    const products = await prisma.product.findMany({
      select: { sizes: true, colors: true, rating: true, categoryId: true },
    });

    const sizeCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const ratingCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let hasRatings = false;

    type ProductType = (typeof products)[0];
    products.forEach((p: ProductType) => {
      // sizes
      (p.sizes || []).forEach((s: string) => {
        sizeCounts[s] = (sizeCounts[s] || 0) + 1;
      });
      // colors
      (p.colors || []).forEach((c: string) => {
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      });
      // rating
      if (typeof p.rating === "number") {
        hasRatings = true;
        const key = Math.floor(p.rating).toString();
        ratingCounts[key] = (ratingCounts[key] || 0) + 1;
      }
      // category
      if (p.categoryId) {
        categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
      }
    });

    // Transform keys into arrays
    const availableSizes = Object.keys(sizeCounts);
    const availableColors = Object.keys(colorCounts);

    const response = ok({
      // Estadísticas de inventario
      inventory: {
        total: totalProducts,
        inStock,
        lowStock,
        outOfStock,
      },
      // Estadísticas de filtros
      minPrice: priceAgg._min.price ?? 0,
      maxPrice: priceAgg._max.price ?? 0,
      availableSizes,
      sizeCounts,
      availableColors,
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
