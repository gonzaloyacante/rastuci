import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    if (!periodId) {
      return NextResponse.json(
        { error: "Period ID is required" },
        { status: 400 }
      );
    }

    const subscribers = await prisma.vacation_subscriber.findMany({
      where: { periodId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    logger.error("[Subscribers API] Error fetching list:", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
});
