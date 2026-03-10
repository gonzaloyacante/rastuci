import { NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = withAdminAuth(async () => {
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
    logger.error("[Periods API] Error fetching history:", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
});
