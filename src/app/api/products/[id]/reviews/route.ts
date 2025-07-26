import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, ProductReview } from "@/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id]/reviews - Obtener reseñas de un producto
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProductReview[]>>> {
  try {
    const { id } = await params;

    const reviews = await prisma.productReview.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener las reseñas",
      },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews - Crear una nueva reseña
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProductReview>>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, comment, customerName } = body;

    // Validaciones
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "El rating debe estar entre 1 y 5",
        },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "El nombre del cliente es requerido",
        },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id },
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

    // Crear la reseña
    const review = await prisma.productReview.create({
      data: {
        rating,
        comment,
        customerName,
        productId: id,
      },
    });

    // Actualizar el rating promedio y conteo de reseñas del producto
    const allReviews = await prisma.productReview.findMany({
      where: { productId: id },
    });

    const averageRating =
      allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la reseña",
      },
      { status: 500 }
    );
  }
}
