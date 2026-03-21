"use client";

import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DynamicTags } from "@/components/products/DynamicTags";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useFavorites } from "@/hooks/useFavorites";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import { sortSizes } from "@/utils/sizes";

// ============================================================================
// StarRating — sólo se usa en tarjetas públicas
// ============================================================================

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalfStar
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-zinc-200 text-zinc-200"
            }`}
          />
        ))}
      </div>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-xs muted ml-1">({reviewCount})</span>
      )}
    </div>
  );
}

// ============================================================================
// PublicProductCard
// ============================================================================

interface PublicProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: "grid" | "list";
}

export function PublicProductCard({
  product,
  priority = false,
  layout = "grid",
}: PublicProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const { isFavorite, toggleFavorite } = useFavorites();

  const sortedSizes = useMemo(() => {
    if (!product.sizes) return [];
    return sortSizes(product.sizes);
  }, [product.sizes]);

  const mainImage = useMemo(
    () => product.images?.[0] ?? null,
    [product.images]
  );

  const formattedPrice = useMemo(
    () => formatPriceARS(product.price),
    [product.price]
  );

  const formattedSalePrice = useMemo(
    () => (product.salePrice ? formatPriceARS(product.salePrice) : null),
    [product.salePrice]
  );

  const discountPercentage = useMemo(() => {
    if (
      product.onSale &&
      product.salePrice &&
      product.salePrice < product.price
    ) {
      return Math.round(
        ((product.price - product.salePrice) / product.price) * 100
      );
    }
    return 0;
  }, [product.onSale, product.price, product.salePrice]);

  const effectiveStock = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.stock;
  }, [product.variants, product.stock]);

  const isProductFavorite = useMemo(
    () => isFavorite(product.id),
    [isFavorite, product.id]
  );

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  // =========================================================================
  // VARIANTE PÚBLICA - GRID
  // =========================================================================
  if (layout === "grid") {
    return (
      <article className="group h-full flex flex-col product-card relative cursor-pointer">
        {product.onSale && discountPercentage > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10 badge-discount">
            -{discountPercentage}% OFF
          </div>
        )}

        <div className="overflow-hidden shrink-0">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
            className="block relative h-[160px] sm:h-[200px] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            <OptimizedImage
              src={product.images?.[imageIndex]}
              alt={`${product.name} - ${product.categories?.name || "Producto"}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              quality={85}
              showTextFallback={true}
              onError={() => {
                if (product.images && imageIndex < product.images.length - 1) {
                  setImageIndex((prev) => prev + 1);
                }
              }}
            />
          </Link>
        </div>

        {effectiveStock === 0 && (
          <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center pointer-events-none">
            <span className="surface text-base-primary px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Agotado
            </span>
          </div>
        )}

        <div className="p-3 sm:p-5 flex flex-col flex-1 surface">
          <p className="text-[11px] font-semibold tracking-[1px] uppercase muted mb-[5px]">
            {product.categories?.name || "Sin categoría"}
          </p>

          <Link
            href={`/productos/${product.id}`}
            className="block mb-1.5 sm:mb-2.5"
          >
            <h3 className="text-[15px] sm:text-[18px] font-bold text-base-primary tracking-[-0.5px] m-0 line-clamp-2 hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-[12px] sm:text-[13px] text-base-secondary leading-[1.4] mb-2 sm:mb-3 line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em]">
            {product.description || "\u00A0"}
          </p>

          <div className="mb-2 sm:mb-[15px] min-h-5 sm:min-h-6 flex items-center">
            {sortedSizes && sortedSizes.length > 0 ? (
              <DynamicTags items={sortedSizes} />
            ) : (
              <div className="h-5 sm:h-6" />
            )}
          </div>

          <div className="flex-1" />

          <div className="shrink-0 mt-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                {product.onSale &&
                formattedSalePrice &&
                product.salePrice! < product.price ? (
                  <>
                    <span className="text-[13px] line-through muted mb-0.5">
                      {formattedPrice}
                    </span>
                    <span className="text-[20px] font-bold text-base-primary">
                      {formattedSalePrice}
                    </span>
                  </>
                ) : (
                  <span className="text-[20px] font-bold text-base-primary">
                    {formattedPrice}
                  </span>
                )}
              </div>

              <Link
                href={`/productos/${product.id}`}
                aria-label="Ver opciones"
                className={`btn-cart ${effectiveStock === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex justify-between items-center border-t border-theme pt-3">
              {product.rating && product.rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-[12px] font-medium text-base-primary">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviewCount && product.reviewCount > 0 && (
                    <span className="text-[11px] muted">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] muted">Sin reseñas</span>
              )}

              {effectiveStock > 0 && effectiveStock <= 10 ? (
                <span className="text-[11px] font-semibold text-amber-500">
                  ¡Últimas {effectiveStock}!
                </span>
              ) : effectiveStock > 0 ? (
                <span className="text-[11px] font-semibold text-green-500">
                  En stock
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          aria-label={
            isProductFavorite
              ? `Quitar ${product.name} de favoritos`
              : `Agregar ${product.name} a favoritos`
          }
          className={`absolute top-2.5 left-2.5 z-10 p-2 rounded-full surface-muted backdrop-blur-sm shadow-md transition-all duration-200 hover:scale-110 ${
            isProductFavorite
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isProductFavorite
                ? "text-rose-500 fill-rose-500"
                : "text-zinc-400 hover:text-rose-500"
            }`}
            aria-hidden="true"
          />
        </button>
      </article>
    );
  }

  // =========================================================================
  // VARIANTE PÚBLICA - LIST
  // =========================================================================
  return (
    <article className="group relative surface rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-theme">
      <div className="flex">
        <div className="relative w-28 sm:w-36 md:w-40 shrink-0 overflow-hidden">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
          >
            <div className="relative h-full min-h-28 sm:min-h-32">
              <OptimizedImage
                src={mainImage || ""}
                alt={`${product.name} - ${product.categories?.name || "Producto"}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority={priority}
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                quality={80}
                showTextFallback={false}
              />
            </div>
          </Link>

          {product.onSale && discountPercentage > 0 && (
            <div className="absolute top-1.5 left-1.5 badge-discount text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {effectiveStock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="surface text-base-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wide muted font-semibold truncate">
              {product.categories?.name}
            </p>
            {product.rating && product.rating > 0 && (
              <div className="shrink-0">
                <StarRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>
            )}
          </div>

          <Link href={`/productos/${product.id}`} className="mb-1.5">
            <h3 className="text-sm sm:text-base font-bold text-base-primary line-clamp-1 sm:line-clamp-2 hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {sortedSizes && sortedSizes.length > 0 && (
            <div className="mb-2 w-full max-w-[200px]">
              <DynamicTags
                items={sortedSizes}
                itemClassName="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded surface-secondary muted font-medium whitespace-nowrap shrink-0"
                badgeClassName="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded surface-secondary muted font-medium whitespace-nowrap shrink-0"
              />
            </div>
          )}

          <div className="flex-1" />

          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                {product.onSale &&
                formattedSalePrice &&
                product.salePrice! < product.price ? (
                  <>
                    <span className="text-base sm:text-lg font-bold text-base-primary">
                      {formattedSalePrice}
                    </span>
                    <span className="text-[10px] sm:text-xs muted line-through">
                      {formattedPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-base-primary">
                    {formattedPrice}
                  </span>
                )}
              </div>
              {effectiveStock > 0 && effectiveStock <= 10 ? (
                <span className="text-[9px] sm:text-[10px] font-semibold text-amber-500">
                  ¡Últimas {effectiveStock} unidades!
                </span>
              ) : effectiveStock > 0 ? (
                <span className="text-[9px] sm:text-[10px] font-medium text-green-600">
                  En stock
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleToggleFavorite}
                aria-label={
                  isProductFavorite
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
                }
                className="p-1.5 sm:p-2 rounded-full border border-transparent hover:border-primary hover:bg-primary/10 transition-all duration-200"
              >
                <Heart
                  className={`w-4 h-4 ${isProductFavorite ? "text-rose-500 fill-rose-500" : "muted hover:text-rose-500"}`}
                />
              </button>

              <Link
                href={`/productos/${product.id}`}
                aria-label="Ver opciones"
                className={`p-1.5 sm:p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 ${
                  effectiveStock === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
