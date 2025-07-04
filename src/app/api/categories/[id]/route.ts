import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Category } from "@/types";

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
      return NextResponse.json(
        {
          success: false,
          error: "Categoría no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        description: category.description ?? undefined,
        products: category.products.map((product) => ({
          ...product,
          description: product.description ?? undefined,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la categoría",
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const { id } = await params;
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

    // Verificar si existe otra categoría con ese nombre
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otra categoría con ese nombre",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...category,
        description: category.description ?? undefined,
      },
      message: "Categoría actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar la categoría",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;

    // Verificar si hay productos asociados a esta categoría
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar la categoría",
      },
      { status: 500 }
    );
  }
}
