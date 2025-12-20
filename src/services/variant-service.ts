import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface VariantData {
  id?: string;
  color: string;
  size: string;
  stock: number;
  sku?: string | null;
}

export class VariantService {
  /**
   * Get all variants for a product
   */
  async getVariantsForProduct(productId: string) {
    return prisma.product_variants.findMany({
      where: { productId },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    });
  }

  /**
   * Verify if a specific variant has enough stock
   */
  async checkStock(
    productId: string,
    color: string,
    size: string,
    quantity: number
  ): Promise<boolean> {
    const variant = await prisma.product_variants.findFirst({
      where: {
        productId,
        color,
        size,
      },
    });

    if (!variant) return false;
    return variant.stock >= quantity;
  }

  /**
   * Update stock for a variant and sync parent product total stock
   */
  async updateStock(variantId: string, quantityChange: number) {
    // 1. Update variant stock
    const variant = await prisma.product_variants.update({
      where: { id: variantId },
      data: { stock: { increment: quantityChange } }, // use increment for atomic updates if possible, or direct set
    });

    // 2. Recalculate total product stock
    await this.syncProductTotalStock(variant.productId);
  }

  /**
   * Syncs the total 'stock' field in the products table with the sum of all variants.
   */
  async syncProductTotalStock(productId: string) {
    const variants = await prisma.product_variants.findMany({
      where: { productId },
      select: { stock: true },
    });

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    await prisma.products.update({
      where: { id: productId },
      data: { stock: totalStock },
    });
  }

  /**
   * Full sync of variants for a product (Admin Save)
   * - Creates new variants
   * - Updates existing ones
   * - Deletes removed ones
   */
  async syncVariants(productId: string, variantsData: VariantData[]) {
    logger.info(`Syncing variants for product ${productId}`, {
      count: variantsData.length,
    });

    return await prisma.$transaction(async (tx) => {
      // 1. Get existing variants
      const existing = await tx.product_variants.findMany({
        where: { productId },
      });

      const incomingIds = variantsData
        .map((v) => v.id)
        .filter(Boolean) as string[];

      // 2. Identify variants to delete (existing IDs not in incoming list)
      const toDelete = existing.filter((v) => !incomingIds.includes(v.id));
      if (toDelete.length > 0) {
        await tx.product_variants.deleteMany({
          where: { id: { in: toDelete.map((v) => v.id) } },
        });
      }

      // 3. Upsert (Update or Create)
      for (const v of variantsData) {
        if (v.id && existing.some((e) => e.id === v.id)) {
          // Update
          await tx.product_variants.update({
            where: { id: v.id },
            data: {
              color: v.color,
              size: v.size,
              stock: v.stock,
              sku: v.sku,
            },
          });
        } else {
          // Create
          await tx.product_variants.create({
            data: {
              productId,
              color: v.color,
              size: v.size,
              stock: v.stock,
              sku: v.sku,
            },
          });
        }
      }

      // 4. Update total stock
      // We can't use this.syncProductTotalStock here because we are in a transaction
      // and we need to count within the transaction or just sum from input if trusted.
      // Better to sum from DB within transaction.
      const allVariants = await tx.product_variants.findMany({
        where: { productId },
        select: { stock: true },
      });
      const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);

      await tx.products.update({
        where: { id: productId },
        data: { stock: totalStock },
      });
    });
  }
}

export const variantService = new VariantService();
