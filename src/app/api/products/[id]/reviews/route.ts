import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ProductReviewCreateSchema } from "@/lib/validation/product";
import { ApiResponse, ProductReview } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id]/reviews - Obtener reseñas de un producto
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProductReview[]>>> {
  try {
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/products/[id]/reviews"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    const reviews = await prisma.product_reviews.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    });

    return ok(reviews);
  } catch (error) {
    logger.error("Error fetching reviews:", { error });
    return fail("INTERNAL_ERROR", "Error al obtener las reseñas", 500);
  }
}

// POST /api/products/[id]/reviews - Crear una nueva reseña
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProductReview>>> {
  try {
    const rl = checkRateLimit(request, {
      key: makeKey("POST", "/api/products/[id]/reviews"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = ProductReviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Datos inválidos", 400, {
        issues: parsed.error.issues,
      });
    }
    const { rating, comment, customerName } = parsed.data;

    // Verificar que el producto existe
    const product = await prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      return fail("NOT_FOUND", "Producto no encontrado", 404);
    }

    // Crear la reseña
    const review = await prisma.product_reviews.create({
      data: {
        id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        rating,
        comment,
        customerName,
        productId: id,
      },
    });

    // Actualizar el rating promedio y conteo de reseñas del producto
    const allReviews = await prisma.product_reviews.findMany({
      where: { productId: id },
    });

    type ReviewType = (typeof allReviews)[0];
    const averageRating =
      allReviews.reduce((acc: number, rev: ReviewType) => acc + rev.rating, 0) /
      allReviews.length;

    await prisma.products.update({
      where: { id },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length,
      },
    });

    return ok(review);
  } catch (error) {
    logger.error("Error creating review:", { error });
    return fail("INTERNAL_ERROR", "Error al crear la reseña", 500);
  }
}
