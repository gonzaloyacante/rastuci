export type RateLimitPreset = {
  limit: number;
  windowMs: number;
};
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
