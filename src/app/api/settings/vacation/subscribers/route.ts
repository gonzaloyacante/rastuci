import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
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
    console.error("[Subscribers API] Error fetching list:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
