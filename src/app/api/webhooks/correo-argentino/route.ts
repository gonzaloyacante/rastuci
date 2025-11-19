/**
 * API Route: POST /api/webhooks/correo-argentino
 * Webhook para recibir notificaciones de Correo Argentino
 *
 * Si CA soporta webhooks, configurar esta URL en su panel de administración.
 */

import { logger } from "@/lib/logger";
import { trackingNotificationService } from "@/lib/tracking-notifications";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Opcional: Validar autenticación/firma del webhook
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CORREO_ARGENTINO_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      logger.warn("[Webhook CA] Unauthorized webhook attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parsear payload
    const payload = await request.json();
    logger.info("[Webhook CA] Received webhook", { payload });

    // Procesar webhook
    await trackingNotificationService.handleWebhook(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[Webhook CA] Error processing webhook", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
