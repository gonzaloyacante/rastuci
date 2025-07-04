"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Obtener la primera imagen del producto
  let productImages: string[] = [];
  try {
    productImages =
      typeof product.images === "string"
        ? JSON.parse(product.images)
        : product.images || [];
  } catch (error) {
    console.error("Error parsing product images:", error);
    productImages = [];
  }

  const mainImage =
    productImages.length > 0 ? productImages[0] : "/placeholder-product.jpg";

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-CO")}`;
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/productos/${product.id}`}>
          <Image
            src={imageError ? "/placeholder-product.jpg" : mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Botón de favorito */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
          <Heart
            className={`w-4 h-4 ${
              isLiked ? "fill-pink-500 text-pink-500" : "text-gray-600"
            }`}
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
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-medium text-gray-900 hover:text-pink-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Botón de agregar al carrito */}
          <button
            disabled={product.stock === 0}
            className="p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={
              product.stock === 0 ? "Producto agotado" : "Agregar al carrito"
            }>
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Stock disponible */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-gray-500 mt-2">
            {product.stock} disponibles
          </p>
        )}
      </div>
    </div>
  );
}
