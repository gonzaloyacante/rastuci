import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ApiResponse, Category } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/categories/[id] - Obtener categoría por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = await checkRateLimit(request, {
      key: makeKey("GET", "/api/categories/[id]"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    }
    const { id } = await params;

    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        products: {
          take: 10, // Limitar a 10 productos para evitar sobrecarga
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) {
      return fail("NOT_FOUND", "Categoría no encontrada", 404, { requestId });
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin;

    if (!category.isActive && !isAdmin) {
      return fail("NOT_FOUND", "Categoría no encontrada", 404, { requestId });
    }

    type ProductType = (typeof category.products)[0];
    return ok({
      ...category,
      description: category.description ?? undefined,
      products: category.products.map((product: ProductType) => ({
        ...product,
        description: product.description ?? undefined,
      })),
    });
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error fetching category", {
      requestId,
      error: String(error),
    });
    const n = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener la categoría",
      500
    );
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as Record<string, unknown>),
    });
  }
}

// PUT /api/categories/[id] - Actualizar categoría
export const PUT = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<Category>>> => {
    try {
      const requestId = getRequestId(request.headers);
      const rl = await checkRateLimit(request, {
        key: makeKey("PUT", "/api/categories/[id]"),
        ...getPreset("mutatingLow"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
      }
      const { id } = await params;
      const body = await request.json();
      const { name, description } = body;

      if (!name) {
        return fail(
          "BAD_REQUEST",
          "El nombre de la categoría es requerido",
          400,
          { requestId }
        );
      }

      // Verificar si existe otra categoría con ese nombre
      const existingCategory = await prisma.categories.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existingCategory) {
        return fail(
          "CONFLICT",
          "Ya existe otra categoría con ese nombre",
          400,
          { requestId }
        );
      }

      const category = await prisma.categories.update({
        where: { id },
        data: {
          name,
          description,
        },
      });

      return ok({
        ...category,
        description: category.description ?? undefined,
      });
    } catch (error) {
      const requestId = getRequestId(request.headers);
      logger.error("Error updating category", {
        requestId,
        error: String(error),
      });
      const n = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al actualizar la categoría",
        500
      );
      return fail(n.code as ApiErrorCode, n.message, n.status, {
        requestId,
        ...(n.details as Record<string, unknown>),
      });
    }
  }
);

// DELETE /api/categories/[id] - Eliminar categoría
export const DELETE = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<null>>> => {
    try {
      const requestId = getRequestId(request.headers);
      const rl = await checkRateLimit(request, {
        key: makeKey("DELETE", "/api/categories/[id]"),
        ...getPreset("mutatingLow"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
      }
      const { id } = await params;

      // Verificar si hay productos asociados a esta categoría
      const productsCount = await prisma.products.count({
        where: { categoryId: id },
      });

      if (productsCount > 0) {
        return fail(
          "BAD_REQUEST",
          `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`,
          400,
          { requestId }
        );
      }

      await prisma.categories.update({
        where: { id },
        data: { isActive: false },
      });

      return ok(null);
    } catch (error) {
      const requestId = getRequestId(request.headers);
      logger.error("Error deleting category", {
        requestId,
        error: String(error),
      });
      const n = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al eliminar la categoría",
        500
      );
      return fail(n.code as ApiErrorCode, n.message, n.status, {
        requestId,
        ...(n.details as Record<string, unknown>),
      });
    }
  }
);
