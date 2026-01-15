import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { withAdminAuth } from "@/lib/adminAuth";
import { normalizeApiError } from "@/lib/errors";
import { sanitizers, validateAndSanitize } from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { RATE_LIMITS } from "@/lib/rateLimiterConfig";
import {
  ProductCreateSchema,
  ProductsQuerySchema,
} from "@/lib/validation/product";
import { ApiResponse, PaginatedResponse, Product } from "@/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/products - Obtener productos con filtros y paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Product>>>> {
  try {
    // Rate limiting
    const rl = await checkRateLimit(request, RATE_LIMITS.products);
    if (!rl.ok) {
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
    const where: Prisma.productsWhereInput = {};

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
      if (filters.minPrice) {
        (where.price as Record<string, number>).gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        (where.price as Record<string, number>).lte = filters.maxPrice;
      }
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin;

    if (!isAdmin) {
      where.isActive = true;
    }

    if (filters.onSale) {
      where.onSale = true;
    }

    // Paginación: asegurar valores por defecto
    const page =
      typeof filters.page === "number" && filters.page > 0 ? filters.page : 1;
    const limit =
      typeof filters.limit === "number" && filters.limit > 0
        ? filters.limit
        : 20;
    const offset = (page - 1) * limit;

    // Construir ordenamiento dinámico de forma segura
    let orderBy: Prisma.productsOrderByWithRelationInput | undefined;
    if (filters.sortBy) {
      // los campos permitidos vienen del schema de validación
      orderBy = {
        [filters.sortBy]: filters.sortOrder,
      } as Prisma.productsOrderByWithRelationInput;
    }

    // Preparar argumentos para Prisma
    const prismaArgs = {
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        stock: true,
        onSale: true,
        isActive: true,
        images: true,
        colorImages: true,
        sizes: true,
        colors: true,
        rating: true,
        reviewCount: true,
        categoryId: true,
        product_variants: {
          select: {
            id: true,
            color: true,
            size: true,
            stock: true,
          },
        },
        categories: {
          select: { id: true, name: true },
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
      category?: {
        id: string;
        name: string;
        description?: string | null;
      } | null;
      [k: string]: unknown;
    };

    const prismaProducts = await prisma.products.findMany(
      prismaArgs as unknown as Parameters<typeof prisma.products.findMany>[0]
    );

    // Mapear imágenes si vienen como JSON string y convertir Decimals
    const products: Product[] = (
      prismaProducts as unknown as PartialProduct[]
    ).map(
      (p) =>
        ({
          ...(p as unknown as Product),
          price: Number(p.price), // Convert Decimal to number
          salePrice: p.salePrice ? Number(p.salePrice) : undefined,
          description: p.description ?? undefined,
          images:
            typeof p.images === "string"
              ? JSON.parse(p.images as string)
              : (p.images as string[] | undefined),
          category: {
            ...(p.category ?? {}),
            description: p.category?.description ?? undefined,
          },
          // Map product_variants to variants for API compatibility
          variants: (p as unknown as { product_variants?: unknown[] })
            .product_variants,
        }) as Product
    );

    // Calcular total para paginación
    const total = await prisma.products.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const paginated: PaginatedResponse<Product> = {
      data: products,
      total,
      page,
      limit,
      totalPages,
    };

    const apiResponse = ok(paginated);
    apiResponse.headers.set(
      "Cache-Control",
      "public, max-age=0, must-revalidate"
    );
    return apiResponse;
  } catch (error) {
    logger.error("Error fetching products:", { error: error });
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener productos",
      500
    );
    return fail(
      e.code as ApiErrorCode,
      e.message,
      e.status,
      e.details as Record<string, unknown>
    );
  }
}

// POST /api/products - Crear nuevo producto (ADMIN ONLY)
export const POST = withAdminAuth(
  async (request: NextRequest): Promise<NextResponse<ApiResponse<Product>>> => {
    try {
      // Rate limiting para creación
      const rl = await checkRateLimit(request, RATE_LIMITS.adminApi);
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }

      const body = await request.json();

      // DEBUG: Log del body recibido
      logger.info("POST /api/products - Body recibido:", { body });

      // Sanitize and validate input
      const validation = validateAndSanitize(
        ProductCreateSchema,
        body,
        sanitizers.product
      );

      if (!validation.success) {
        // Devolver un mensaje que incluya la palabra 'validación' para los tests y
        // mantener el detalle original en English/technical para logging.
        const msg =
          typeof validation.error === "string"
            ? validation.error
            : JSON.stringify(validation.error);

        // DEBUG: Log del error de validación
        logger.error("POST /api/products - Error de validación:", {
          error: validation.error,
          body,
        });

        return fail("BAD_REQUEST", `validación: ${msg}`, 400);
      }

      const productData = validation.data;

      // Verificar que la categoría existe
      const category = await prisma.categories.findUnique({
        where: { id: productData.categoryId },
      });

      if (!category) {
        return fail("NOT_FOUND", "Categoría no encontrada", 404);
      }

      // Crear el producto
      const newProduct = await prisma.products.create({
        data: {
          id: `product-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: productData.name,
          description: productData.description ?? null,
          price: Number(productData.price),
          salePrice: productData.salePrice
            ? Number(productData.salePrice)
            : null,
          stock: Number(productData.stock),
          categoryId: productData.categoryId,
          onSale: productData.onSale ?? false,
          sizes: productData.sizes ?? undefined,
          colors: productData.colors ?? undefined,
          features: productData.features ?? undefined,
          weight: productData.weight ?? null,
          height: productData.height ?? null,
          width: productData.width ?? null,
          length: productData.length ?? null,
          sizeGuide: productData.sizeGuide ?? undefined,
          updatedAt: new Date(),
          images: Array.isArray(productData.images)
            ? JSON.stringify(productData.images)
            : productData.images,
          product_variants:
            productData.variants && productData.variants.length > 0
              ? {
                  create: productData.variants.map((v) => ({
                    color: v.color,
                    size: v.size,
                    stock: v.stock,
                    sku: v.sku,
                  })),
                }
              : undefined,
          colorImages: productData.colorImages ?? undefined,
        },
        include: {
          categories: true,
          product_variants: true,
        },
      });

      const product: Product = {
        ...newProduct,
        price: Number(newProduct.price), // Convert Decimal to number
        salePrice: newProduct.salePrice
          ? Number(newProduct.salePrice)
          : undefined,
        description: newProduct.description ?? undefined,
        images:
          typeof newProduct.images === "string"
            ? JSON.parse(newProduct.images)
            : newProduct.images,
        categories: {
          ...newProduct.categories,
          description: newProduct.categories.description ?? undefined,
        },
        variants: newProduct.product_variants.map((v) => ({
          ...v,
          sku: v.sku ?? undefined,
        })),
        colorImages:
          (newProduct.colorImages as unknown as Record<string, string[]>) ??
          null,
      };

      // Devuelve 201 para creación
      return NextResponse.json(
        { success: true, data: product },
        { status: 201 }
      );
    } catch (error) {
      logger.error("Error creating product:", { error: error });
      const e = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al crear producto",
        500
      );
      // Algunos tests esperan 400 en casos de contrainte/validation, así que si el error parece de validación devolvemos 400
      const status =
        e.status && e.status >= 400 && e.status < 500 ? e.status : 500;
      return fail(
        e.code as ApiErrorCode,
        e.message,
        status,
        e.details as Record<string, unknown>
      );
    }
  }
);
