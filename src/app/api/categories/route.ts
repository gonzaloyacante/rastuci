import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Category } from "@/types";

// GET /api/categories - Obtener todas las categorías
export async function GET(): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const transformedCategories = categories.map(category => ({
      ...category,
      description: category.description ?? undefined
    }));

    return NextResponse.json({
      success: true,
      data: transformedCategories,
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
      description: category.description ?? undefined
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
