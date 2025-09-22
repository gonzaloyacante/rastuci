/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ApiResponse,
  Product,
  PaginatedResponse,
  ProductFilters,
} from "@/types";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/apiResponse";
import {
  ProductCreateSchema,
  ProductsQuerySchema,
} from "@/lib/validation/product";
import { normalizeApiError } from "@/lib/errors";
import {
  validateAndSanitize,
  sanitizers,
  schemas,
} from "@/lib/input-sanitization";

// GET /api/products - Obtener productos con filtros y paginación
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PaginatedResponse<Product>>>> {
  try {
    // Rate limiting
    const rateLimitPassed = await checkRateLimit(request, RATE_LIMITS.products);
    if (!rateLimitPassed) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = ProductsQuerySchema.safeParse({
      categoryId: searchParams.get("categoryId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      onSale: searchParams.get("onSale") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
    });
    if (!parsedQuery.success) {
      return fail("BAD_REQUEST", "Parámetros inválidos", 400, {
        issues: parsedQuery.error.issues,
      });
    }
    const filters = parsedQuery.data;

    // Construir filtros para Prisma
    const where: Record<string, unknown> = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice)
        (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice)
        (where.price as Record<string, number>).lte = filters.maxPrice;
    }

    if (filters.onSale) {
      where.onSale = true;
    }

    // Calcular offset para paginación
    const offset = (filters.page - 1) * filters.limit;

    // Construir ordenamiento dinámico
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[filters.sortBy] = filters.sortOrder;

    // Obtener productos y total en paralelo
    const [prismaProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    const products: Product[] = prismaProducts.map((p: any) => ({
      ...p,
      description: p.description ?? undefined,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      category: {
        ...p.category,
        description: p.category.description ?? undefined,
      },
    }));

    const totalPages = Math.ceil(total / filters.limit);

    const response: PaginatedResponse<Product> = {
      data: products,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };

    const apiResponse = ok(response);

    // Cache headers para el navegador
    apiResponse.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300",
    );

    return apiResponse;
  } catch (error) {
    console.error("Error fetching products:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener los productos",
      500,
    );
    return fail(e.code as any, e.message, e.status, e.details as any);
  }
}

// POST /api/products - Crear nuevo producto
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    // Rate limiting para creación
    const rateLimitPassed = await checkRateLimit(request, RATE_LIMITS.adminApi);
    if (!rateLimitPassed) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }

    const body = await request.json();

    // Sanitize and validate input
    const validation = validateAndSanitize(
      ProductCreateSchema,
      body,
      sanitizers.product,
    );

    if (!validation.success) {
      return fail("BAD_REQUEST", validation.error, 400);
    }

    const productData = validation.data;

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      return fail("NOT_FOUND", "Categoría no encontrada", 404);
    }

    // Crear el producto
    const newProduct = await prisma.product.create({
      data: {
        ...productData,
        images: Array.isArray(productData.images)
          ? JSON.stringify(productData.images)
          : productData.images,
      },
      include: {
        category: true,
      },
    });

    const product: Product = {
      ...newProduct,
      description: newProduct.description ?? undefined,
      salePrice: newProduct.salePrice ?? undefined,
      images:
        typeof newProduct.images === "string"
          ? JSON.parse(newProduct.images)
          : newProduct.images,
      category: {
        ...newProduct.category,
        description: newProduct.category.description ?? undefined,
      },
    };

    return ok(product);
  } catch (error) {
    console.error("Error creating product:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al crear el producto",
      500,
    );
    return fail(e.code as any, e.message, e.status, e.details as any);
  }
}
