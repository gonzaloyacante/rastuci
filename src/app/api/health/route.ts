import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid caching

export async function GET() {
  const now = new Date();
  return NextResponse.json({
    success: true,
    status: "ok",
    timestamp: now.toISOString(),
    uptimeSec: Math.round(process.uptime()),
  });
}
