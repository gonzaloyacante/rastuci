"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";

interface ProductCardProps {
  product: Product;
  priority?: boolean; // Para marcar imágenes prioritarias (LCP)
  variant?: "grid" | "list"; // Diseño de tarjeta
}

const ProductCard = React.memo(
  ({ product, priority = false, variant = "grid" }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
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

    // Memoizar la imagen principal
    const mainImage = useMemo(
      () => (productImages.length > 0 ? productImages[0] : "https://placehold.co/800x800.png"),
      [productImages]
    );

    // Memoizar el precio formateado
    const formattedPrice = useMemo(
      () => formatPriceARS(product.price),
      [product.price]
    );

    // Memoizar el estado de favorito
    const isProductFavorite = useMemo(
      () => isFavorite(product.id),
      [isFavorite, product.id]
    );

    // Memoizar el handler de favorito
    const handleToggleFavorite = useCallback(() => {
      toggleFavorite(product.id);
    }, [toggleFavorite, product.id]);

    // Memoizar el handler de error de imagen
    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    // GRID VARIANT (default)
    if (variant === "grid") {
      return (
        <article className="group relative surface rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-muted">
          {/* Imagen del producto */}
          <div
            className="relative aspect-square overflow-hidden surface"
            style={{ position: "relative" }}
          >
            <Link
              href={`/productos/${product.id}`}
              aria-label={`Ver detalles de ${product.name}`}
            >
              <Image
                src={imageError ? "https://placehold.co/800x800.png" : mainImage}
                alt={`${product.name} - ${
                  product.category?.name || "Producto"
                } - ${formattedPrice}`}
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

            {/* Botón de favorito - Mobile optimized */}
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
                className={`w-3.5 h-3.5 ${
                  isProductFavorite ? "text-warning fill-current" : "muted"
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Badge de stock bajo - Mobile optimized */}
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

            {/* Indicador de múltiples imágenes - Mobile optimized */}
            {productImages.length > 1 && (
              <div className="absolute bottom-2 right-2 surface text-primary border border-primary text-[10px] px-1.5 py-0.5 rounded-full">
                +{productImages.length - 1}
              </div>
            )}
          </div>

          {/* Información del producto - Mobile optimized */}
          <div className="p-3">
            {/* Categoría */}
            <p className="text-[10px] muted uppercase tracking-wide mb-1 line-clamp-1">
              {product.category?.name}
            </p>

            {/* Nombre del producto */}
            <Link
              href={`/productos/${product.id}`}
              aria-label={`Ver detalles de ${product.name}`}
            >
              <h3 className="font-medium text-primary transition-colors line-clamp-2 mb-2 text-sm leading-tight">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span className="text-xs muted">{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-xs muted">({product.reviewCount})</span>
                )}
              </div>
            )}

            {/* Precio */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                {formattedPrice}
              </span>
            </div>
          </div>
        </article>
      );
    }

    // LIST VARIANT (horizontal)
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
                src={imageError ? "https://placehold.co/800x800.png" : mainImage}
                alt={`${product.name} - ${product.category?.name || "Producto"} - ${formattedPrice}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                onError={handleImageError}
                priority={priority}
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                quality={80}
              />
            </Link>

            {/* Badge de oferta */}
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
                    <span className="text-xs muted">
                      ({product.reviewCount})
                    </span>
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
                  className={`w-4 h-4 ${
                    isProductFavorite ? "text-warning fill-current" : "muted"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
