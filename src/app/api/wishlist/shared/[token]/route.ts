import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const wishlist = await prisma.shared_wishlists.findUnique({
      where: { token },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            onSale: true,
            salePrice: true,
            categories: { select: { name: true } },
          },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: "Lista de deseos no encontrada o expirada" },
        { status: 404 }
      );
    }

    if (wishlist.expiresAt && new Date() > wishlist.expiresAt) {
      return NextResponse.json(
        { error: "El enlace ha expirado" },
        { status: 410 }
      );
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("[GetSharedWishlist] Error:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la lista" },
      { status: 500 }
    );
  }
}
