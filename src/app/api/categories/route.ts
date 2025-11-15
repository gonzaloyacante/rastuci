import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import {
  CategoriesQuerySchema,
  CategoryCreateSchema,
} from "@/lib/validation/category";
import { ApiResponse, Category } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories - Obtener todas las categorías con búsqueda y paginación
export async function GET(request: NextRequest): Promise<
  NextResponse<
    ApiResponse<{
      data: Category[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  >
> {
  try {
    // Rate limit per IP to protect endpoint
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/categories"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }

    const { searchParams } = new URL(request.url);
    const parsed = CategoriesQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      includeProductCount: searchParams.get("includeProductCount") ?? undefined,
    });
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Parámetros inválidos", 400, {
        issues: parsed.error.issues,
      });
    }
    const { page, limit, search, includeProductCount } = parsed.data;

    // Filtros de búsqueda
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const offset = (page - 1) * limit;

    // Obtener categorías (incluir conteo solo si se solicita)
    const categoriesWithCount = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offset,
      take: limit,
      include: includeProductCount
        ? {
            _count: {
              select: { products: true },
            },
          }
        : undefined,
    });

    const total = await prisma.category.count({ where });

    const transformedCategories = categoriesWithCount.map((category) => ({
      ...category,
      description: category.description ?? undefined,
      ...(includeProductCount
        ? {
            productCount:
              (category as unknown as { _count?: { products?: number } })._count
                ?.products ?? 0,
          }
        : {}),
    }));

    const totalPages = Math.ceil(total / limit);

    const response = ok({
      data: transformedCategories,
      total,
      page,
      limit,
      totalPages,
    });

    // Cache headers para el navegador
    response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");

    return response;
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error fetching categories", {
      requestId,
      error: String(error),
    });
    const n = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener las categorías",
      500
    );
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as Record<string, unknown>),
    });
  }
}

// POST /api/categories - Crear nueva categoría
export const POST = withAdminAuth(
  async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<Category>>> => {
    try {
      // Rate limit per IP to protect category creation
      const rl = checkRateLimit(request, {
        key: makeKey("POST", "/api/categories"),
        ...getPreset("mutatingLow"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }

      const json = await request.json();
      const parsed = CategoryCreateSchema.safeParse(json);
      if (!parsed.success) {
        return fail("BAD_REQUEST", "Datos inválidos", 400, {
          issues: parsed.error.issues,
        });
      }
      const { name, description } = parsed.data;

      // Verificar si ya existe una categoría con ese nombre
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        return fail("CONFLICT", "Ya existe una categoría con ese nombre", 409);
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
        },
      });

      const transformedCategory = {
        ...category,
        description: category.description ?? undefined,
      };

      return ok(transformedCategory, "Categoría creada exitosamente");
    } catch (error) {
      const requestId = getRequestId(request.headers);
      logger.error("Error creating category", {
        requestId,
        error: String(error),
      });
      const n = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al crear la categoría",
        500
      );
      return fail(n.code as ApiErrorCode, n.message, n.status, {
        requestId,
        ...(n.details as Record<string, unknown>),
      });
    }
  }
);
