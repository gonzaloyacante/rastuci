import { ProductVariant } from "@/types";

export function createNewVariant(
  color: string,
  size: string,
  stock: number
): ProductVariant {
  return {
    id: `temp-${Date.now()}-${Math.random()}`,
    productId: "",
    color,
    size,
    stock,
    sku: `${color.substring(0, 3).toUpperCase()}-${size}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
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
