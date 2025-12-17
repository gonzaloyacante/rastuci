import { z } from 'zod';

// HTML sanitization
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL injection prevention (basic)
export function sanitizeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

// General string sanitization
export function sanitizeString(input: string, maxLength = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

// Email sanitization
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

// Phone number sanitization
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20);
}

// URL sanitization
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// Pagination sanitization
export function sanitizePagination(page?: string, limit?: string) {
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit || '20', 10) || 20));

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
}

// Price sanitization
export function sanitizePrice(price: string | number): number {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return Math.max(0, Math.round((num || 0) * 100) / 100); // Round to 2 decimals, min 0
}

// Search query sanitization
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 100)
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ');
}

// File name sanitization
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 255);
}

// Zod schemas for common validations
export const schemas = {
  email: z.string().email().max(254),
  phone: z.string().regex(/^[\d+\-\s()]+$/).max(20),
  name: z.string().min(1).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/),
  address: z.string().min(1).max(500),
  price: z.number().min(0).max(999999.99),
  stock: z.number().int().min(0).max(999999),
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  search: z.string().max(100),
  pagination: z.object({
    page: z.number().int().min(1).max(1000),
    limit: z.number().int().min(1).max(50),
  }),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'name-asc', 'name-desc']),
  categoryId: z.string().uuid().optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
};

// Input validation with sanitization
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  sanitizers?: Record<string, (value: unknown) => unknown>
): { success: true; data: T } | { success: false; error: string } {
  try {
    // Apply sanitizers if provided
    let sanitizedInput = input;
    if (sanitizers && typeof input === 'object' && input !== null) {
      sanitizedInput = { ...input as Record<string, unknown> };
      for (const [key, sanitizer] of Object.entries(sanitizers)) {
        const inputRecord = sanitizedInput as Record<string, unknown>;
        if (key in inputRecord) {
          inputRecord[key] = sanitizer(inputRecord[key]);
        }
      }
    }

    const result = schema.parse(sanitizedInput);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation error: ${message}` };
    }
    return { success: false, error: 'Invalid input' };
  }
}

// Common sanitizer combinations
export const sanitizers = {
  product: {
    name: (value: unknown) => sanitizeString(String(value || ''), 200),
    description: (value: unknown) => sanitizeString(String(value || ''), 2000),
    price: (value: unknown) => sanitizePrice(value as string | number),
  },
  user: {
    name: (value: string) => sanitizeString(value, 100),
    email: sanitizeEmail,
    phone: sanitizePhone,
  },
  search: {
    query: sanitizeSearchQuery,
    categoryId: (value: string) => value?.trim(),
  },
  contact: {
    name: (value: string) => sanitizeString(value, 100),
    email: sanitizeEmail,
    message: (value: string) => sanitizeString(value, 2000),
  },
};
