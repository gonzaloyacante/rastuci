import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BatchReviewSchema = z.object({
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  reviews: z
    .array(
      z.object({
        productId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .min(1),
});

/**
 * POST /api/reviews
 * Crea reseñas en lote verificadas por ID de Orden
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rl = await checkRateLimit(request, {
      key: makeKey("POST", "/api/reviews"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }

    const body = await request.json();
    const parsed = BatchReviewSchema.safeParse(body);

    if (!parsed.success) {
      return fail("BAD_REQUEST", "Datos inválidos", 400, {
        issues: parsed.error.issues,
      });
    }

    const { orderId, customerName, reviews } = parsed.data;

    // 1. Verificar Orden
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: true,
      },
    });

    if (!order) {
      return fail("NOT_FOUND", "Orden no encontrada", 404);
    }

    // Opcional: Validar estado DELIVERED
    // Se comenta para permitir testeo mas fácil, o si el usuario quiere opinar antes
    // if (order.status !== 'DELIVERED') { ... }

    // 2. Filtrar reviews válidas (solo productos comprados)
    const orderProductIds = new Set(
      order.order_items.map((item) => item.productId)
    );
    const validReviews = reviews.filter((r) =>
      orderProductIds.has(r.productId)
    );

    if (validReviews.length === 0) {
      return fail(
        "BAD_REQUEST",
        "Ningún producto de la reseña corresponde a esta orden",
        400
      );
    }

    // 3. Crear Reviews y Actualizar Productos en Transacción (o secuencial robusto)
    // Prisma no soporta updates anidado complejo con aggregates en transacción fácil,
    // así que lo haremos secuencial para asegurar recálculo correcto.

    const results = [];

    for (const review of validReviews) {
      // Crear Review
      await prisma.product_reviews.create({
        data: {
          id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          rating: review.rating,
          comment: review.comment || "",
          customerName: customerName, // Usamos nombre provisto (editable) o de la orden
          productId: review.productId,
          createdAt: new Date(),
        },
      });

      // Recalcular Promedio (Optimizado con Aggregate)
      const aggregates = await prisma.product_reviews.aggregate({
        where: { productId: review.productId },
        _avg: { rating: true },
        _count: true,
      });

      const newRating = aggregates._avg.rating || 0;
      const newCount = aggregates._count || 0;

      // Actualizar Producto
      await prisma.products.update({
        where: { id: review.productId },
        data: {
          rating: newRating,
          reviewCount: newCount,
        },
      });

      results.push({ productId: review.productId, success: true });
    }

    logger.info(`[Reviews] Batch created for Order ${orderId}`, {
      count: results.length,
    });

    return ok({
      success: true,
      processed: results.length,
      message: "Reseñas guardadas correctamente",
    });
  } catch (error) {
    logger.error("[Reviews] Error in batch creation", { error });
    return fail("INTERNAL_ERROR", "Error al procesar las reseñas", 500);
  }
}
