import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  ApiResponse,
  Product,
  PaginatedResponse,
} from "@/types";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import {
  ProductCreateSchema,
  ProductsQuerySchema,
} from "@/lib/validation/product";
import { normalizeApiError } from "@/lib/errors";
import {
  validateAndSanitize,
  sanitizers,
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
  const where: Prisma.ProductWhereInput = {};

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

    // Paginación: asegurar valores por defecto
    const page = typeof filters.page === "number" && filters.page > 0 ? filters.page : 1;
    const limit = typeof filters.limit === "number" && filters.limit > 0 ? filters.limit : 20;
    const offset = (page - 1) * limit;

    // Construir ordenamiento dinámico de forma segura
    let orderBy: Prisma.ProductOrderByWithRelationInput | undefined;
    if (filters.sortBy) {
      // los campos permitidos vienen del schema de validación
      orderBy = { [filters.sortBy]: filters.sortOrder } as Prisma.ProductOrderByWithRelationInput;
    }

    // Preparar argumentos para Prisma
    const prismaArgs: Parameters<typeof prisma.product.findMany>[0] = {
      where,
      include: {
        category: {
          select: { id: true, name: true, description: true },
        },
      },
      skip: offset,
      take: limit,
      ...(orderBy ? { orderBy } : {}),
    };

    type PartialProduct = {
      id: string;
      name: string;
      description?: string | null;
      price?: number | null;
      salePrice?: number | null;
      stock?: number | null;
      images?: string | string[] | null;
      category?: { id: string; name: string; description?: string | null } | null;
      [k: string]: unknown;
    };

    const prismaProducts = await prisma.product.findMany(prismaArgs as unknown as Parameters<typeof prisma.product.findMany>[0]);

    // Mapear imágenes si vienen como JSON string
    const products: Product[] = (prismaProducts as unknown as PartialProduct[]).map((p) => ({
      ...(p as unknown as Product),
      description: p.description ?? undefined,
      salePrice: p.salePrice ?? undefined,
      images: typeof p.images === "string" ? JSON.parse(p.images as string) : (p.images as string[] | undefined),
      category: {
        ...(p.category ?? {}),
        description: p.category?.description ?? undefined,
      },
    } as Product));

  // Calcular total para paginación
  const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const paginated: PaginatedResponse<Product> = {
      data: products,
      total,
      page,
      limit,
      totalPages,
    };

    const apiResponse = ok(paginated);
    apiResponse.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
    return apiResponse;
  } catch (error) {
    console.error("Error fetching products:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener productos",
      500,
    );
    return fail(e.code as ApiErrorCode, e.message, e.status, e.details as Record<string, unknown>);
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
      // Devolver un mensaje que incluya la palabra 'validación' para los tests y
      // mantener el detalle original en English/technical para logging.
      const msg = typeof validation.error === 'string' ? validation.error : JSON.stringify(validation.error);
      return fail("BAD_REQUEST", `validación: ${msg}`, 400);
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

    // Devuelve 201 para creación
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const e = normalizeApiError(error, "INTERNAL_ERROR", "Error al crear producto", 500);
    // Algunos tests esperan 400 en casos de contrainte/validation, así que si el error parece de validación devolvemos 400
    const status = (e.status && e.status >= 400 && e.status < 500) ? e.status : 500;
    return fail(e.code as ApiErrorCode, e.message, status, e.details as Record<string, unknown>);
  }
}
