import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { ContactSettingsSchema, defaultContactSettings } from "@/lib/validation/contact";
import { apiHandler, AppError } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

const SETTINGS_KEY = "contact";

// Handler for GET
export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    // 1. Rate Limit
    const rl = await checkRateLimit(req, { key: "contact:get", limit: 60, windowMs: 60_000 });
    if (!rl.ok) {
      throw new AppError("Too many requests", 429);
    }

    // 2. Logic
    const setting = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
    const value = setting?.value ?? defaultContactSettings;

    const parsed = ContactSettingsSchema.safeParse(value);
    if (!parsed.success) {
      logger.warn("Invalid contact settings in DB, returning defaults", { issues: parsed.error.flatten() });
      return defaultContactSettings;
    }

    return parsed.data;
  }, "GET /api/contact");
}

// Handler for PUT
export async function PUT(req: NextRequest) {
  return apiHandler(async () => {
    // 1. Rate Limit
    const rl = await checkRateLimit(req, { key: "contact:put", limit: 20, windowMs: 60_000 });
    if (!rl.ok) {
      throw new AppError("Too many requests", 429);
    }

    // 2. Logic
    const body = await req.json();
    const parsed = ContactSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(parsed.error.message, 400);
    }

    const saved = await prisma.settings.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: parsed.data, updatedAt: new Date() },
      create: { key: SETTINGS_KEY, value: parsed.data, updatedAt: new Date() },
    });

    return saved.value;
  }, "PUT /api/contact");
}
