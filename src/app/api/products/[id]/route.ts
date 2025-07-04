import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Product } from "@/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    const responseProduct: Product = {
      ...product,
      description: product.description ?? undefined,
      images:
        typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images,
      category: {
        ...product.category,
        description: product.category.description ?? undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el producto",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = await params;
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

    const updatedPrismaProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId,
        images: images || [],
      },
      include: {
        category: true,
      },
    });

    const updatedProduct: Product = {
      ...updatedPrismaProduct,
      description: updatedPrismaProduct.description ?? undefined,
      images:
        typeof updatedPrismaProduct.images === "string"
          ? JSON.parse(updatedPrismaProduct.images)
          : updatedPrismaProduct.images,
      category: {
        ...updatedPrismaProduct.category,
        description: updatedPrismaProduct.category.description ?? undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el producto",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;

    // Verificar si hay pedidos asociados a este producto
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se puede eliminar el producto porque está incluido en pedidos existentes",
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el producto",
      },
      { status: 500 }
    );
  }
}
