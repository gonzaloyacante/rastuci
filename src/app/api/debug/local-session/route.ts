import { getSession } from "@/lib/session-jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // SECURITY: Only available in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }

  try {
    const s = await getSession(req);
    return NextResponse.json({ session: s ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
