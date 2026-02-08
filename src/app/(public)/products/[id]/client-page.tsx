"use client";

import { Button } from "@/components/ui/Button";
import {
  ProductCardSkeleton,
  ProductDetailSkeleton,
  Skeleton,
} from "@/components/ui/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { getColorHex } from "@/utils/colors";
import { formatPriceARS } from "@/utils/formatters";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import {
  ArrowLeft,
  CreditCard,
  Heart,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useVacationSettings } from "@/hooks/useVacationSettings";

import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import useSWR from "swr";

// Dynamic imports para componentes no críticos
import ProductImageGallery from "@/components/products/ProductImageGallery";
const ProductReviews = React.lazy(
  () => import("@/components/products/ProductReviews")
);
const RelatedProducts = React.lazy(
  () => import("@/components/products/RelatedProducts")
);
import { SizeGuide } from "@/components/products/SizeGuide";
import { ColorSwatch } from "@/components/products/ProductHelpers";

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
  // displayedImages is now derived state

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();
  const { shipping } = useShippingSettings();
  const { isVacationMode } = useVacationSettings();

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

  // --- DERIVED STATE (SAFE) ---
  const productImages = React.useMemo(() => {
    if (!product) return [];
    return Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
        ? JSON.parse(product.images)
        : [];
  }, [product]);

  const colorImagesMap = React.useMemo(() => {
    if (!product?.colorImages) return {};
    if (typeof product.colorImages === "string") {
      try {
        return JSON.parse(product.colorImages);
      } catch (e) {
        logger.error("Error parsing colorImages", { error: e });
        return {};
      }
    }
    return product.colorImages;
  }, [product]);

  const hasVariants = !!(product?.variants && product.variants.length > 0);

  const availableColors = React.useMemo(() => {
    if (!product) return [];
    return hasVariants
      ? Array.from(new Set(product.variants!.map((v) => v.color)))
      : Array.isArray(product.colors)
        ? product.colors
        : [];
  }, [product, hasVariants]);

  const allSizes = React.useMemo(() => {
    if (!product) return [];
    return hasVariants
      ? Array.from(new Set(product.variants!.map((v) => v.size)))
      : Array.isArray(product.sizes)
        ? product.sizes
        : [];
  }, [product, hasVariants]);

  const currentVariant =
    hasVariants && selectedColor && selectedSize && product
      ? product.variants!.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        )
      : null;

  const currentStock = product
    ? hasVariants
      ? currentVariant
        ? currentVariant.stock
        : selectedColor && selectedSize
          ? 0 // Combinación inválida
          : product.stock // Mostrar total si no ha seleccionado completo
      : product.stock
    : 0;

  const isProductFavorite = product ? isInWishlist(product.id) : false;

  // --- EFFECTS ---

  // 1. Sync Images
  // 1. Sync Images
  // --- DERIVED STATE (SAFE) ---

  // 1. Sync Images - Derived State to prevent race conditions
  const displayedImages = React.useMemo(() => {
    if (selectedColor && colorImagesMap[selectedColor]?.length > 0) {
      return colorImagesMap[selectedColor];
    }
    return productImages;
  }, [selectedColor, colorImagesMap, productImages]);

  /* 
     Removed useEffect for image syncing to avoid race conditions. 
     Now displayedImages is calculated during render.
  */

  // 2. Validate Selection
  React.useEffect(() => {
    if (hasVariants && selectedColor && selectedSize && product) {
      const variant = product.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (!variant || variant.stock <= 0) {
        setSelectedSize(""); // Deseleccionar si no hay stock
      }
    }
  }, [selectedColor, hasVariants, selectedSize, product]);

  // 3. Clamp Quantity to Stock
  React.useEffect(() => {
    if (quantity > currentStock) {
      setQuantity(Math.max(1, currentStock));
    }
  }, [currentStock, quantity]);

  // --- HANDLERS ---
  const handleAddToCart = () => {
    if (!product) return;

    // Validar talle solo si el producto tiene talles disponibles
    const availableSizesList = Array.isArray(product.sizes)
      ? product.sizes
      : [];
    if (availableSizesList.length > 0 && selectedSize === "") {
      show({
        type: "error",
        title: "Talle",
        message: "Por favor selecciona un talle",
      });
      return;
    }

    // Validar color si hay colores disponibles
    const availableColorsList =
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : [];

    if (availableColorsList.length > 0 && selectedColor === "") {
      show({
        type: "error",
        title: "Color",
        message: "Por favor selecciona un color",
      });
      return;
    }

    // Usar el color seleccionado o "Sin color" si no hay colores disponibles
    const colorToUse =
      availableColorsList.length > 0 ? selectedColor : "Sin color";
    // Usar el talle seleccionado o "Único" si no hay talles disponibles
    const sizeToUse = availableSizesList.length > 0 ? selectedSize : "Único";

    addToCart(product, quantity, sizeToUse, colorToUse);
    show({
      type: "success",
      title: "Carrito",
      message: "Producto agregado al carrito",
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;

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
        image: product.images[0] || PLACEHOLDER_IMAGE,
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

  // --- CONDITIONAL RETURNS ---
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

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb ... (omitido, sin cambios) */}
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
          {/* Galería de imágenes (Dinámica) */}
          <div>
            <Suspense fallback={<ImageGallerySkeleton />}>
              <ProductImageGallery
                key={`gallery-${selectedColor}-${displayedImages.length}`}
                images={
                  displayedImages.length > 0 ? displayedImages : productImages
                }
                productName={product.name}
              />
            </Suspense>
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-3">
                  Descripción
                </h2>
                <p className="text-primary leading-relaxed">
                  {product.description}
                </p>
              </div>
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
            <p className="text-sm muted uppercase tracking-wide">
              {product.categories?.name}
            </p>
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

            {/* Free Shipping Badge Prominente */}
            {shipping.freeShipping && (
              <div className="mt-2 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                  <Truck className="w-4 h-4" />
                  <span>{shipping.freeShippingLabel || "Envío Gratis"}</span>
                  <span className="text-xs font-normal opacity-90">
                    a todo el país
                  </span>
                </div>
              </div>
            )}

            {/* Selector de Colores (Thumbnail Style) */}
            {availableColors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mt-2 mb-3">
                  Color:{" "}
                  <span className="font-normal text-base">
                    {selectedColor || "Elegí uno"}
                  </span>
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {availableColors.map((color: string, idx: number) => {
                    const isSelected = selectedColor === color;
                    // Obtenemos TODAS las imágenes para este color
                    const colorImages = colorImagesMap?.[color] || [];
                    const colorHex = getColorHex(color);

                    return (
                      <ColorSwatch
                        key={`color-${color}-${idx}`}
                        color={color}
                        images={colorImages}
                        isSelected={isSelected}
                        onClick={() => setSelectedColor(color)}
                        colorHex={colorHex}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de Talles (Smart Filtering) */}
            {allSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-primary">
                    Talle:{" "}
                    <span className="font-normal text-base">
                      {selectedSize || "Elegí uno"}
                    </span>
                  </h2>
                  <SizeGuide data={product.sizeGuide} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {allSizes.map((size) => {
                    let isDisabled = false;
                    let isOOS = false;

                    if (hasVariants) {
                      if (selectedColor) {
                        const v = product.variants?.find(
                          (v) => v.color === selectedColor && v.size === size
                        );
                        if (!v || v.stock <= 0) {
                          isDisabled = true;
                          isOOS = true;
                        }
                      } else {
                        const totalStockForSize =
                          product.variants
                            ?.filter((v) => v.size === size)
                            .reduce((acc, v) => acc + v.stock, 0) || 0;
                        if (totalStockForSize <= 0) isOOS = true;
                      }
                    }

                    return (
                      <Button
                        key={size}
                        onClick={() => !isDisabled && setSelectedSize(size)}
                        disabled={isDisabled}
                        variant="ghost"
                        className={`
                          min-w-[3rem] px-3 py-2 border rounded-lg text-sm font-medium transition-all h-auto
                          ${
                            selectedSize === size
                              ? "border-primary bg-primary text-white shadow-md hover:bg-primary hover:text-white"
                              : isDisabled
                                ? "border-muted bg-muted/10 text-muted-foreground cursor-not-allowed opacity-50 decoration-slice"
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
              </div>
            )}

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  variant="outline"
                  className={`w-8 h-8 p-0 border border-muted rounded flex items-center justify-center ${quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:surface-secondary"}`}
                >
                  -
                </Button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) {
                      setQuantity(1);
                    } else if (val > currentStock) {
                      setQuantity(currentStock);
                    } else if (val < 1) {
                      setQuantity(1);
                    } else {
                      setQuantity(val);
                    }
                  }}
                  className="w-16 h-8 text-center border border-muted rounded bg-surface text-primary"
                />
                <Button
                  onClick={() =>
                    setQuantity(Math.min(currentStock, quantity + 1))
                  }
                  disabled={quantity >= currentStock}
                  variant="outline"
                  className={`w-8 h-8 p-0 border border-muted rounded flex items-center justify-center ${
                    quantity >= currentStock
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:surface-secondary"
                  }`}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Stock */}
            <div className="text-sm">
              {currentStock > 0 ? (
                <span className="text-success font-medium">
                  ✓ {currentStock} disponibles
                </span>
              ) : (
                <span className="text-error font-medium">✗ Agotado</span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <div className="flex-1 flex flex-col">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="w-full"
                  // rightIcon={<ShoppingCart className="w-4 h-4" />}
                >
                  <ShoppingCart className="w-4 h-4 mr-2 inline-block" />
                  Agregar al carrito
                </Button>
                {isVacationMode && (
                  <Alert variant="warning" className="mt-2 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Tienda en pausa:</strong> Podés armar tu carrito,
                      pero no finalizar la compra por ahora.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className="px-4"
                aria-label={
                  isProductFavorite
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    isProductFavorite ? "fill-current text-primary" : ""
                  }`}
                />
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="px-4"
                aria-label="Compartir este producto"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Beneficios */}
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
          categoryId={product.categories?.id}
          currentProductId={productId}
        />
      </Suspense>
    </div>
  );
}
