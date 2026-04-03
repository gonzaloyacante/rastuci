import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

import { logger } from "@/lib/logger";

// Simple in-memory rate limiter for Next.js Route Handlers (fallback)
type Bucket = {
  count: number;
  resetAt: number; // timestamp in ms
};

const buckets = new Map<string, Bucket>();

// Periodic cleanup of expired in-memory buckets to prevent memory leak
const CLEANUP_INTERVAL_MS = 60_000; // 1 minute
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
  // Allow process to exit even if timer is running
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// Upstash Redis instance
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
    if (ip) {
      return ip;
    }
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

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
    key: string; // logical key per route
    limit: number;
    windowMs: number;
  }
): Promise<RateLimitResult> {
  const ip = getIp(req);
  const compositeKey = `${key}:${ip}`;

  // Use Upstash if configured
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
        error: error,
      });
      // Fallback to in-memory if Redis fails
    }
  }

  // In-memory fallback
  const now = Date.now();
  const bucket = buckets.get(compositeKey);
  ensureCleanupTimer();

  if (!bucket || now >= bucket.resetAt) {
    // New window
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

  // Limited
  return {
    ok: false,
    remaining: 0,
    retryAfterMs: Math.max(1, bucket.resetAt - now),
    key: compositeKey,
  };
}
