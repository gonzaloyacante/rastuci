import { ProductVariant } from "@/types";

export function createNewVariant(
  color: string,
  size: string,
  stock: number
): ProductVariant {
  const uid = crypto.randomUUID().slice(0, 8).toUpperCase();
  return {
    id: `temp-${Date.now()}-${uid}`,
    productId: "",
    color,
    size,
    stock,
    sku: `${color.substring(0, 3).toUpperCase()}-${size}-${uid.slice(0, 4)}`,
  };
}

export function generateVariantCombinations(
  variants: ProductVariant[],
  availableColors: string[],
  availableSizes: string[]
): { newVariants: ProductVariant[]; addedCount: number } {
  const newVariants: ProductVariant[] = [...variants];
  let addedCount = 0;

  availableColors.forEach((color) => {
    availableSizes.forEach((size) => {
      if (!newVariants.some((v) => v.color === color && v.size === size)) {
        newVariants.push(createNewVariant(color, size, 0));
        addedCount++;
      }
    });
  });

  return { newVariants, addedCount };
}
