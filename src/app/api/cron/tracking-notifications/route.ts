/**
 * API Route: GET /api/cron/tracking-notifications
 *
 * Vercel Cron Job endpoint para ejecutar el chequeo de tracking CA
 * Configurar en vercel.json:
 *
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/tracking-notifications",
 *       "schedule": "0/15 * * * *"
 *     }
 *   ]
 * }
 *
 * El schedule "0/15 * * * *" ejecuta cada 15 minutos.
 *
 * También se puede ejecutar manualmente:
 * curl https://tu-dominio.vercel.app/api/cron/tracking-notifications?secret=tu_secret
 */

import { logger } from "@/lib/logger";
import { trackingNotificationService } from "@/lib/tracking-notifications";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Máximo 60 segundos en Vercel Pro
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Validar secret para evitar ejecuciones no autorizadas
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
      logger.warn("[Cron] Unauthorized cron attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    logger.info("[Cron] Starting tracking notifications check");

    // Ejecutar chequeo manualmente (sin iniciar el servicio de polling)
    await trackingNotificationService["checkAllActiveShipments"]();

    logger.info("[Cron] Tracking notifications check completed");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("[Cron] Error in tracking notifications cron", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
