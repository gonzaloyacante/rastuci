import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimiter";
import { fail } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute (Brute-force protection)
    // Cast strict Request to NextRequest-like if needed by checkRateLimit or update usage
    const rl = await checkRateLimit(request as any, {
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
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    // Simular validación de cupón (esto podría venir de una base de datos)
    const validCoupons = [
      { code: "WELCOME10", discount: 10 },
      { code: "SUMMER20", discount: 20 },
      { code: "FREESHIP", discount: 0 }, // Descuento especial para envío
    ];

    const coupon = validCoupons.find((c) => c.code === code.toUpperCase());

    if (coupon) {
      return NextResponse.json({
        success: true,
        coupon: {
          code: coupon.code,
          discount: coupon.discount,
          isValid: true,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Cupón inválido o expirado" },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
