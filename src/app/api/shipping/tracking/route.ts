import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shippingId = searchParams.get("shippingId");

    if (!shippingId) {
      return NextResponse.json(
        { success: false, error: "ID de envío requerido" },
        { status: 400 }
      );
    }

    // Autenticar si es necesario (el tracking requiere auth)
    const customerId =
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    if (!customerId) {
      await correoArgentinoService.authenticate();
    }

    const result = await correoArgentinoService.getTracking({ shippingId });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Error al obtener tracking",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking: result.data,
    });
  } catch (error) {
    logger.error("Error getting tracking:", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error obteniendo tracking",
      },
      { status: 500 }
    );
  }
}
