"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

import {
  ColorSelectorSection,
  ImageGallerySkeleton,
  ProductBenefitsRow,
  ProductPriceDisplay,
  QuantityStepper,
  RelatedProductsSkeleton,
  ReviewsSkeleton,
  SizeSelectorSection,
  StockBadge,
} from "@/components/products/ProductDetailSections";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { useProductDetail } from "@/hooks/useProductDetail";
import type { ProductVariant } from "@/types";

const ProductReviews = React.lazy(
  () => import("@/components/products/ProductReviews")
);
const RelatedProducts = React.lazy(
  () => import("@/components/products/RelatedProducts")
);

interface ProductDetailClientProps {
  productId: string;
  initialProduct?: Record<string, unknown>;
}

interface ProductActionButtonsProps {
  currentStock: number;
  isProductFavorite: boolean;
  isVacationMode: boolean;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
}

function ProductActionButtons({
  currentStock,
  isProductFavorite,
  isVacationMode,
  onAddToCart,
  onToggleFavorite,
  onShare,
}: ProductActionButtonsProps) {
  return (
    <div className="flex space-x-4">
      <div className="flex-1 flex flex-col">
        <Button
          onClick={onAddToCart}
          disabled={currentStock === 0}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2 inline-block" />
          Agregar al carrito
        </Button>
        {isVacationMode && (
          <Alert variant="warning" className="mt-2 py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tienda en pausa:</strong> Podés armar tu carrito, pero no
              finalizar la compra por ahora.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Button
        onClick={onToggleFavorite}
        variant="outline"
        className="px-4"
        aria-label={
          isProductFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
        }
      >
        <Heart
          className={`w-4 h-4 ${isProductFavorite ? "fill-current text-primary" : ""}`}
        />
      </Button>
      <Button
        onClick={onShare}
        variant="outline"
        className="px-4"
        aria-label="Compartir este producto"
      >
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface ProductInfoPanelProps {
  product: {
    name: string;
    price: number;
    salePrice?: number | null;
    onSale?: boolean;
    categories?: { name?: string; id?: string } | null;
    variants?: ProductVariant[];
    sizeGuide?: unknown;
  };
  availableColors: string[];
  selectedColor: string;
  colorImagesMap: Record<string, string[]>;
  allSizes: string[];
  hasVariants: boolean;
  selectedSize: string;
  quantity: number;
  currentStock: number;
  isProductFavorite: boolean;
  isVacationMode: boolean;
  shipping: { freeShipping?: boolean; freeShippingLabel?: string };
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
  onSetQuantity: (qty: number) => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
}

function ProductInfoPanel({
  product,
  availableColors,
  selectedColor,
  colorImagesMap,
  allSizes,
  hasVariants,
  selectedSize,
  quantity,
  currentStock,
  isProductFavorite,
  isVacationMode,
  shipping,
  onSelectColor,
  onSelectSize,
  onSetQuantity,
  onAddToCart,
  onToggleFavorite,
  onShare,
}: ProductInfoPanelProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm muted uppercase tracking-wide">
        {product.categories?.name}
      </p>
      <h1 className="text-3xl font-bold text-primary">{product.name}</h1>
      <ProductPriceDisplay
        price={product.price}
        salePrice={product.salePrice}
        onSale={product.onSale}
      />
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
      <ColorSelectorSection
        availableColors={availableColors}
        selectedColor={selectedColor}
        colorImagesMap={colorImagesMap}
        onSelectColor={onSelectColor}
      />
      <SizeSelectorSection
        allSizes={allSizes}
        hasVariants={hasVariants}
        variants={product.variants}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        sizeGuide={
          product.sizeGuide as
            | { size: string; measurements: string; ageRange?: string }[]
            | null
        }
        onSelectSize={onSelectSize}
      />
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Cantidad
        </label>
        <QuantityStepper
          quantity={quantity}
          maxStock={currentStock}
          onChange={onSetQuantity}
        />
      </div>
      <div className="text-sm">
        <StockBadge stock={currentStock} />
      </div>
      <ProductActionButtons
        currentStock={currentStock}
        isProductFavorite={isProductFavorite}
        isVacationMode={isVacationMode}
        onAddToCart={onAddToCart}
        onToggleFavorite={onToggleFavorite}
        onShare={onShare}
      />
    </div>
  );
}

interface ProductGalleryPanelProps {
  product: {
    name: string;
    description?: string | null;
    features?: string[] | null;
  };
  selectedColor: string;
  displayedImages: string[];
  productImages: string[];
}

function ProductGalleryPanel({
  product,
  selectedColor,
  displayedImages,
  productImages,
}: ProductGalleryPanelProps) {
  return (
    <div>
      <Suspense fallback={<ImageGallerySkeleton />}>
        <ProductImageGallery
          key={`gallery-${selectedColor}-${displayedImages.length}`}
          images={displayedImages.length > 0 ? displayedImages : productImages}
          productName={product.name}
        />
      </Suspense>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-primary mb-3">
            Descripción
          </h2>
          <p className="text-primary leading-relaxed">{product.description}</p>
        </div>
        {Array.isArray(product.features) && product.features.length > 0 && (
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
  );
}

function ProductErrorState({
  error,
  goBack,
}: {
  error: Error | null;
  goBack: () => void;
}) {
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

export default function ProductDetailClient({
  productId,
  initialProduct,
}: ProductDetailClientProps) {
  const {
    product,
    isLoading,
    error,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    quantity,
    setQuantity,
    colorImagesMap,
    hasVariants,
    availableColors,
    allSizes,
    currentStock,
    isProductFavorite,
    displayedImages,
    productImages,
    shipping,
    isVacationMode,
    handleAddToCart,
    handleToggleFavorite,
    handleShare,
    goBack,
  } = useProductDetail(productId, initialProduct);

  // --- CONDITIONAL RETURNS ---
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return <ProductErrorState error={error} goBack={goBack} />;
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
          <ProductGalleryPanel
            product={product}
            selectedColor={selectedColor}
            displayedImages={displayedImages}
            productImages={productImages}
          />

          {/* Información del producto */}
          <ProductInfoPanel
            product={product}
            availableColors={availableColors}
            selectedColor={selectedColor}
            colorImagesMap={colorImagesMap}
            allSizes={allSizes}
            hasVariants={hasVariants}
            selectedSize={selectedSize}
            quantity={quantity}
            currentStock={currentStock}
            isProductFavorite={isProductFavorite}
            isVacationMode={isVacationMode}
            shipping={shipping}
            onSelectColor={setSelectedColor}
            onSelectSize={setSelectedSize}
            onSetQuantity={setQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
          />

          {/* Beneficios */}
          <ProductBenefitsRow shipping={shipping} />
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
