import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";

// Debug endpoints are admin-only and blocked in production
export const GET = withAdminAuth(async (request: NextRequest) => {
  // Block in production for safety — Vercel preview also uses NODE_ENV=production
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 }
    );
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: request.url,
    headers: {
      host: request.headers.get("host"),
      "x-forwarded-host": request.headers.get("x-forwarded-host"),
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT_SET",
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  };

  return NextResponse.json(debugInfo);
});
