import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { ContactSettingsSchema, defaultContactSettings } from "@/lib/validation/contact";

const SETTINGS_KEY = "contact";

export async function GET(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: "contact:get", limit: 60, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, { retryAfterMs: rl.retryAfterMs }),
      );
    }

    const setting = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
    const value = setting?.value ?? defaultContactSettings;

    const parsed = ContactSettingsSchema.safeParse(value);
    if (!parsed.success) {
      logger.warn("Invalid contact settings in DB, returning defaults", { issues: parsed.error.flatten() });
      return NextResponse.json(ok(defaultContactSettings));
    }

    return NextResponse.json(ok(parsed.data));
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("GET /api/contact failed", e);
    const code: ApiErrorCode = e.code === "INTERNAL" ? "INTERNAL_ERROR" : e.code as ApiErrorCode;
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: "contact:put", limit: 20, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, { retryAfterMs: rl.retryAfterMs }),
      );
    }

    const body = await req.json();
    const parsed = ContactSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("BAD_REQUEST", parsed.error.message, 400));
    }

    const saved = await prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: parsed.data, updatedAt: new Date() },
      create: { key: SETTINGS_KEY, value: parsed.data, updatedAt: new Date() },
    });

    return NextResponse.json(ok(saved.value));
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("PUT /api/contact failed", e);
    const code: ApiErrorCode = e.code === "INTERNAL" ? "INTERNAL_ERROR" : e.code as ApiErrorCode;
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
}
