import { ShippingSettings } from "@/lib/validation/shipping";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images: string | string[];
    stock: number;
    onSale?: boolean;
    salePrice?: number | null;
    variants?: { color: string; size: string; stock: number }[];
  };
  quantity: number;
  size: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getItemVariantStock(item: CartItem): number {
  return (
    item.product.variants?.find(
      (v) => v.color === item.color && v.size === item.size
    )?.stock ?? item.product.stock
  );
}

export function computeOutOfStockItems(items: CartItem[]): CartItem[] {
  return items.filter((item) => {
    const stock = getItemVariantStock(item);
    return item.quantity > stock;
  });
}

export function isFreeShippingApplicable(
  total: number,
  shippingSettings: ShippingSettings
): boolean {
  if (shippingSettings.freeShipping !== true) return false;
  return (
    shippingSettings.freeShippingMinAmount === undefined ||
    total >= shippingSettings.freeShippingMinAmount
  );
}
