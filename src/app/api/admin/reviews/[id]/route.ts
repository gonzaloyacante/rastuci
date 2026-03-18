import { ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";

const UpdateReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

// PATCH /api/admin/reviews/[id] - Aprobar o rechazar una reseña
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return fail("UNAUTHORIZED", "No autorizado", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return fail(
        "BAD_REQUEST",
        "Estado inválido. Use APPROVED o REJECTED",
        400
      );
    }

    const { status } = parsed.data;

    const review = await prisma.product_reviews.findUnique({
      where: { id },
      select: { id: true, productId: true, status: true },
    });

    if (!review) {
      return fail("NOT_FOUND", "Reseña no encontrada", 404);
    }

    // Actualizar estado de la reseña y recalcular rating del producto
    await prisma.$transaction(async (tx) => {
      await tx.product_reviews.update({
        where: { id },
        data: { status: status as ReviewStatus },
      });

      // Recalcular rating solo con reseñas APPROVED
      const { _avg, _count } = await tx.product_reviews.aggregate({
        where: { productId: review.productId, status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.products.update({
        where: { id: review.productId },
        data: {
          rating: _avg.rating ?? 0,
          reviewCount: _count.rating,
        },
      });
    });

    logger.info(`[Admin] Review ${id} ${status} by ${session.user.email}`);

    revalidatePath(`/products/${review.productId}`);
    revalidatePath("/admin/reviews");

    return ok({ success: true });
  } catch (error) {
    logger.error("[Admin] Error updating review status", { error });
    return fail("INTERNAL_ERROR", "Error al actualizar la reseña", 500);
  }
}

// GET /api/admin/reviews/[id] - Obtener una reseña específica (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return fail("UNAUTHORIZED", "No autorizado", 401);
    }

    const { id } = await params;

    const review = await prisma.product_reviews.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      return fail("NOT_FOUND", "Reseña no encontrada", 404);
    }

    return ok(review);
  } catch (error) {
    logger.error("[Admin] Error fetching review", { error });
    return fail("INTERNAL_ERROR", "Error al obtener la reseña", 500);
  }
}
