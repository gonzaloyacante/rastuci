"use client";

import { CreditCard, ShieldCheck, Truck } from "lucide-react";

import { ColorSwatch } from "@/components/products/list/ProductHelpers";
import {
  SizeGuide,
  SizeGuideData,
} from "@/components/products/variants/SizeGuide";
import { Button } from "@/components/ui/Button";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { getColorHex } from "@/utils/colors";
import { formatPriceARS } from "@/utils/formatters";

// ─── Loading skeletons ────────────────────────────────────────────────────────

export const ImageGallerySkeleton = () => (
  <Skeleton className="w-full h-96" rounded="lg" />
);

export const ReviewsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={`skeleton-review-${i}`} className="p-4 surface rounded-lg">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export const RelatedProductsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={`skeleton-related-${i}`} />
      ))}
    </div>
  </div>
);

// ─── Stock badge ──────────────────────────────────────────────────────────────

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return <span className="text-error font-medium">✗ Agotado</span>;
  if (stock <= 5)
    return (
      <span className="text-warning font-semibold animate-pulse">
        ⚡ ¡Últimas {stock} unidades!
      </span>
    );
  return <span className="text-success font-medium">✓ Disponible</span>;
}

// ─── Quantity stepper ─────────────────────────────────────────────────────────

interface QuantityStepperProps {
  quantity: number;
  maxStock: number;
  onChange: (q: number) => void;
}

export function QuantityStepper({
  quantity,
  maxStock,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        variant="outline"
        className={`w-8 h-8 p-0 border border-muted rounded flex items-center justify-center ${quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:surface-secondary"}`}
      >
        -
      </Button>
      <input
        type="number"
        min="1"
        max={maxStock}
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (isNaN(val)) onChange(1);
          else if (val > maxStock) onChange(maxStock);
          else if (val < 1) onChange(1);
          else onChange(val);
        }}
        className="w-16 h-8 text-center border border-muted rounded bg-surface text-primary"
      />
      <Button
        onClick={() => onChange(Math.min(maxStock, quantity + 1))}
        disabled={quantity >= maxStock}
        variant="outline"
        className={`w-8 h-8 p-0 border border-muted rounded flex items-center justify-center ${
          quantity >= maxStock
            ? "opacity-50 cursor-not-allowed"
            : "hover:surface-secondary"
        }`}
      >
        +
      </Button>
    </div>
  );
}

// ─── Product price display ─────────────────────────────────────────────────────

export function ProductPriceDisplay({
  price,
  salePrice,
  onSale,
}: {
  price: number;
  salePrice?: number | null;
  onSale?: boolean;
}) {
  if (onSale && salePrice) {
    const discount = Math.round(((price - salePrice) / price) * 100);
    return (
      <div className="flex items-center space-x-4">
        <span className="text-3xl font-bold text-success">
          {formatPriceARS(salePrice)}
        </span>
        <span className="text-lg muted line-through">
          {formatPriceARS(price)}
        </span>
        <span className="text-sm bg-error text-white px-2 py-1 rounded">
          -{discount}%
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center space-x-4">
      <span className="text-3xl font-bold text-primary">
        {formatPriceARS(price)}
      </span>
    </div>
  );
}

// ─── Benefits row ──────────────────────────────────────────────────────────────

type ShippingInfo = {
  freeShipping: boolean;
  freeShippingLabel?: string;
  estimatedDelivery?: string;
};

export function ProductBenefitsRow({ shipping }: { shipping: ShippingInfo }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-muted">
      <div className="flex items-center space-x-2">
        <Truck className="w-5 h-5 text-primary" />
        <span className="text-sm">
          {shipping.freeShipping ? (
            <span className="text-success font-semibold">
              {shipping.freeShippingLabel || "Envío Gratis"}
            </span>
          ) : (
            shipping.estimatedDelivery || "Envío a todo el país"
          )}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <span className="text-sm">Garantía</span>
      </div>
      <div className="flex items-center space-x-2">
        <CreditCard className="w-5 h-5 text-primary" />
        <span className="text-sm">Múltiples medios de pago</span>
      </div>
    </div>
  );
}

// ─── Color selector section ───────────────────────────────────────────────────

interface ColorSelectorSectionProps {
  availableColors: string[];
  selectedColor: string;
  colorImagesMap: Record<string, string[]>;
  onSelectColor: (color: string) => void;
}

export function ColorSelectorSection({
  availableColors,
  selectedColor,
  colorImagesMap,
  onSelectColor,
}: ColorSelectorSectionProps) {
  if (availableColors.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary mt-2 mb-3">
        Color:{" "}
        <span className="font-normal text-base">
          {selectedColor || "Elegí uno"}
        </span>
      </h2>
      <div className="flex items-center gap-3 flex-wrap">
        {availableColors.map((color: string, idx: number) => (
          <ColorSwatch
            key={`color-${color}-${idx}`}
            color={color}
            images={colorImagesMap?.[color] || []}
            isSelected={selectedColor === color}
            onClick={() => onSelectColor(color)}
            colorHex={getColorHex(color)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Size selector section ────────────────────────────────────────────────────

type ProductVariant = { color: string; size: string; stock: number };
type SizeGuideEntry = {
  size: string;
  measurements: string;
  ageRange?: string;
};

interface SizeSelectorSectionProps {
  allSizes: string[];
  hasVariants: boolean;
  variants?: ProductVariant[];
  selectedColor: string;
  selectedSize: string;
  sizeGuide?: SizeGuideEntry[] | null;
  onSelectSize: (size: string) => void;
}

export function SizeSelectorSection({
  allSizes,
  hasVariants,
  variants,
  selectedColor,
  selectedSize,
  sizeGuide,
  onSelectSize,
}: SizeSelectorSectionProps) {
  if (allSizes.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-primary">
          Talle:{" "}
          <span className="font-normal text-base">
            {selectedSize || "Elegí uno"}
          </span>
        </h2>
        <SizeGuide data={sizeGuide as SizeGuideData} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {allSizes.map((size) => {
          let isDisabled = false;
          let isOOS = false;

          if (hasVariants) {
            if (selectedColor) {
              const v = variants?.find(
                (v) => v.color === selectedColor && v.size === size
              );
              if (!v || v.stock <= 0) {
                isDisabled = true;
                isOOS = true;
              }
            } else {
              const totalStockForSize =
                variants
                  ?.filter((v) => v.size === size)
                  .reduce((acc, v) => acc + v.stock, 0) || 0;
              if (totalStockForSize <= 0) isOOS = true;
            }
          }

          return (
            <Button
              key={size}
              onClick={() => !isDisabled && onSelectSize(size)}
              disabled={isDisabled}
              variant="ghost"
              className={`
                min-w-12 px-3 py-2 border rounded-lg text-sm font-medium transition-all h-auto
                ${
                  selectedSize === size
                    ? "border-primary bg-primary text-white shadow-md hover:bg-primary hover:text-white"
                    : isDisabled
                      ? "border-muted bg-muted/10 text-muted-foreground cursor-not-allowed opacity-50 box-decoration-slice"
                      : "border-muted hover:border-primary text-primary bg-surface hover:bg-muted/10"
                }
                ${isOOS && !isDisabled ? "border-dashed" : ""}
              `}
            >
              {size}
            </Button>
          );
        })}
      </div>
      {sizeGuide && sizeGuide.length > 0 ? (
        <SizeTableWithGuide
          sizeGuide={sizeGuide}
          hasVariants={hasVariants}
          variants={variants}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onSelectSize={onSelectSize}
        />
      ) : allSizes.length > 1 && hasVariants ? (
        <SizeStockTable
          sizes={allSizes}
          variants={variants}
          selectedColor={selectedColor}
        />
      ) : null}
    </div>
  );
}

// Private sub-tables

function SizeTableWithGuide({
  sizeGuide,
  hasVariants,
  variants,
  selectedColor,
  selectedSize,
  onSelectSize,
}: {
  sizeGuide: SizeGuideEntry[];
  hasVariants: boolean;
  variants?: ProductVariant[];
  selectedColor: string;
  selectedSize: string;
  onSelectSize: (size: string) => void;
}) {
  const hasAgeRange = sizeGuide.some((s) => s.ageRange);
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-muted/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/20 text-left">
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              Talle
            </th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              Medidas
            </th>
            {hasAgeRange && (
              <th className="px-3 py-2 font-semibold text-muted-foreground">
                Edad ref.
              </th>
            )}
            {hasVariants && (
              <th className="px-3 py-2 font-semibold text-muted-foreground text-center">
                Stock
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sizeGuide.map((entry, idx) => {
            const variantStock = hasVariants
              ? (variants
                  ?.filter(
                    (v) =>
                      v.size === entry.size &&
                      (!selectedColor || v.color === selectedColor)
                  )
                  .reduce((sum, v) => sum + v.stock, 0) ?? 0)
              : null;
            const isSelected = selectedSize === entry.size;
            const isUnavailable = variantStock !== null && variantStock === 0;
            return (
              <tr
                key={idx}
                onClick={() => {
                  if (!isUnavailable) onSelectSize(entry.size);
                }}
                className={`border-t border-muted/30 transition-colors ${
                  isUnavailable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${isSelected ? "bg-primary/10" : "hover:bg-muted/10"}`}
              >
                <td className="px-3 py-2 font-semibold">{entry.size}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {entry.measurements}
                </td>
                {hasAgeRange && (
                  <td className="px-3 py-2 text-muted-foreground">
                    {entry.ageRange || "—"}
                  </td>
                )}
                {variantStock !== null && (
                  <td className="px-3 py-2 text-center">
                    {variantStock > 0 ? (
                      <span className="text-xs font-medium text-emerald-600">
                        ✓ Disponible
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-500">
                        Sin stock
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SizeStockTable({
  sizes,
  variants,
  selectedColor,
}: {
  sizes: string[];
  variants?: ProductVariant[];
  selectedColor: string;
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-muted/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/20 text-left">
            <th className="px-3 py-2 font-semibold text-muted-foreground">
              Talle
            </th>
            <th className="px-3 py-2 font-semibold text-muted-foreground text-center">
              Disponibilidad
            </th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size, idx) => {
            const totalStock =
              variants
                ?.filter(
                  (v) =>
                    v.size === size &&
                    (!selectedColor || v.color === selectedColor)
                )
                .reduce((sum, v) => sum + v.stock, 0) ?? 0;
            return (
              <tr
                key={idx}
                className="border-t border-muted/30 hover:bg-muted/10 transition-colors"
              >
                <td className="px-3 py-2 font-semibold">{size}</td>
                <td className="px-3 py-2 text-center">
                  {totalStock > 0 ? (
                    <span className="text-xs font-medium text-emerald-600">
                      ✓ Disponible
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-500">
                      Agotado
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
