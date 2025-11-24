import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
