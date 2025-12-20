import { NextResponse } from "next/server";

export async function GET() {
  // Return timezone info without external API call
  // This prevents 404 errors and avoids external dependencies
  return NextResponse.json({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
