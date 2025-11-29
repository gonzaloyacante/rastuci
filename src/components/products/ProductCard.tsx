"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFavorites } from "@/hooks/useFavorites";
import { Product } from "@/types";
import { formatCurrency, formatPriceARS } from "@/utils/formatters";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  Heart,
  ImageIcon,
  Package,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";

// ============================================================================
// Sub-componentes reutilizables
// ============================================================================

/** Placeholder para cuando no hay imagen */
export const ProductImagePlaceholder = ({
  className,
}: {
  className?: string;
}) => (
  <div
    className={`bg-linear-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center ${className || "w-full h-48"}`}
  >
    <div className="text-center opacity-60">
      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground font-medium">Sin imagen</p>
    </div>
  </div>
);

/** Badge de stock con estados visuales */
export const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return (
      <Badge variant="error" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Sin stock
      </Badge>
    );
  }
  if (stock <= 5) {
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Stock bajo ({stock})
      </Badge>
    );
  }
  if (stock <= 10) {
    return (
      <Badge variant="info" className="flex items-center gap-1">
        <Package className="h-3 w-3" />
        Stock medio ({stock})
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 border-success text-success"
    >
      <CheckCircle className="h-3 w-3" />
      Stock bueno ({stock})
    </Badge>
  );
};

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
    <div className="min-h-12 flex flex-col justify-center">
      {hasDiscount ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-success">
              {formatCurrency(salePrice!)}
            </span>
            {discountPercentage > 0 && (
              <Badge variant="error" className="text-xs">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(price)}
          </span>
        </div>
      ) : (
        <span className="text-lg font-bold">{formatCurrency(price)}</span>
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
  variant?: "public" | "grid" | "list"; // "grid" y "list" son alias para retrocompatibilidad
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

  // Determinar variante: "admin" es explícito, cualquier otro es "public"
  const isAdmin = props.variant === "admin";

  // Para variante pública, determinar el layout:
  // - Si se pasa layout explícito, usarlo
  // - Si variant es "grid" o "list", usarlo como layout (retrocompatibilidad)
  // - Por defecto: "grid"
  const layout: "grid" | "list" = !isAdmin
    ? (props as PublicProductCardProps).layout ||
      (props.variant === "list" ? "list" : "grid")
    : "grid";

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Solo para variante pública
  const { isFavorite, toggleFavorite } = useFavorites();

  // Memoizar el parsing de imágenes
  const productImages = useMemo(() => {
    try {
      return typeof product.images === "string"
        ? JSON.parse(product.images)
        : product.images || [];
    } catch {
      return [];
    }
  }, [product.images]);

  const mainImage = useMemo(
    () => (productImages.length > 0 ? productImages[0] : null),
    [productImages]
  );

  const formattedPrice = useMemo(
    () => formatPriceARS(product.price),
    [product.price]
  );

  const isProductFavorite = useMemo(
    () => (!isAdmin ? isFavorite(product.id) : false),
    [isFavorite, product.id, isAdmin]
  );

  const handleToggleFavorite = useCallback(() => {
    if (!isAdmin) {
      toggleFavorite(product.id);
    }
  }, [toggleFavorite, product.id, isAdmin]);

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
      <div className="group bg-surface border border-muted rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
        {/* Image Section */}
        <div className="relative">
          <div className="aspect-square bg-muted rounded-t-xl overflow-hidden">
            {imageError || !mainImage ? (
              <ProductImagePlaceholder className="w-full h-full" />
            ) : (
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
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
            {product.onSale && (
              <div className="bg-black/90 text-white px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-1 text-xs font-semibold">
                <TrendingUp className="h-3 w-3" />
                OFERTA
              </div>
            )}
            {productImages.length > 1 && (
              <Badge variant="info" className="shadow-lg">
                +{productImages.length - 1} fotos
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                className="bg-surface/90 backdrop-blur-sm border-muted shadow-lg"
                onClick={() => onView(product.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header with Rating */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              {product.rating &&
                product.reviewCount &&
                product.reviewCount > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm font-medium">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
            </div>

            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category.name}
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">
                  Talles:
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size, index) => (
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
                <span className="text-xs text-muted-foreground">Colores:</span>
                <div className="flex gap-1">
                  {product.colors.map((color, index) => (
                    <div
                      key={`color-${index}`}
                      className="w-4 h-4 rounded-full border border-muted"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <StockBadge stock={product.stock} />
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-muted">
            <PriceBadge
              price={product.price}
              salePrice={product.salePrice}
              onSale={product.onSale}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(product.id)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
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
      <article className="group relative surface rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-muted">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden surface">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
          >
            <Image
              src={
                imageError || !mainImage
                  ? "https://placehold.co/800x800.png"
                  : mainImage
              }
              alt={`${product.name} - ${product.category?.name || "Producto"} - ${formattedPrice}`}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
              onError={handleImageError}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              quality={80}
            />
          </Link>

          {/* Badge de oferta */}
          {product.onSale && (
            <div className="absolute top-2 left-2 bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              OFERTA
            </div>
          )}

          {/* Botón de favorito */}
          <button
            onClick={handleToggleFavorite}
            aria-label={
              isProductFavorite
                ? `Quitar ${product.name} de favoritos`
                : `Agregar ${product.name} a favoritos`
            }
            className={`absolute top-2 right-2 p-1.5 surface backdrop-blur-sm rounded-full hover:shadow transition-colors focus:outline-none ${
              isProductFavorite
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isProductFavorite ? "text-warning fill-current" : "muted"}`}
              aria-hidden="true"
            />
          </button>

          {/* Badge de stock bajo */}
          {product.stock <= 30 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 surface text-warning text-[10px] px-1.5 py-0.5 rounded-full">
              ¡Solo {product.stock}!
            </div>
          )}

          {/* Badge de sin stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="surface text-error border border-error px-2 py-0.5 rounded-full text-xs font-medium">
                Agotado
              </span>
            </div>
          )}

          {/* Indicador de múltiples imágenes */}
          {productImages.length > 1 && (
            <div className="absolute bottom-2 right-2 surface text-primary border border-primary text-[10px] px-1.5 py-0.5 rounded-full">
              +{productImages.length - 1}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-3">
          <p className="text-[10px] muted uppercase tracking-wide mb-1 line-clamp-1">
            {product.category?.name}
          </p>

          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
          >
            <h3 className="font-medium text-primary transition-colors line-clamp-2 mb-2 text-sm leading-tight">
              {product.name}
            </h3>
          </Link>

          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-warning text-warning" />
              <span className="text-xs muted">{product.rating}</span>
              {product.reviewCount && (
                <span className="text-xs muted">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Precio con oferta */}
          {product.onSale &&
          product.salePrice &&
          product.salePrice < product.price ? (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-success">
                {formatPriceARS(product.salePrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formattedPrice}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-primary">
              {formattedPrice}
            </span>
          )}
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANTE PÚBLICA - LIST
  // =========================================================================
  return (
    <article className="group relative surface rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-muted">
      <div className="flex">
        {/* Imagen */}
        <div className="relative w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 shrink-0 overflow-hidden">
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}
          >
            <Image
              src={
                imageError || !mainImage
                  ? "https://placehold.co/800x800.png"
                  : mainImage
              }
              alt={`${product.name} - ${product.category?.name || "Producto"} - ${formattedPrice}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onError={handleImageError}
              priority={priority}
              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
              quality={80}
            />
          </Link>

          {product.onSale && (
            <div className="absolute top-2 left-2 bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              OFERTA
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="surface text-error border border-error px-2 py-0.5 rounded-full text-[10px]">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide muted mb-1">
              {product.category?.name}
            </p>
            <Link
              href={`/productos/${product.id}`}
              aria-label={`Ver detalles de ${product.name}`}
            >
              <h3 className="text-sm sm:text-base font-semibold text-primary line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>

            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span className="text-xs muted">{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-xs muted">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-primary">
              {formattedPrice}
            </span>
            <button
              onClick={handleToggleFavorite}
              aria-label={
                isProductFavorite
                  ? `Quitar ${product.name} de favoritos`
                  : `Agregar ${product.name} a favoritos`
              }
              className="p-2 rounded-full hover:bg-pink-50 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isProductFavorite ? "text-warning fill-current" : "muted"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;

// Re-export para backwards compatibility
export { ProductCard };
