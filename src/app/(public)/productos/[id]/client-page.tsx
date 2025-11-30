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
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm muted">
            <li>
              <Link href="/" className="hover:text-primary">
                Inicio
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/productos" className="hover:text-primary">
                Productos
              </Link>
            </li>
            <li>/</li>
            <li className="text-primary font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <div>
            <Suspense fallback={<ImageGallerySkeleton />}>
              <ProductImageGallery
                images={productImages}
                productName={product.name}
              />
            </Suspense>

            {/* Descripción y Características debajo de imágenes (estilo Mercado Libre) */}
            <div className="mt-8 space-y-6">
              {/* Descripción */}
              <div>
                <h2 className="text-xl font-semibold text-primary mb-3">
                  Descripción
                </h2>
                <p className="text-primary leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Características */}
              {Array.isArray(product.features) &&
                product.features.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-3">
                      Características
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {product.features.map((f: string, idx: number) => (
                        <li
                          key={`feature-${idx}-${f.slice(0, 10)}`}
                          className="text-primary/90"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <p className="text-sm muted uppercase tracking-wide">
              {product.category?.name}
            </p>

            {/* Nombre */}
            <h1 className="text-3xl font-bold text-primary">{product.name}</h1>

            {/* Precio */}
            <div className="flex items-center space-x-4">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-success">
                    {formatPriceARS(product.salePrice)}
                  </span>
                  <span className="text-lg muted line-through">
                    {formatPriceARS(product.price)}
                  </span>
                  <span className="text-sm bg-error text-white px-2 py-1 rounded">
                    -
                    {Math.round(
                      ((product.price - product.salePrice) / product.price) *
                        100
                    )}
                    %
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formatPriceARS(product.price)}
                </span>
              )}
            </div>

            {/* Colores */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mt-2 mb-2">
                  Colores{" "}
                  {selectedColor && (
                    <span className="text-sm font-normal muted">
                      - {selectedColor}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((color: string, idx: number) => {
                    const colorHex = getColorHex(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={`color-${color}-${idx}`}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-base-primary ring-2 ring-offset-2 ring-offset-surface ring-primary"
                            : "border-theme hover:border-primary"
                        }`}
                        style={{ backgroundColor: colorHex }}
                        title={`Seleccionar color ${color}`}
                        aria-label={`Color ${color}${isSelected ? " (seleccionado)" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Talle - Solo mostrar si hay talles definidos */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Talle
                </label>
                <div className="flex space-x-2 flex-wrap">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        selectedSize === size
                          ? "border-primary text-primary surface"
                          : "border-muted hover:border-primary"
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
              <label className="block text-sm font-medium text-primary mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-muted rounded flex items-center justify-center hover:surface-secondary"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-muted rounded flex items-center justify-center hover:surface-secondary"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className="text-success font-medium">
                  ✓ {product.stock} disponibles
                </span>
              ) : (
                <span className="text-error font-medium">✗ Agotado</span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                rightIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Agregar al carrito
              </Button>
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className="px-4"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isProductFavorite ? "fill-current text-primary" : ""
                  }`}
                />
              </Button>
              <Button onClick={handleShare} variant="outline" className="px-4">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-muted">
              {shipping.freeShipping && (
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm">{shipping.freeShippingLabel}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm">Garantía</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-sm">3 cuotas sin interés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={productId} />
        </Suspense>

        {/* Productos relacionados */}
        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProducts
            categoryId={product.category?.id}
            currentProductId={productId}
          />
        </Suspense>
      </div>
    </div>
  );
}
