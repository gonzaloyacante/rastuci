import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

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

    // Only DELIVERED orders can be reviewed (prevents premature reviews)
    if (order.status !== "DELIVERED") {
      return fail(
        "BAD_REQUEST",
        "Solo se pueden reseñar órdenes entregadas",
        400
      );
    }

    // #59 Fix: Use customerName from the order, not the request body (prevent impersonation)
    const verifiedCustomerName = order.customerName || customerName;

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

    // #67 Fix: Wrap all review operations in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const txResults = [];

      for (const review of validReviews) {
        // #68 Fix: Use nanoid instead of Date.now()+Math.random()
        await tx.product_reviews.create({
          data: {
            id: `review-${nanoid(12)}`,
            rating: review.rating,
            comment: review.comment || "",
            customerName: verifiedCustomerName,
            productId: review.productId,
            createdAt: new Date(),
          },
        });

        // Recalculate average
        const aggregates = await tx.product_reviews.aggregate({
          where: { productId: review.productId },
          _avg: { rating: true },
          _count: true,
        });

        await tx.products.update({
          where: { id: review.productId },
          data: {
            rating: aggregates._avg.rating || 0,
            reviewCount: aggregates._count || 0,
          },
        });

        txResults.push({ productId: review.productId, success: true });
      }

      return txResults;
    });

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
