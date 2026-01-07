/**
 * Standard clothing size order.
 * Lower index = Smaller size.
 */
const SIZE_ORDER: Record<string, number> = {
  // Universal
  XXXS: 1,
  XXS: 2,
  XS: 3,
  S: 4,
  M: 5,
  L: 6,
  XL: 7,
  XXL: 8,
  XXXL: 9,
  "3XL": 9,
  "4XL": 10,
  "5XL": 11,

  // Numeric (Children/Pants often start at 0 or 1)
  "0": 100,
  "1": 101,
  "2": 102,
  "3": 103,
  "4": 104,
  "5": 105,
  "6": 106,
  "7": 107,
  "8": 108,
  "9": 109,
  "10": 110,
  "12": 112,
  "14": 114,
  "16": 116,
  "18": 118,
  "20": 120,
  "22": 122,
  "24": 124,
  "26": 126,
  "28": 128,
  "30": 130,
  "32": 132,
  "34": 134,
  "36": 136,
  "38": 138,
  "40": 140,
  "42": 142,
  "44": 144,
  "46": 146,
  "48": 148,
  "50": 150,
};

/**
 * Helper to get sort weight of a size string.
 * - Known sizes get their predefined weight.
 * - Unknown numeric strings get parsed + 1000 offset (to come after standard text sizes but sorted numerically).
 * - Unknown text gets a high weight and sorts alphabetically at the end.
 */
function getSizeWeight(size: string): number {
  const normalized = size.toUpperCase().trim();

  // 1. Exact match in standard list
  if (SIZE_ORDER[normalized] !== undefined) {
    return SIZE_ORDER[normalized];
  }

  // 2. Numeric size (e.g. "37", "41.5")
  const numeric = parseFloat(normalized);
  if (!isNaN(numeric)) {
    // Offset by 100 so small numbers come after "XXL" if they overlap,
    // or we can decide logic.
    // User requested: "1, 2, 3, 4, 5" sorted in that order.
    // My SIZE_ORDER map handles 0-50 explicitly with offset 100+.
    // If it's outside that map, we map it relative to them.
    return 100 + numeric;
  }

  // 3. Unknown text (Alphabetical at the end)
  return 9999;
}

/**
 * Sorts an array of size strings.
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const wA = getSizeWeight(a);
    const wB = getSizeWeight(b);

    if (wA !== wB) return wA - wB;

    // Fallback: Alphabetical for unknown text
    return a.localeCompare(b);
  });
}

/**
 * Sorts an array of objects based on a size property.
 */
export function sortVariantsBySize<T extends { size: string }>(
  variants: T[]
): T[] {
  return [...variants].sort((a, b) => {
    const wA = getSizeWeight(a.size);
    const wB = getSizeWeight(b.size);

    if (wA !== wB) return wA - wB;
    return a.size.localeCompare(b.size);
  });
}
