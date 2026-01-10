"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/hooks/useFavorites";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import { sortSizes } from "@/utils/sizes";
import {
  Edit,
  Eye,
  Heart,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
// import { useHotToast } from "@/hooks/use-hot-toast";

// ============================================================================
// Sub-componentes reutilizables
// ============================================================================

import { StockBadge } from "@/components/ui/StockBadge";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { COMMON_COLORS } from "@/components/products/ProductFormComponents";
import { DynamicTags } from "@/components/products/DynamicTags";

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

/** Componente de estrellas de rating */
const StarRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) => {
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
};

// ============================================================================
// Tipos e interfaces
// ============================================================================

interface ProductCardBaseProps {
  product: Product;
  priority?: boolean;
}

interface PublicProductCardProps extends ProductCardBaseProps {
  variant?: "public" | "grid" | "list";
  layout?: "grid" | "list";
}

interface AdminProductCardProps extends ProductCardBaseProps {
  variant: "admin";
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
}

export type ProductCardProps = PublicProductCardProps | AdminProductCardProps;

// ============================================================================
// Componente Principal
// ============================================================================

const ProductCard = React.memo((props: ProductCardProps) => {
  const { product, priority = false } = props;
  // const { success: toastSuccess, error: toastError } = useHotToast();

  const isAdmin = props.variant === "admin";

  const layout: "grid" | "list" = !isAdmin
    ? (props as PublicProductCardProps).layout ||
      (props.variant === "list" ? "list" : "grid")
    : "grid";

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { isFavorite, toggleFavorite } = useFavorites();
  // const { addToCart } = useCart(); // Refactor: Removed to enforce Detail Page navigation

  const productImages = useMemo(() => {
    try {
      return typeof product.images === "string"
        ? JSON.parse(product.images)
        : product.images || [];
    } catch {
      return [];
    }
  }, [product.images]);

  const sortedSizes = useMemo(() => {
    if (!product.sizes) return [];
    return sortSizes(product.sizes);
  }, [product.sizes]);

  const mainImage = useMemo(
    () => (productImages.length > 0 ? productImages[0] : null),
    [productImages]
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

  const isProductFavorite = useMemo(
    () => (!isAdmin ? isFavorite(product.id) : false),
    [isFavorite, product.id, isAdmin]
  );

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAdmin) {
        toggleFavorite(product.id);
      }
    },
    [toggleFavorite, product.id, isAdmin]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // =========================================================================
  // VARIANTE ADMIN
  // =========================================================================
  if (isAdmin) {
    const { onEdit, onDelete, onView } = props as AdminProductCardProps;

    return (
      <div className="group surface border border-theme rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden h-full flex flex-col">
        {/* Image Section */}
        <div className="relative shrink-0">
          <div className="aspect-square surface-secondary rounded-t-xl overflow-hidden">
            {imageError || !mainImage ? (
              <ProductImagePlaceholder className="w-full h-full" />
            ) : (
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 surface-secondary animate-pulse" />
                )}
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </div>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {productImages.length > 1 && (
              <Badge className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm shadow-sm border-0">
                +{productImages.length - 1} fotos
              </Badge>
            )}
          </div>

          {/* Sale Badge - Top Right */}
          {product.onSale && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-rose-600 text-white border-0 shadow-md font-bold hover:bg-rose-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                OFERTA
              </Badge>
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                className="surface backdrop-blur-sm shadow-lg border-theme"
                onClick={() => onView(product.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3 flex flex-col flex-1">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1 text-base-primary group-hover:text-pink-600 transition-colors">
                {product.name}
              </h3>
              {!!product.rating &&
                !!product.reviewCount &&
                product.reviewCount > 0 && (
                  <StarRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                )}
            </div>

            {product.categories && (
              <Badge variant="outline" className="text-xs">
                {product.categories.name}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {sortedSizes && sortedSizes.length > 0 && (
              <div>
                <span className="text-xs muted mb-1 block">Talles:</span>
                <div className="flex flex-wrap gap-1">
                  {sortedSizes.map((size, index) => (
                    <Badge
                      key={`size-${index}`}
                      variant="outline"
                      className="text-xs px-2 py-0.5"
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs muted">Colores:</span>
                <div className="flex gap-1">
                  {product.colors.map((color, index) => {
                    // Try to find the color in our common colors list
                    const matchedColor = COMMON_COLORS.find(
                      (c) =>
                        c.name.toLowerCase() === color.toLowerCase() ||
                        color.toLowerCase().includes(c.name.toLowerCase())
                    );

                    // Use mapped hex, or fallback to the name (for standard CSS colors or custom hexes)
                    const bgStyle = matchedColor ? matchedColor.hex : color;

                    return (
                      <div
                        key={`color-${index}`}
                        className="w-4 h-4 rounded-full border border-theme shadow-sm relative"
                        style={{ backgroundColor: bgStyle }}
                        title={color}
                      >
                        {/* Border for white/light colors */}
                        {(bgStyle.toLowerCase() === "#ffffff" ||
                          bgStyle.toLowerCase() === "white") && (
                          <div className="absolute inset-0 rounded-full border border-neutral-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <StockBadge stock={product.stock} />
            </div>
          </div>

          <div className="pt-2 border-t border-theme mt-auto">
            <PriceBadge
              price={product.price}
              salePrice={product.salePrice}
              onSale={product.onSale}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(product.id)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(product.id)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VARIANTE PÚBLICA - GRID
  // =========================================================================
  if (layout === "grid") {
    return (
      <article className="group h-full flex flex-col product-card relative cursor-pointer">
        {/* Badge de oferta - esquina superior derecha */}
        {product.onSale && discountPercentage > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10 badge-discount">
            -{discountPercentage}% OFF
          </div>
        )}

        {/* Imagen */}
        <div className="overflow-hidden shrink-0">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
            className="block h-[160px] sm:h-[200px] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            <Image
              src={
                imageError || !mainImage
                  ? "https://placehold.co/400x500.png"
                  : mainImage
              }
              alt={`${product.name} - ${product.categories?.name || "Producto"}`}
              width={400}
              height={200}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              quality={85}
            />
          </Link>
        </div>

        {/* Overlay de sin stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center pointer-events-none">
            <span className="surface text-base-primary px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Agotado
            </span>
          </div>
        )}

        {/* Info - flex-1 para ocupar todo el espacio disponible */}
        <div className="p-3 sm:p-5 flex flex-col flex-1 surface">
          {/* Categoría */}
          <p className="text-[11px] font-semibold tracking-[1px] uppercase muted mb-[5px]">
            {product.categories?.name || "Sin categoría"}
          </p>

          {/* Título - altura fija para alineación */}
          <Link
            href={`/productos/${product.id}`}
            className="block mb-1.5 sm:mb-2.5"
          >
            <h3 className="text-[15px] sm:text-[18px] font-bold text-base-primary tracking-[-0.5px] m-0 line-clamp-2 hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Descripción corta - altura fija */}
          <p className="text-[12px] sm:text-[13px] text-base-secondary leading-[1.4] mb-2 sm:mb-3 line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em]">
            {product.description || "\u00A0"}
          </p>

          {/* Features/Talles - altura fija */}
          {/* Features/Talles - Una sola línea siempre (Máx 2 tags + badge) */}
          {/* Features/Talles - Dinámico con componente reutilizable para mejor performance y limpieza */}
          <div className="mb-2 sm:mb-[15px] min-h-5 sm:min-h-6 flex items-center">
            {sortedSizes && sortedSizes.length > 0 ? (
              <DynamicTags items={sortedSizes} />
            ) : (
              // Espaciador si no hay talles
              <div className="h-5 sm:h-6" />
            )}
          </div>

          {/* Spacer - empuja todo lo de abajo al fondo */}
          <div className="flex-1" />

          {/* Contenido inferior - siempre al fondo */}
          <div className="shrink-0 mt-auto">
            {/* Bottom: Precio y Botón */}
            <div className="flex justify-between items-center mb-3">
              {/* Precio */}
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

              {/* Botón agregar al carrito -> Ahora Navega a Detalles */}
              <Link
                href={`/productos/${product.id}`}
                aria-label="Ver opciones"
                className={`btn-cart ${product.stock === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Visualmente se ve igual pero funcionalmente lleva al detalle */}
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </div>

            {/* Meta: Rating y Stock */}
            <div className="flex justify-between items-center border-t border-theme pt-3">
              {/* Rating: 1 estrella + número */}
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

              {/* Stock */}
              {product.stock > 0 && product.stock <= 10 ? (
                <span className="text-[11px] font-semibold text-amber-500">
                  ¡Últimas {product.stock}!
                </span>
              ) : product.stock > 0 ? (
                <span className="text-[11px] font-semibold text-green-500">
                  En stock
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Botón favorito flotante */}
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
        {/* Imagen - más compacta */}
        <div className="relative w-28 sm:w-36 md:w-40 shrink-0 overflow-hidden">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
          >
            <div className="relative h-full min-h-28 sm:min-h-32">
              <Image
                src={
                  imageError || !mainImage
                    ? "https://placehold.co/400x400.png"
                    : mainImage
                }
                alt={`${product.name} - ${product.categories?.name || "Producto"}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
                priority={priority}
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                quality={80}
              />
            </div>
          </Link>

          {product.onSale && discountPercentage > 0 && (
            <div className="absolute top-1.5 left-1.5 badge-discount text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="surface text-base-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Contenido - layout mejorado */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
          {/* Header: Categoría + Rating */}
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

          {/* Título */}
          <Link href={`/productos/${product.id}`} className="mb-1.5">
            <h3 className="text-sm sm:text-base font-bold text-base-primary line-clamp-1 sm:line-clamp-2 hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Talles (si existen) */}
          {sortedSizes && sortedSizes.length > 0 && (
            <div className="mb-2 w-full max-w-[200px]">
              <DynamicTags
                items={sortedSizes}
                itemClassName="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded surface-secondary muted font-medium whitespace-nowrap shrink-0"
                badgeClassName="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded surface-secondary muted font-medium whitespace-nowrap shrink-0"
              />
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer: Precio + Stock + Acciones */}
          <div className="flex items-end justify-between gap-2">
            {/* Precio y Stock */}
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
              {/* Indicador de stock */}
              {product.stock > 0 && product.stock <= 10 ? (
                <span className="text-[9px] sm:text-[10px] font-semibold text-amber-500">
                  ¡Últimas {product.stock} unidades!
                </span>
              ) : product.stock > 0 ? (
                <span className="text-[9px] sm:text-[10px] font-medium text-green-600">
                  En stock
                </span>
              ) : null}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleToggleFavorite}
                aria-label={
                  isProductFavorite
                    ? `Quitar de favoritos`
                    : `Agregar a favoritos`
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
                  product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
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
});

ProductCard.displayName = "ProductCard";

export default ProductCard;

export { ProductCard };
