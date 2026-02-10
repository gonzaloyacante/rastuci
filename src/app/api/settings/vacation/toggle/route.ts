import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

    const { enabled, title, message, showEmailCollection, startDate, endDate } =
      parsed.data;

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
        // ENDING VACATION
        await tx.vacation_period.updateMany({
          where: { endAt: null },
          data: { endAt: new Date() },
        });
      }
    });

    // Revalidate so the public layout picks up the change immediately
    revalidateTag("vacation-settings", {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Toggle API] Error toggling vacation mode:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
