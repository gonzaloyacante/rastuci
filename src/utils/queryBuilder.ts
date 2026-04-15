/**
 * Safely serializes a params object to a URL query string.
 * Handles number/boolean values without unsafe type casts.
 */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      urlParams.set(key, String(value));
    }
  }
  return urlParams.toString();
}

/**
 * Appends a query string to a base URL.
 * Returns the base URL unchanged when params is empty.
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return base;
  const query = buildQuery(params);
  return query ? `${base}?${query}` : base;
}
