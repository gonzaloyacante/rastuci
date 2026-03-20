import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fail } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";

const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute (Brute-force protection)
    const rl = await checkRateLimit(request, {
      key: "coupon:validate",
      limit: 5,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, {
          retryAfterMs: rl.retryAfterMs,
        }),
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ValidateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    // Lookup from DB (#25/#87 fix — was hardcoded array)
    const coupon = await prisma.coupons.findFirst({
      where: {
        code,
        isActive: true,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Cupón inválido o expirado" },
        { status: 404 }
      );
    }

    // Check expiration
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "El cupón ha expirado" },
        { status: 404 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "El cupón ha alcanzado su límite de usos" },
        { status: 404 }
      );
    }

    logger.info("Coupon validated", { code: coupon.code });

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: Number(coupon.discount),
        discountType: coupon.discountType,
        minOrderTotal: coupon.minOrderTotal
          ? Number(coupon.minOrderTotal)
          : null,
        isValid: true,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
