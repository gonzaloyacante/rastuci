/**
 * Utility functions to transform between relational product_color_images / product_size_guides
 * rows and the Record-based shapes consumed by the API / frontend.
 *
 * This bridges the gap between the normalized DB schema and the flat API contract,
 * keeping the frontend contract stable while the backend reads from relational tables.
 */

// ─── Color Images ────────────────────────────────────────────────────────────

/** Shape returned by Prisma when including product_color_images */
interface ColorImageRow {
  color: string;
  imageUrl: string;
  sortOrder: number;
}

/**
 * Convert relational rows → Record<color, imageUrls[]> for the API response.
 * Preserves sort order within each color group.
 */
export function colorImageRowsToRecord(
  rows: ColorImageRow[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  // Sort by sortOrder first to maintain intended ordering
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const row of sorted) {
    if (!result[row.color]) {
      result[row.color] = [];
    }
    result[row.color].push(row.imageUrl);
  }

  return result;
}

/**
 * Convert Record<color, imageUrls[]> → Prisma create operations for product_color_images.
 * Used when creating or updating a product.
 */
export function colorImageRecordToRows(
  record: Record<string, string[]>
): { color: string; imageUrl: string; sortOrder: number }[] {
  const rows: { color: string; imageUrl: string; sortOrder: number }[] = [];

  for (const [color, urls] of Object.entries(record)) {
    for (let i = 0; i < urls.length; i++) {
      rows.push({ color, imageUrl: urls[i], sortOrder: i });
    }
  }

  return rows;
}

// ─── Size Guide ──────────────────────────────────────────────────────────────

/** Shape returned by Prisma when including product_size_guides */
interface SizeGuideRow {
  size: string;
  measurements: string;
  ageRange: string | null;
}

/** Frontend-friendly size guide shape */
export interface SizeGuideEntry {
  size: string;
  measurements: string;
  ageRange?: string;
}

/**
 * Convert relational rows → SizeGuideEntry[] for the API response.
 */
export function sizeGuideRowsToArray(rows: SizeGuideRow[]): SizeGuideEntry[] {
  return rows.map((row) => ({
    size: row.size,
    measurements: row.measurements,
    ageRange: row.ageRange ?? undefined,
  }));
}

/**
 * Convert SizeGuideEntry[] or legacy JSON → Prisma create operations.
 * Handles both the new array format and legacy blob format gracefully.
 */
export function sizeGuideToRows(
  data: unknown
): { size: string; measurements: string; ageRange?: string }[] {
  if (!data) return [];

  // Already in array format
  if (Array.isArray(data)) {
    return data
      .filter(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          typeof entry.size === "string" &&
          typeof entry.measurements === "string"
      )
      .map((entry) => ({
        size: entry.size,
        measurements: entry.measurements,
        ageRange:
          typeof entry.ageRange === "string" ? entry.ageRange : undefined,
      }));
  }

  // Legacy object format: { "S": "Pecho: 40cm", "M": "Pecho: 42cm" }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string")
      .map(([size, measurements]) => ({
        size,
        measurements: measurements as string,
      }));
  }

  return [];
}
