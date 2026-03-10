import { add } from "date-fns";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

const ShareWishlistSchema = z.object({
  productIds: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent wishlist spam
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/wishlist/share"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos" },
        { status: 429 }
      );
    }

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
    const token = nanoid(21); // 21 chars ≈ 126-bit entropy (safe against brute-force)
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
      url: `${process.env.NEXT_PUBLIC_APP_URL}/wishlist/shared/${sharedList.token}`,
      expiresAt: sharedList.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("[WishlistShare] Error creating shared list:", { error });
    return NextResponse.json(
      { error: "Error interno al compartir la lista" },
      { status: 500 }
    );
  }
}
