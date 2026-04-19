/**
 * API Route: POST /api/webhooks/correo-argentino
 * Webhook para recibir notificaciones de Correo Argentino
 *
 * Si CA soporta webhooks, configurar esta URL en su panel de administración.
 */

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limiter";
import { trackingNotificationService } from "@/lib/tracking-notifications";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      key: "webhook-ca",
      limit: 100,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Validar autenticación/firma del webhook
    const authHeader = request.headers.get("authorization") ?? "";
    const expectedSecret = process.env.CORREO_ARGENTINO_WEBHOOK_SECRET;

    // Fail-Closed: If secret is missing or mismatch, deny.
    if (
      !expectedSecret ||
      !safeCompare(authHeader, `Bearer ${expectedSecret}`)
    ) {
      logger.warn("[Webhook CA] Unauthorized webhook attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
