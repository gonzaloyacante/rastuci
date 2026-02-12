import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { add } from "date-fns";

const ShareWishlistSchema = z.object({
  productIds: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productIds } = ShareWishlistSchema.parse(body);

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "La lista de deseos está vacía" },
        { status: 400 }
      );
    }

    // Verify products exist
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        isActive: true, // Only share active products
      },
      select: { id: true },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos" },
        { status: 404 }
      );
    }

    const validIds = products.map((p) => p.id);
    const token = nanoid(10); // Unique 10-char token
    const expiresAt = add(new Date(), { days: 30 }); // Link valid for 30 days

    // Create Snapshot
    const sharedList = await prisma.shared_wishlists.create({
      data: {
        token,
        expiresAt,
        products: {
          connect: validIds.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json({
      token: sharedList.token,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/wishlist/shared/${sharedList.token}`,
      expiresAt: sharedList.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[WishlistShare] Error creating shared list:", error);
    return NextResponse.json(
      { error: "Error interno al compartir la lista" },
      { status: 500 }
    );
  }
}
