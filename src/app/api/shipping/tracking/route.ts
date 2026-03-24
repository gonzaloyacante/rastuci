import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

const TrackingQuerySchema = z.object({
  shippingId: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[A-Z0-9\-_]+$/i, "ID de envío inválido"),
});

async function getOrAuthenticateCustomerId(): Promise<string | null> {
  const id =
    correoArgentinoService.getCustomerId() ||
    process.env.CORREO_ARGENTINO_CUSTOMER_ID;
  if (id) return id;
  await correoArgentinoService.authenticate();
  return (
    correoArgentinoService.getCustomerId() ||
    process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
    null
  );
}

function parseShippingId(
  request: NextRequest
): { shippingId: string } | NextResponse {
  const { searchParams } = new URL(request.url);
  const parsed = TrackingQuerySchema.safeParse({
    shippingId: searchParams.get("shippingId") || undefined,
  });
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || "ID de envío inválido";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
  return { shippingId: parsed.data.shippingId };
}

export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      key: makeKey("GET", "/api/shipping/tracking"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Intentá más tarde." },
        { status: 429 }
      );
    }

    const parseResult = parseShippingId(request);
    if (parseResult instanceof NextResponse) return parseResult;

    const { shippingId } = parseResult;
    await getOrAuthenticateCustomerId();

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

    return NextResponse.json({ success: true, tracking: result.data });
  } catch (error) {
    logger.error("Error getting tracking:", { error });
    const msg =
      error instanceof Error ? error.message : "Error obteniendo tracking";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
