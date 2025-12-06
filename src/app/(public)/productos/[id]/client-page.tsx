"use client";

import { Button } from "@/components/ui/Button";
import {
  ProductCardSkeleton,
  ProductDetailSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { getColorHex } from "@/utils/colors";
import { formatPriceARS } from "@/utils/formatters";
import {
  ArrowLeft,
  CreditCard,
  Heart,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import useSWR from "swr";

// Dynamic imports para componentes no críticos
const ProductImageGallery = React.lazy(
  () => import("@/components/products/ProductImageGallery")
);
const ProductReviews = React.lazy(
  () => import("@/components/products/ProductReviews")
);
const RelatedProducts = React.lazy(
  () => import("@/components/products/RelatedProducts")
);

interface ProductDetailClientProps {
  productId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProduct?: any; // Using any to avoid complex type matching with serialized dates
}

// Loading components usando componentes reutilizables
const ImageGallerySkeleton = () => (
  <Skeleton className="w-full h-96" rounded="lg" />
);

const ReviewsSkeleton = () => (
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

const RelatedProductsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <ProductCardSkeleton key={`skeleton-related-${i}`} />
      ))}
    </div>
  </div>
);

export default function ProductDetailClient({
  productId,
  initialProduct,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();
  const { shipping } = useShippingSettings();

  // SWR para fetch del producto
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, isLoading, error } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
      fallbackData: initialProduct
        ? { success: true, data: initialProduct }
        : undefined,
    }
  );

  const product: Product | null = data?.success ? data.data : null;

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    // Validar talle solo si el producto tiene talles disponibles
    const availableSizes = Array.isArray(product.sizes) ? product.sizes : [];
    if (availableSizes.length > 0 && selectedSize === "") {
      show({
        type: "error",
        title: "Talle",
        message: "Por favor selecciona un talle",
      });
      return;
    }

    // Validar color si hay colores disponibles
    const availableColors =
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : [];

    if (availableColors.length > 0 && selectedColor === "") {
      show({
        type: "error",
        title: "Color",
        message: "Por favor selecciona un color",
      });
      return;
    }

    // Usar el color seleccionado o "Sin color" si no hay colores disponibles
    const colorToUse = availableColors.length > 0 ? selectedColor : "Sin color";
    // Usar el talle seleccionado o "Único" si no hay talles disponibles
    const sizeToUse = availableSizes.length > 0 ? selectedSize : "Único";

    addToCart(product, quantity, sizeToUse, colorToUse);
    show({
      type: "success",
      title: "Carrito",
      message: "Producto agregado al carrito",
    });
  };

  const handleToggleFavorite = () => {
    if (!product) {
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      show({
        type: "success",
        title: "Favoritos",
        message: "Eliminado de favoritos",
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "https://placehold.co/800x800.png",
      });
      show({
        type: "success",
        title: "Favoritos",
        message: "Agregado a favoritos",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Mira este producto: ${product?.name}`,
          url: window.location.href,
        });
      } catch (err) {
        logger.error("Error sharing:", { error: err });
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
      show({
        type: "success",
        title: "Compartir",
        message: "Enlace copiado al portapapeles",
      });
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              {error?.message || "Producto no encontrado"}
            </h1>
            <p className="muted mb-6">
              El producto que buscas no está disponible o ha sido eliminado.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Link href="/productos">
                <Button>Ver todos los productos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parsear imágenes
  const productImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
      ? JSON.parse(product.images)
      : [];

  // No mostrar selector de talles si el producto no tiene talles definidos
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  const isProductFavorite = isInWishlist(product.id);

  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb - responsive */}
        <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm muted">
            <li>
              <Link href="/" className="hover:text-primary truncate">
                Inicio
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/productos" className="hover:text-primary truncate">
                Productos
              </Link>
            </li>
            <li className="hidden sm:inline">/</li>
            <li className="text-primary font-medium truncate hidden sm:block">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Galería de imágenes - 7 columnas en desktop */}
          <div className="lg:col-span-7">
            <Suspense fallback={<ImageGallerySkeleton />}>
              <ProductImageGallery
                images={productImages}
                productName={product.name}
              />
            </Suspense>

          </div>

          {/* Información del producto - 5 columnas en desktop, sticky */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-4 space-y-5">
              {/* Header: Categoría y Favorito */}
              <div className="flex items-start justify-between gap-4">
                <Link 
                  href={`/productos?categoryId=${product.categoryId}`}
                  className="text-sm text-primary/70 hover:text-primary hover:underline"
                >
                  {product.categories?.name}
                </Link>
                <Button
                  onClick={handleToggleFavorite}
                  variant="ghost"
                  className="p-2 -mt-2 -mr-2"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isProductFavorite ? "fill-current text-error" : "text-primary/60"
                    }`}
                  />
                </Button>
              </div>

              {/* Título */}
              <h1 className="text-2xl lg:text-3xl font-bold text-primary leading-tight">
                {product.name}
              </h1>

              {/* Rating y Reviews */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-lg ${i < Math.floor(product.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-primary/70">
                  {product.rating?.toFixed(1)} ({product.reviewCount || 0} opiniones)
                </span>
              </div>

              {/* Precio */}
              <div className="bg-surface-secondary p-4 rounded-lg">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {product.onSale && product.salePrice ? (
                    <>
                      <span className="text-3xl lg:text-4xl font-bold text-primary">
                        {formatPriceARS(product.salePrice)}
                      </span>
                      <span className="text-lg text-primary/50 line-through">
                        {formatPriceARS(product.price)}
                      </span>
                      <span className="inline-block px-2.5 py-1 bg-error text-white text-sm font-semibold rounded">
                        {Math.round(
                          ((product.price - product.salePrice) / product.price) * 100
                        )}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      {formatPriceARS(product.price)}
                    </span>
                  )}
                </div>
                
                {/* Stock */}
                <div className="mt-3 pt-3 border-t border-muted/30">
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-2 text-success">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Disponible ({product.stock} unidades)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Sin stock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Colores */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Color: {selectedColor && <span className="font-normal text-primary/70">{selectedColor}</span>}
                  </label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {product.colors.map((color: string, idx: number) => {
                      const colorHex = getColorHex(color);
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={`color-${color}-${idx}`}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-offset-2 ring-offset-surface ring-primary/20 scale-110"
                              : "border-primary/20 hover:border-primary/40"
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={`Color ${color}`}
                          aria-label={`Color ${color}${isSelected ? " (seleccionado)" : ""}`}
                        >
                          {isSelected && (
                            <svg className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Talle */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Talle: {selectedSize && <span className="font-normal text-primary/70">{selectedSize}</span>}
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-4 py-2.5 border-2 rounded-lg font-medium transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-white scale-105"
                            : "border-primary/20 hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 border-2 border-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xl font-semibold"
                  >
                    −
                  </button>
                  <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-11 h-11 border-2 border-primary/20 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xl font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full h-12 text-base font-semibold"
                  rightIcon={<ShoppingCart className="w-5 h-5" />}
                >
                  {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  leftIcon={<Share2 className="w-5 h-5" />}
                >
                  Compartir producto
                </Button>
              </div>

              {/* Beneficios */}
              <div className="bg-surface-secondary p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-primary mb-3">Beneficios</h3>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">{shipping.estimatedDelivery || "Envío a todo el país"}</p>
                    <p className="text-primary/60 text-xs mt-0.5">Gratis en compras superiores a $20.000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Compra Protegida</p>
                    <p className="text-primary/60 text-xs mt-0.5">Garantía de 30 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Hasta 3 cuotas sin interés</p>
                    <p className="text-primary/60 text-xs mt-0.5">Con tarjetas seleccionadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción y Características - ahora abajo del grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-12 border-t border-muted">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Descripción</h2>
            <p className="text-primary/80 leading-relaxed">{product.description}</p>
          </div>
          
          {Array.isArray(product.features) && product.features.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Características</h2>
              <ul className="space-y-3">
                {product.features.map((f: string, idx: number) => (
                  <li key={`feature-${idx}`} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-primary/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Reseñas */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={productId} />
        </Suspense>

        {/* Productos relacionados */}
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts
            categoryId={product.categories?.id || product.categoryId}
            currentProductId={productId}
          />
        </Suspense>
      </div>
    </div>
  );
}
