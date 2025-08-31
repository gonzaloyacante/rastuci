import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for Next.js Route Handlers
// NOTE: For production at scale, prefer a distributed limiter (e.g., Upstash Ratelimit)

type Bucket = {
  count: number;
  resetAt: number; // timestamp in ms
};

const buckets = new Map<string, Bucket>();

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  // NextRequest does not expose req.ip; fall back to user-agent as last resort
  return "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs?: number;
  key: string;
};

export function checkRateLimit(
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
): RateLimitResult {
  const ip = getIp(req);
  const compositeKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(compositeKey);

  if (!bucket || now >= bucket.resetAt) {
    // New window
    const resetAt = now + windowMs;
    buckets.set(compositeKey, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), key: compositeKey };
  }

  if (bucket.count < limit) {
    bucket.count += 1;
    return { ok: true, remaining: Math.max(0, limit - bucket.count), key: compositeKey };
  }

  // Limited
  return { ok: false, remaining: 0, retryAfterMs: Math.max(1, bucket.resetAt - now), key: compositeKey };
}
