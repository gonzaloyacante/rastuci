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
 * Convert SizeGuideEntry[], SizeGuideData, or legacy JSON → Prisma create operations.
 *
 * Handles three formats:
 * 1. SizeGuideData editor format: { columns: string[], rows: string[][] }
 *    - rows[i] = [size, measurement1, measurement2, ...]
 *    - columns[0] = "Talle" header, columns[1..n] = measurement column names
 * 2. SizeGuideEntry[] array: [{ size, measurements, ageRange? }]
 * 3. Legacy flat object: { "S": "Pecho: 40cm", "M": "Pecho: 42cm" }
 */
export function sizeGuideToRows(
  data: unknown
): { size: string; measurements: string; ageRange?: string }[] {
  if (!data) return [];

  // Format 1: SizeGuideData from the editor { columns: string[], rows: string[][] }
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    Array.isArray((data as Record<string, unknown>).columns) &&
    Array.isArray((data as Record<string, unknown>).rows)
  ) {
    const sizeGuideData = data as { columns: string[]; rows: string[][] };
    // columns[0] is "Talle" (the size column header); measurement columns start at index 1
    const measurementColumns = sizeGuideData.columns.slice(1);
    return sizeGuideData.rows
      .filter(
        (row) =>
          Array.isArray(row) && typeof row[0] === "string" && row[0].trim()
      )
      .map((row) => {
        const size = row[0];
        const values = row.slice(1);
        // Serialize as "Column1: val1, Column2: val2" for readable storage
        const measurements = measurementColumns
          .map((col, i) => `${col}: ${values[i] ?? ""}`)
          .filter((entry) => !entry.endsWith(": "))
          .join(", ");
        return { size, measurements };
      })
      .filter((row) => row.measurements.length > 0);
  }

  // Format 2: Array of SizeGuideEntry objects
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

  // Format 3: Legacy flat object { "S": "Pecho: 40cm", "M": "Pecho: 42cm" }
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
