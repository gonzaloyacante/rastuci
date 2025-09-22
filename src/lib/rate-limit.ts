import { NextRequest } from 'next/server';

interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<boolean> {
  const { key, limit, windowMs } = config;
  const now = Date.now();
  
  // Get client identifier
  const clientId = getClientId(request, key);
  const storeKey = `${key}:${clientId}`;
  
  // Clean expired entries
  cleanExpiredEntries(now);
  
  // Get current count
  const current = store[storeKey];
  
  if (!current || current.resetTime <= now) {
    // First request or window expired
    store[storeKey] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  // Increment count
  current.count++;
  return true;
}

function getClientId(request: NextRequest, key: string): string {
  // Try to get IP from headers (for proxy/CDN scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // For user-specific limits, include user ID if available
  if (key.includes('user')) {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    return `${ip}:${userId}`;
  }
  
  return ip;
}

function cleanExpiredEntries(now: number): void {
  for (const key in store) {
    if (store[key].resetTime <= now) {
      delete store[key];
    }
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  api: { key: 'api', limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  auth: { key: 'auth', limit: 5, windowMs: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
  upload: { key: 'upload', limit: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  
  // Admin endpoints
  adminApi: { key: 'admin-api', limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes
  adminAuth: { key: 'admin-auth', limit: 3, windowMs: 15 * 60 * 1000 }, // 3 admin login attempts per 15 minutes
  
  // Public endpoints
  products: { key: 'products', limit: 50, windowMs: 60 * 1000 }, // 50 product requests per minute
  search: { key: 'search', limit: 30, windowMs: 60 * 1000 }, // 30 searches per minute
  
  // User actions
  cart: { key: 'cart', limit: 20, windowMs: 60 * 1000 }, // 20 cart operations per minute
  order: { key: 'order', limit: 5, windowMs: 60 * 1000 }, // 5 order operations per minute
  contact: { key: 'contact', limit: 3, windowMs: 60 * 60 * 1000 }, // 3 contact form submissions per hour
} as const;
