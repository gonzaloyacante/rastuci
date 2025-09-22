"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ColorChip } from "@/components/ui/ColorChip";
import { Product } from "@/types";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  CreditCard,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { formatPriceARS } from "@/utils/formatters";
import Link from "next/link";
import React from "react";

// Dynamic imports para componentes no críticos
const ProductImageGallery = React.lazy(
  () => import("@/components/ProductImageGallery")
);
const ProductReviews = React.lazy(() => import("@/components/ProductReviews"));
const RelatedProducts = React.lazy(
  () => import("@/components/RelatedProducts")
);

// Loading components
const ProductDetailSkeleton = () => (
  <div className="min-h-screen surface">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb - No skeleton para texto fijo */}
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
          <li className="text-primary font-medium">Cargando...</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square surface rounded-lg animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square surface rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="h-8 surface rounded animate-pulse w-3/4" />
          <div className="h-6 surface rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            <div className="h-4 surface rounded animate-pulse w-full" />
            <div className="h-4 surface rounded animate-pulse w-5/6" />
            <div className="h-4 surface rounded animate-pulse w-4/6" />
          </div>
          <div className="space-y-4">
            <div className="h-12 surface rounded animate-pulse" />
            <div className="h-12 surface rounded animate-pulse" />
            <div className="h-12 surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ImageGallerySkeleton = () => (
  <div className="w-full h-96 surface rounded-lg animate-pulse" />
);

const ReviewsSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 surface rounded animate-pulse w-1/3" />
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 surface rounded-lg">
          <div className="h-4 surface rounded animate-pulse w-1/4 mb-2" />
          <div className="h-3 surface rounded animate-pulse w-full mb-1" />
          <div className="h-3 surface rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

const RelatedProductsSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 surface rounded animate-pulse w-1/3" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-48 surface border border-muted rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          setError("Producto no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el producto");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (selectedSize === "") {
      show({ type: "error", title: "Talle", message: "Por favor selecciona un talle" });
      return;
    }

    addToCart(product, quantity, selectedSize, "Sin color");
    show({ type: "success", title: "Carrito", message: "Producto agregado al carrito" });
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      show({ type: "success", title: "Favoritos", message: "Eliminado de favoritos" });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
      });
      show({ type: "success", title: "Favoritos", message: "Agregado a favoritos" });
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
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
      show({ type: "success", title: "Compartir", message: "Enlace copiado al portapapeles" });
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              {error || "Producto no encontrado"}
            </h1>
            <Link href="/productos">
              <Button className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a productos
              </Button>
            </Link>
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

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ["XS", "S", "M", "L", "XL"];
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
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <p className="text-sm muted uppercase tracking-wide">
              {product.category?.name}
            </p>

            {/* Nombre */}
            <h1 className="text-3xl font-bold text-primary">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="text-primary fill-current"
                  />
                ))}
              </div>
              <span className="muted">(4.8) • 127 reseñas</span>
            </div>

            {/* Precio */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                {formatPriceARS(product.price)}
              </span>
              {product.onSale && (
                <span className="text-lg muted line-through">
                  {formatPriceARS(product.price * 1.2)}
                </span>
              )}
            </div>

            {/* Descripción */}
            <p className="text-primary leading-relaxed">
              {product.description}
            </p>

            {/* Características */}
            {Array.isArray(product.features) && product.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mt-2 mb-2">Características</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((f: string, idx: number) => (
                    <li key={idx} className="text-primary/90">{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Colores */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-primary mt-2 mb-2">Colores</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((c: string, idx: number) => (
                    <ColorChip key={idx} color={c} size="md" />
                  ))}
                </div>
              </div>
            )}

            {/* Talle */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Talle
              </label>
              <div className="flex space-x-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedSize === size
                        ? "border-primary text-primary surface"
                        : "border-muted hover:border-primary"
                    }`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-muted rounded flex items-center justify-center">
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-muted rounded flex items-center justify-center">
                  +
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="text-sm muted">
              {product.stock > 0 ? (
                <span className="text-success">
                  ✓ {product.stock} disponibles
                </span>
              ) : (
                <span className="text-error">✗ Agotado</span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar al carrito
              </Button>
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className="px-4">
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
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm">Envío gratis</span>
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
            categoryId={product.category?.id}
            currentProductId={productId}
          />
        </Suspense>
      </div>
    </div>
  );
}
