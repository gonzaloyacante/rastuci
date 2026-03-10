import { NextResponse } from "next/server";
import { z } from "zod";

import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";

const TrackingQuerySchema = z.object({
  shippingId: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[A-Z0-9\-_]+$/i, "ID de envío inválido"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = TrackingQuerySchema.safeParse({
      shippingId: searchParams.get("shippingId") ?? undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "ID de envío inválido",
        },
        { status: 400 }
      );
    }

    const { shippingId } = parsed.data;

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
