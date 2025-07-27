"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import { formatPriceARS } from "@/utils/formatters";

interface ProductCardProps {
  product: Product;
  priority?: boolean; // Para marcar imágenes prioritarias (LCP)
}

const ProductCard = React.memo(
  ({ product, priority = false }: ProductCardProps) => {
    const [imageError, setImageError] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();

    // Memoizar el parsing de imágenes
    const productImages = useMemo(() => {
      try {
        return typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images || [];
      } catch (error) {
        console.error("Error parsing product images:", error);
        return [];
      }
    }, [product.images]);

    // Memoizar la imagen principal
    const mainImage = useMemo(
      () =>
        productImages.length > 0
          ? productImages[0]
          : "/placeholder-product.jpg",
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

    return (
      <article className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Imagen del producto */}
        <div
          className="relative aspect-square overflow-hidden bg-gray-100"
          style={{ position: "relative" }}>
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}>
            <Image
              src={imageError ? "/placeholder-product.jpg" : mainImage}
              alt={`${product.name} - ${
                product.category?.name || "Producto"
              } - ${formattedPrice}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              quality={85}
            />
          </Link>

          {/* Botón de favorito */}
          <button
            onClick={handleToggleFavorite}
            aria-label={
              isProductFavorite
                ? `Quitar ${product.name} de favoritos`
                : `Agregar ${product.name} a favoritos`
            }
            className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              isProductFavorite
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}>
            <Heart
              className={`w-4 h-4 ${
                isProductFavorite
                  ? "fill-pink-500 text-pink-500"
                  : "text-gray-600"
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Badge de stock bajo */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              ¡Últimas {product.stock}!
            </div>
          )}

          {/* Badge de sin stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Agotado
              </span>
            </div>
          )}

          {/* Indicador de múltiples imágenes */}
          {productImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              +{productImages.length - 1} fotos
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          {/* Categoría */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category?.name}
          </p>

          {/* Nombre del producto */}
          <Link
            href={`/productos/${product.id}`}
            aria-label={`Ver detalles de ${product.name}`}>
            <h3 className="font-medium text-gray-900 hover:text-pink-600 transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Precio */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-pink-600">
              {formattedPrice}
            </span>
          </div>
        </div>
      </article>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
