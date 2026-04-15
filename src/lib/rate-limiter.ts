import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

import { logger } from "@/lib/logger";

// ─── Rate limit presets ───────────────────────────────────────────────────────

export type RateLimitPreset = {
  limit: number;
  windowMs: number;
};

export const RATE_LIMITS = {
  api: { key: "api", limit: 100, windowMs: 15 * 60 * 1000 },
  auth: { key: "auth", limit: 5, windowMs: 15 * 60 * 1000 },
  upload: { key: "upload", limit: 10, windowMs: 60 * 1000 },
  adminApi: { key: "admin-api", limit: 200, windowMs: 15 * 60 * 1000 },
  adminAuth: { key: "admin-auth", limit: 3, windowMs: 15 * 60 * 1000 },
  products: { key: "products", limit: 50, windowMs: 60 * 1000 },
  search: { key: "search", limit: 30, windowMs: 60 * 1000 },
  cart: { key: "cart", limit: 20, windowMs: 60 * 1000 },
  order: { key: "order", limit: 5, windowMs: 60 * 1000 },
  contact: { key: "contact", limit: 3, windowMs: 60 * 60 * 1000 },
} as const;

export const rlPresets = {
  publicRead: { limit: 120, windowMs: 10 * 60 * 1000 },
  publicReadHeavy: { limit: 240, windowMs: 10 * 60 * 1000 },
  mutatingLow: { limit: 30, windowMs: 10 * 60 * 1000 },
  mutatingMedium: { limit: 60, windowMs: 10 * 60 * 1000 },
} as const;

export type PresetKey = keyof typeof rlPresets;

export function getPreset(key: PresetKey): RateLimitPreset {
  return rlPresets[key];
}

export function makeKey(method: string, path: string) {
  return `${method.toUpperCase()}_${path}`;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) {
        buckets.delete(key);
      }
    }
    if (buckets.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ─── Upstash Redis client ─────────────────────────────────────────────────────

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// ─── Main check function ──────────────────────────────────────────────────────

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs?: number;
  key: string;
};

export async function checkRateLimit(
  req: NextRequest,
  {
    key,
    limit,
    windowMs,
  }: {
    key: string;
    limit: number;
    windowMs: number;
  }
): Promise<RateLimitResult> {
  const ip = getIp(req);
  const compositeKey = `${key}:${ip}`;

  if (redis) {
    try {
      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: true,
        prefix: "@upstash/ratelimit",
      });

      const result = await ratelimit.limit(compositeKey);

      return {
        ok: result.success,
        remaining: result.remaining,
        retryAfterMs: result.reset - Date.now(),
        key: compositeKey,
      };
    } catch (error) {
      logger.error("Upstash rate limit error, falling back to in-memory", {
        error,
      });
    }
  }

  const now = Date.now();
  const bucket = buckets.get(compositeKey);
  ensureCleanupTimer();

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(compositeKey, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), key: compositeKey };
  }

  if (bucket.count < limit) {
    bucket.count += 1;
    return {
      ok: true,
      remaining: Math.max(0, limit - bucket.count),
      key: compositeKey,
    };
  }

  return {
    ok: false,
    remaining: 0,
    retryAfterMs: Math.max(1, bucket.resetAt - now),
    key: compositeKey,
  };
}
