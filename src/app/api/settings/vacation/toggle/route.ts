import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

const ToggleSchema = z.object({
  enabled: z.boolean(),
  title: z.string().optional().default("Modo Vacaciones"),
  message: z.string().optional().default("Estamos de vacaciones."),
  showEmailCollection: z.boolean().optional().default(true),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = ToggleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { enabled, title, message, showEmailCollection, startDate, endDate } =
      parsed.data;

    let closedPeriodId: string | null = null;

    await prisma.$transaction(async (tx) => {
      // 1. Update ALL settings (not just enabled/dates)
      await tx.vacation_settings.upsert({
        where: { id: "default" },
        update: {
          enabled,
          title,
          message,
          showEmailCollection,
          startDate,
          endDate,
        },
        create: {
          enabled,
          title,
          message,
          showEmailCollection,
          startDate,
          endDate,
        },
      });

      if (enabled) {
        // STARTING VACATION
        // Close any potentially open period first (sanity check)
        await tx.vacation_period.updateMany({
          where: { endAt: null },
          data: { endAt: new Date() },
        });

        // Create new period
        await tx.vacation_period.create({
          data: {
            startAt: startDate || new Date(),
            plannedEndAt: endDate,
          },
        });
      } else {
        // ENDING VACATION — find the open period first so we can return its ID
        const openPeriod = await tx.vacation_period.findFirst({
          where: { endAt: null },
          orderBy: { startAt: "desc" },
        });

        await tx.vacation_period.updateMany({
          where: { endAt: null },
          data: { endAt: new Date() },
        });

        closedPeriodId = openPeriod?.id ?? null;
      }
    });

    revalidateTag("vacation-settings", "default");

    return NextResponse.json({ success: true, closedPeriodId });
  } catch (error) {
    logger.error("[Toggle API] Error toggling vacation mode:", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
});
