export type RateLimitPreset = {
  limit: number;
  windowMs: number;
};

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
