import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";

const SETTINGS_KEY = "home";

export async function GET(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: "home:get", limit: 60, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, { retryAfterMs: rl.retryAfterMs }),
      );
    }

    const setting = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    const value = setting?.value ?? defaultHomeSettings;

    const parsed = HomeSettingsSchema.safeParse(value);
    if (!parsed.success) {
      // If stored value is invalid for some reason, return defaults to avoid breaking UI
      logger.warn("Invalid home settings in DB, returning defaults", { issues: parsed.error.flatten() });
      return NextResponse.json(ok(defaultHomeSettings));
    }

    return NextResponse.json(ok(parsed.data));
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("GET /api/home failed", e);
    const code: ApiErrorCode = e.code === "INTERNAL" ? "INTERNAL_ERROR" : e.code as ApiErrorCode;
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: "home:put", limit: 20, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, { retryAfterMs: rl.retryAfterMs }),
      );
    }

    const body = await req.json();
    const parsed = HomeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("BAD_REQUEST", parsed.error.message, 400));
    }

    const saved = await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: parsed.data },
      create: { key: SETTINGS_KEY, value: parsed.data },
    });

    return NextResponse.json(ok(saved.value));
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("PUT /api/home failed", e);
    const code: ApiErrorCode = e.code === "INTERNAL" ? "INTERNAL_ERROR" : e.code as ApiErrorCode;
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
}
