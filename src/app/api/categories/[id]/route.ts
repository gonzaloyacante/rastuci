import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Category } from "@/types";
import { logger, getRequestId } from "@/lib/logger";
import { ok, fail } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

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
    const rl = checkRateLimit(request, { key: makeKey("GET", "/api/categories/[id]"), ...getPreset("publicRead") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;

    const category = await prisma.category.findUnique({
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

    return ok({
      ...category,
      description: category.description ?? undefined,
      products: category.products.map((product) => ({
        ...product,
        description: product.description ?? undefined,
      })),
    });
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error fetching category", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al obtener la categoría", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}

// PUT /api/categories/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, { key: makeKey("PUT", "/api/categories/[id]"), ...getPreset("mutatingLow") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return fail("BAD_REQUEST", "El nombre de la categoría es requerido", 400, { requestId });
    }

    // Verificar si existe otra categoría con ese nombre
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existingCategory) {
      return fail("CONFLICT", "Ya existe otra categoría con ese nombre", 400, { requestId });
    }

    const category = await prisma.category.update({
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
    logger.error("Error updating category", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al actualizar la categoría", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}

// DELETE /api/categories/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, { key: makeKey("DELETE", "/api/categories/[id]"), ...getPreset("mutatingLow") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;

    // Verificar si hay productos asociados a esta categoría
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return fail("BAD_REQUEST", `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`, 400, { requestId });
    }

    await prisma.category.delete({
      where: { id },
    });

    return ok(null);
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error deleting category", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al eliminar la categoría", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}
