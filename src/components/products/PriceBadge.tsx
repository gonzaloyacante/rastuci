"use client";

import { Badge } from "@/components/ui/Badge";
import { formatPriceARS } from "@/utils/formatters";

/** Badge de precio con descuento */
export const PriceBadge = ({
  price,
  salePrice,
  onSale,
}: {
  price: number;
  salePrice?: number | null;
  onSale?: boolean;
}) => {
  const hasDiscount = onSale && salePrice && salePrice < price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  return (
    <div className="flex flex-col justify-center">
      {hasDiscount ? (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-success">
            {formatPriceARS(salePrice!)}
          </span>
          <span className="text-sm muted line-through">
            {formatPriceARS(price)}
          </span>
          {discountPercentage > 0 && (
            <Badge variant="error" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      ) : (
        <span className="text-lg font-bold text-base-primary">
          {formatPriceARS(price)}
        </span>
      )}
    </div>
  );
};
