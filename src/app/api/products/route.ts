/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ApiResponse,
  Product,
  PaginatedResponse,
  ProductFilters,
} from "@/types";
import { validateProduct } from "@/lib/validations";
import { handleApiError, validateApiResponse } from "@/lib/errorHandler";
import { apiLimiter, createContentLimiter } from "@/middleware/rateLimit";

// GET /api/products - Obtener productos con filtros y paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Product>>>> {
  try {
    // Aplicar rate limiting
    // await apiLimiter(request);

    const { searchParams } = new URL(request.url);

    const filters: ProductFilters = {
      categoryId: searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      onSale: searchParams.get("onSale") === "true",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 12,
    };

    // Obtener parámetros de ordenamiento
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

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
    const offset = (filters.page! - 1) * filters.limit!;

    // Construir ordenamiento dinámico
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[sortBy] = sortOrder as "asc" | "desc";

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

    const totalPages = Math.ceil(total / filters.limit!);

    const response: PaginatedResponse<Product> = {
      data: products,
      total,
      page: filters.page!,
      limit: filters.limit!,
      totalPages,
    };

    const apiResponse = NextResponse.json({
      success: true,
      data: response,
    });

    // Cache headers para el navegador
    apiResponse.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300"
    );

    return apiResponse;
  } catch (error) {
    const appError = handleApiError(error);
    return NextResponse.json(
      {
        success: false,
        error: appError.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear nuevo producto
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    // Aplicar rate limiting para creación
    await createContentLimiter(request);

    const body = await request.json();

    // Validar datos con Zod
    const validation = validateProduct(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const productData = validation.data;

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Categoría no encontrada",
        },
        { status: 404 }
      );
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
      images:
        typeof newProduct.images === "string"
          ? JSON.parse(newProduct.images)
          : newProduct.images,
      category: {
        ...newProduct.category,
        description: newProduct.category.description ?? undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    const appError = handleApiError(error);
    return NextResponse.json(
      {
        success: false,
        error: appError.message,
      },
      { status: 500 }
    );
  }
}
