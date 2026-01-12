import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";

const SETTINGS_KEY = "home";

export async function GET(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, {
      key: "home:get",
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, {
          retryAfterMs: rl.retryAfterMs,
        })
      );
    }

    const setting = await prisma.settings.findUnique({
      where: { key: SETTINGS_KEY },
    });
    console.log("GET /api/home setting found:", setting ? "YES" : "NO");

    const value = setting?.value ?? defaultHomeSettings;

    const parsed = HomeSettingsSchema.safeParse(value);
    if (!parsed.success) {
      // If stored value is invalid for some reason, return defaults to avoid breaking UI
      logger.warn("Invalid home settings in DB, returning defaults", {
        issues: parsed.error.flatten(),
      });
      return NextResponse.json(ok(defaultHomeSettings));
    }

    return NextResponse.json(ok(parsed.data));
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("GET /api/home failed", e);
    const code: ApiErrorCode =
      e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
}

// PUT /api/home - Update homepage settings (ADMIN ONLY)
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const rl = await checkRateLimit(req, {
      key: "home:put",
      limit: 20,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, {
          retryAfterMs: rl.retryAfterMs,
        })
      );
    }

    const body = await req.json();
    console.log("PUT /api/home body:", JSON.stringify(body).slice(0, 100)); // Debug log

    const parsed = HomeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      console.log("PUT /api/home validation failed:", parsed.error.issues); // Debug log
      return NextResponse.json(fail("BAD_REQUEST", parsed.error.message, 400));
    }

    console.log("PUT /api/home upserting key:", SETTINGS_KEY); // Debug log
    const saved = await prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: parsed.data, updatedAt: new Date() },
      create: { key: SETTINGS_KEY, value: parsed.data, updatedAt: new Date() },
    });
    console.log("PUT /api/home upsert result:", JSON.stringify(saved, null, 2)); // Debug log deep

    // Explicitly construct response to avoid helper issues
    return NextResponse.json({
      success: true,
      data: saved.value,
    });
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("PUT /api/home failed", e);
    // Explicit fail response
    return NextResponse.json(
      { success: false, error: e.message, code: e.code || "INTERNAL_ERROR" },
      { status: e.status ?? 500 }
    );
  }
});
