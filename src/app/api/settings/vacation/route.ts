import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { VacationSettingsSchema } from "@/lib/validation/vacation";

export async function GET() {
  try {
    const settings = await prisma.vacation_settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Return default disabled state if not found
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          title: "Modo Vacaciones",
          message: "Estamos de vacaciones.",
          showEmailCollection: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error("[Settings API] Error fetching vacation settings:", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = VacationSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const settings = await prisma.vacation_settings.upsert({
      where: { id: "default" },
      update: {
        enabled: data.enabled,
        title: data.title,
        message: data.message,
        startDate: data.startDate,
        endDate: data.endDate,
        showEmailCollection: data.showEmailCollection,
      },
      create: {
        id: "default",
        enabled: data.enabled,
        title: data.title,
        message: data.message,
        startDate: data.startDate,
        endDate: data.endDate,
        showEmailCollection: data.showEmailCollection,
      },
    });

    // El historial de vacation_period se gestiona en /api/settings/vacation/toggle
    // Este endpoint solo actualiza los metadatos (título, mensaje, fechas, emailCollection)

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error("[Settings API] Error updating vacation settings:", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
