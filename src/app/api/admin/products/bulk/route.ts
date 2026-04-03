import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { invalidateProductCache } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { ProductBulkUpdateSchema } from "@/lib/validation/product";

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // 1. Validate Input
    const validation = ProductBulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updates = validation.data;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 2. Perform Updates in Transaction (Atomicity for the whole batch? Or distinct?)
    // For bulk import, usually we want "best effort" with report, but for data consistency
    // let's do a transaction. If one fails, we abort?
    // Actually, forcing all-or-nothing is safer. Providing a list of errors is better UX
    // if we allow partial success, but Prisma transaction is all-or-nothing.
    // Let's go with TRANSACTION: strict consistency.

    await prisma.$transaction(
      updates.map((update) =>
        prisma.products.update({
          where: { id: update.id },
          data: {
            price: update.price,
            salePrice: update.salePrice,
            stock: update.stock,
            onSale: update.onSale,
            isActive: update.isActive,
            updatedAt: new Date(),
          },
        })
      )
    );

    // If transaction succeeds, all were updated.
    results.success = updates.length;

    // Invalidate product cache so public lists reflect updates
    try {
      invalidateProductCache();
    } catch (e) {
      logger.warn("invalidateProductCache failed after bulk update", {
        error: e,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updates.length} products.`,
      data: results,
    });
  } catch (error) {
    logger.error("Error in bulk update:", { error });

    // Handle generic errors (e.g. record not found in transaction)
    return NextResponse.json(
      {
        success: false,
        error: "Bulk update failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
});
