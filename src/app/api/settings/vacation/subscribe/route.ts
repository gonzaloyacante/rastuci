import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { VacationSubscriberSchema } from "@/lib/validation/vacation";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: prevent subscriber spam
    const rl = await checkRateLimit(request, {
      key: makeKey("POST", "/api/settings/vacation/subscribe"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = VacationSubscriberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email, cartSnapshot } = parsed.data;

    // 1. Find active period
    // We assume the LATEST open period is the active one.
    // Or we find one where endAt is null.
    const activePeriod = await prisma.vacation_period.findFirst({
      where: { endAt: null },
      orderBy: { startAt: "desc" },
    });

    if (!activePeriod) {
      // If no period is formally tracked, we can't link subscription (or we create a default bucket?)
      // For now, let's require an active period. Or should we just store it without period?
      // Schema requires periodId.
      // Fallback: Check if settings says 'enabled'. If so, maybe create a period now?
      // Better: Return error or handle gracefully.
      return NextResponse.json(
        { error: "No hay un periodo de vacaciones activo registrado." },
        { status: 400 }
      );
    }

    // 2. Check duplicate
    const existing = await prisma.vacation_subscriber.findFirst({
      where: {
        email,
        periodId: activePeriod.id,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Ya estás suscrito.",
      });
    }

    // 3. Create subscriber
    await prisma.vacation_subscriber.create({
      data: {
        email,
        periodId: activePeriod.id,
        cartSnapshot: cartSnapshot ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[Subscribe API] Error subscribing:", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
