import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic"; // avoid caching

export async function GET() {
  try {
    // Lightweight DB ping
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ success: true, status: "ready" });
  } catch (e) {
    return NextResponse.json(
      { success: false, status: "degraded", error: "db_unreachable" },
      { status: 503 }
    );
  }
}
