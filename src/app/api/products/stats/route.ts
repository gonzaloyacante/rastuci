import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ok, fail } from "@/lib/apiResponse";
import { ApiResponse } from "@/types";

// GET /api/products/stats - Estadísticas para filtros dinámicos
export async function GET(): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    // Min/Max price
    const priceAgg = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    });

    // Sizes and colors aggregation (scan products)
  const products = await prisma.product.findMany({ select: { sizes: true, colors: true, rating: true, categoryId: true } });

    const sizeCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const ratingCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let hasRatings = false;

    products.forEach(p => {
      // sizes
      (p.sizes || []).forEach(s => { sizeCounts[s] = (sizeCounts[s] || 0) + 1; });
      // colors
      (p.colors || []).forEach(c => { colorCounts[c] = (colorCounts[c] || 0) + 1; });
      // rating
      if (typeof p.rating === 'number') {
        hasRatings = true;
        const key = Math.floor(p.rating).toString();
        ratingCounts[key] = (ratingCounts[key] || 0) + 1;
      }
      // category
      if (p.categoryId) categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
    });

    // Transform keys into arrays
    const availableSizes = Object.keys(sizeCounts);
    const availableColors = Object.keys(colorCounts);

    const response = ok({
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
    console.error('Error fetching product stats', error);
    return fail('INTERNAL_ERROR', 'Error al obtener estadísticas de productos', 500);
  }
}
