import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Category } from "@/types";

// GET /api/categories - Obtener todas las categorías con búsqueda y paginación
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const includeProductCount =
      searchParams.get("includeProductCount") === "true";

    // Filtros de búsqueda
    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const offset = (page - 1) * limit;

    // Obtener categorías y total
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    // Contar productos por categoría si se solicita
    let categoryProductCounts: Record<string, number> = {};
    if (includeProductCount) {
      const counts = await prisma.product.groupBy({
        by: ["categoryId"],
        _count: { categoryId: true },
      });
      categoryProductCounts = counts.reduce((acc, curr) => {
        acc[curr.categoryId] = curr._count.categoryId;
        return acc;
      }, {} as Record<string, number>);
    }

    const transformedCategories = categories.map((category) => ({
      ...category,
      description: category.description ?? undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        data: transformedCategories,
        total,
        page,
        limit,
        totalPages,
        ...(includeProductCount ? { categoryProductCounts } : {}),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener las categorías",
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Crear nueva categoría
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre de la categoría es requerido",
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe una categoría con ese nombre",
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      data: transformedCategory,
      message: "Categoría creada exitosamente",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la categoría",
      },
      { status: 500 }
    );
  }
}
