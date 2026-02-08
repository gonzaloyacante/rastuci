import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/resend"; // We will add sendVacationReopening here
import { z } from "zod";

const NotifySchema = z.object({
  periodId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = NotifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { periodId } = parsed.data;

    // 1. Fetch unnotified subscribers for this period
    const subscribers = await prisma.vacation_subscriber.findMany({
      where: {
        periodId,
        notified: false,
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay suscriptores pendientes de notificar.",
      });
    }

    // 2. Send emails (Batch processing would be better for large lists, but for now loop)
    // We update 'notified' flag after sending.

    let sentCount = 0;

    // We use Promise.all for parallel sending, but limit concurrency if list is huge.
    // For MVP, simple Promise.all is fine for < 100 subs.

    const results = await Promise.allSettled(
      subscribers.map(async (sub) => {
        // We assume emailService has this method (we need to add it!)
        // If not added yet, we should add it to lib/resend.ts
        const success = await emailService.sendVacationReopening(sub.email);
        if (success) {
          await prisma.vacation_subscriber.update({
            where: { id: sub.id },
            data: { notified: true },
          });
          return true;
        }
        return false;
      })
    );

    sentCount = results.filter(
      (r) => r.status === "fulfilled" && r.value === true
    ).length;

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[Notify API] Error sending notifications:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
