import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const exp = token?.exp ?? null;
    return NextResponse.json({ exp });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const runtime = "edge";
