import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ToggleSchema = z.object({
  enabled: z.boolean(),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ToggleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { enabled, startDate, endDate } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // 1. Update Settings
      await tx.vacation_settings.upsert({
        where: { id: "default" },
        update: {
          enabled,
          startDate, // Update dates if provided
          endDate,
        },
        create: {
          enabled,
          startDate,
          endDate,
          title: "Modo Vacaciones",
          message: "Estamos de vacaciones.",
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
            // endAt is null
          },
        });
      } else {
        // ENDING VACATION
        await tx.vacation_period.updateMany({
          where: { endAt: null },
          data: { endAt: new Date() }, // Close it now
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Toggle API] Error toggling vacation mode:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
