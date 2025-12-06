/**
 * API Route: GET /api/cron/tracking-notifications
 *
 * Vercel Cron Job endpoint para ejecutar el chequeo de tracking CA
 * Configurado en vercel.json:
 *
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/tracking-notifications",
 *       "schedule": "0 9 * * *"
 *     }
 *   ]
 * }
 *
 * NOTA: Plan Hobby (gratis) de Vercel solo permite:
 * - 2 cron jobs máximo
 * - 1 ejecución al día (el horario exacto no está garantizado)
 * - maxDuration de 10 segundos
 *
 * El schedule "0 9 * * *" ejecuta 1 vez al día a las 9am (aprox).
 *
 * También se puede ejecutar manualmente:
 * curl https://tu-dominio.vercel.app/api/cron/tracking-notifications?secret=tu_secret
 */

import { logger } from "@/lib/logger";
import { trackingNotificationService } from "@/lib/tracking-notifications";
import { cleanExpiredReservations } from "@/utils/stockReservations";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10; // Máximo 10 segundos en Vercel Hobby (gratis)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Validar secret para evitar ejecuciones no autorizadas
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (
      expectedSecret &&
      authHeader !== `Bearer ${expectedSecret}` &&
      querySecret !== expectedSecret
    ) {
      logger.warn("[Cron] Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("[Cron] Starting daily tasks");

    // 1. Ejecutar chequeo de tracking (sin iniciar el servicio de polling)
    await trackingNotificationService["checkAllActiveShipments"]();
    logger.info("[Cron] Tracking notifications check completed");

    // 2. Limpiar reservas de stock expiradas
    await cleanExpiredReservations();
    logger.info("[Cron] Stock reservations cleanup completed");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasks: ["tracking-notifications", "stock-reservations-cleanup"],
    });
  } catch (error) {
    logger.error("[Cron] Error in tracking notifications cron", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
