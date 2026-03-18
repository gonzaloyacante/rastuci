import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/types";

const QuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/admin/reviews - Listar reseñas con filtros (admin)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return fail("UNAUTHORIZED", "No autorizado", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    if (!parsed.success) {
      return fail("BAD_REQUEST", "Parámetros inválidos", 400);
    }

    const { status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.product_reviews.findMany({
        where: status ? { status } : undefined,
        include: {
          products: { select: { id: true, name: true, images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product_reviews.count({
        where: status ? { status } : undefined,
      }),
    ]);

    return ok({
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error("[Admin] Error fetching reviews", { error });
    return fail("INTERNAL_ERROR", "Error al obtener las reseñas", 500);
  }
}
