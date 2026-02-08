import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const periods = await prisma.vacation_period.findMany({
      orderBy: { startAt: "desc" },
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
    });

    return NextResponse.json(periods);
  } catch (error) {
    console.error("[Periods API] Error fetching history:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
