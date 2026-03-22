import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { fail, ok } from "@/lib/apiResponse";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { variantService } from "@/services/variant-service";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}

function parseQuantityChange(body: unknown): number | null {
  const raw = (body as Record<string, unknown>)?.quantityChange;
  if (typeof raw !== "number" || !Number.isInteger(raw)) return null;
  return raw;
}

function variantStockError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof Error && error.message.startsWith("Stock insuficiente")) {
    return fail("BAD_REQUEST", error.message, 400);
  }
  return fail("INTERNAL_ERROR", "Error al actualizar el stock de la variante", 500);
}

/**
 * PATCH /api/products/[id]/variants/[variantId]
 * Adjusts stock for a specific product variant (admin only).
 * Body: { quantityChange: number }  (positive = add, negative = subtract)
 */
export const PATCH = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<{ variantId: string; newStock: number }>>> => {
    const rl = await checkRateLimit(request, {
      key: makeKey("PATCH", "/api/products/[id]/variants/[variantId]"),
      ...getPreset("mutatingMedium"),
    });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429);

    const { id, variantId } = await params;
    const body = await request.json();
    const quantityChange = parseQuantityChange(body as unknown);
    if (quantityChange === null) {
      return fail(
        "BAD_REQUEST",
        "Se requiere 'quantityChange' (integer positivo o negativo)",
        400
      );
    }

    try {
      await variantService.updateStock(variantId, quantityChange);
    } catch (error) {
      return variantStockError(error);
    }

    const variants = await variantService.getVariantsForProduct(id);
    const updated = variants.find((v) => v.id === variantId);
    return ok({ variantId, newStock: updated?.stock ?? 0 });
  }
);
