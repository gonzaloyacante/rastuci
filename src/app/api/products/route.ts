import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  ApiResponse,
  Product,
  PaginatedResponse,
  ProductFilters,
} from "@/types";

// GET /api/products - Obtener productos con filtros y paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Product>>>> {
  try {
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
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 12,
    };

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

    // Calcular offset para paginación
    const offset = (filters.page! - 1) * filters.limit!;

    // Obtener productos y total
    const [prismaProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    const products: Product[] = prismaProducts.map((p) => ({
      ...p,
      description: p.description ?? undefined,
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

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los productos",
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
    const body = await request.json();
    const { name, description, price, stock, categoryId, images } = body;

    // Validaciones
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Nombre, precio y categoría son requeridos",
        },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser mayor o igual a 0",
        },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El stock debe ser mayor o igual a 0",
        },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "La categoría especificada no existe",
        },
        { status: 400 }
      );
    }

    const prismaProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock) || 0,
        categoryId,
        images: images || [],
      },
      include: {
        category: true,
      },
    });

    const product: Product = {
      ...prismaProduct,
      description: prismaProduct.description ?? undefined,
      category: {
        ...prismaProduct.category,
        description: prismaProduct.category.description ?? undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: product,
      message: "Producto creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el producto",
      },
      { status: 500 }
    );
  }
}
