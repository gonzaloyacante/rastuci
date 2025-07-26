"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share,
  Truck,
  Shield,
  RotateCcw,
  Loader,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/hooks/useFavorites";
import toast from "react-hot-toast";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import QuantityButton from "@/components/ui/QuantityButton";
import SelectionButton from "@/components/ui/SelectionButton";
import ProductCard from "@/components/ProductCard";
import Typography from "@/components/ui/Typography";
import { fetchRelatedProducts } from "@/utils/productRecommendations";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const params = useParams();
  const id = params.id as string;

  // Función para manejar el toggle de favoritos con notificación
  const handleToggleFavorite = () => {
    if (!product) return;

    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);

    if (!wasFavorite) {
      toast.success("Agregado a favoritos ❤️");
    } else {
      toast.success("Removido de favoritos 💔");
    }
  };

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/products/${id}`);
          const data = await response.json();

          if (data.success) {
            // Parsear las imágenes si es un string JSON
            if (typeof data.data.images === "string") {
              data.data.images = JSON.parse(data.data.images);
            }
            setProduct(data.data);
            // Cargar detalles de UI (tallas, colores, etc.) basados en el ID
            // setUiDetails(productUIDetails[id] || productUIDetails["1"]); // Removed as per edit hint
          } else {
            setError(data.error || "No se pudo cargar el producto.");
          }
        } catch (err) {
          setError("Ocurrió un error al conectar con el servidor.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  // Cargar productos relacionados cuando el producto principal esté listo
  useEffect(() => {
    if (product && product.id) {
      const loadRelatedProducts = async () => {
        try {
          setLoadingRelated(true);
          const related = await fetchRelatedProducts(product.id);
          setRelatedProducts(related);
        } catch (error) {
          console.error("Error loading related products:", error);
        } finally {
          setLoadingRelated(false);
        }
      };

      loadRelatedProducts();
    }
  }, [product]);

  // Cargar reseñas cuando el producto esté listo
  useEffect(() => {
    if (product && product.id) {
      const loadReviews = async () => {
        try {
          setLoadingReviews(true);
          const response = await fetch(`/api/products/${product.id}/reviews`);
          const data = await response.json();

          if (data.success) {
            setReviews(data.data);
          }
        } catch (error) {
          console.error("Error loading reviews:", error);
        } finally {
          setLoadingReviews(false);
        }
      };

      loadReviews();
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error("Por favor, selecciona una talla.");
      return;
    }
    if (!selectedColor) {
      toast.error("Por favor, selecciona un color.");
      return;
    }

    // Agregamos al carrito
    addToCart(product, quantity, selectedSize, selectedColor);

    // Mostramos confirmación
    toast.success(
      `${product.name} (Talla: ${selectedSize}, Color: ${selectedColor}) x${quantity} agregado al carrito!`,
      {
        duration: 3000,
        icon: "🛒",
        style: {
          borderRadius: "10px",
          background: "#F8F9FA",
          color: "#333",
          border: "1px solid #E91E63",
        },
      }
    );

    // Reseteamos los valores seleccionados para que el usuario pueda agregar otro producto fácilmente
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Skeleton */}
            <div>
              <div className="mb-4">
                <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div>
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              </div>

              {/* Rating Skeleton */}
              <div className="flex items-center mb-4 animate-pulse">
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-gray-200 rounded mr-1"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Price Skeleton */}
              <div className="mb-6">
                <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>

              {/* Size Selection Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Color Selection Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Quantity Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-12 animate-pulse"></div>
              </div>

              {/* Benefits Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#FAFAFA] rounded-xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 mt-16">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-2 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="bg-[#FAFAFA] border-0 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="text-center py-8">
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Skeleton */}
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link href="/productos">
          <Button>Volver a productos</Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Skeleton */}
            <div>
              <div className="mb-4">
                <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div>
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              </div>

              {/* Rating Skeleton */}
              <div className="flex items-center mb-4 animate-pulse">
                <div className="flex items-center mr-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-gray-200 rounded mr-1"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Price Skeleton */}
              <div className="mb-6">
                <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>

              {/* Size Selection Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Color Selection Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Quantity Skeleton */}
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="flex items-center gap-3">
                  <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-10 animate-pulse"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-12 animate-pulse"></div>
              </div>

              {/* Benefits Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#FAFAFA] rounded-xl">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 mt-16">
            <div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-2 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="bg-[#FAFAFA] border-0 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="text-center py-8">
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Skeleton */}
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div
      className="bg-white text-[#333333] min-h-screen"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="productos" />

      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/productos"
            className="inline-flex items-center text-[#666666] hover:text-[#E91E63] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Volver a productos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[#E91E63] ring-2 ring-[#E91E63] ring-opacity-50"
                      : "border-[#E0E0E0] hover:border-[#E91E63]"
                  }`}>
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-[#E91E63] font-semibold mb-2">
                {product.category?.name}
              </p>
              <h1
                className="text-3xl font-bold text-[#333333] mb-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#666666] ml-2">
                ({product.rating?.toFixed(1) || "0.0"}) •{" "}
                {product.reviewCount || 0} reseñas
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span
                className="text-4xl font-bold text-[#E91E63]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {formatPriceARS(product.price)}
              </span>
              <p className="text-[#4CAF50] font-semibold mt-1">
                o 3 cuotas sin interés de{" "}
                {formatPriceARS(Math.round(product.price / 3))}
              </p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <Typography
                variant="h3"
                className="text-xl font-bold text-[#333333] mb-3">
                Tallas Disponibles
              </Typography>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <SelectionButton
                    key={size}
                    value={size}
                    label={size}
                    isSelected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    variant="square"
                  />
                )) || (
                  <p className="text-[#666666]">No hay tallas disponibles</p>
                )}
              </div>

              <Typography
                variant="h3"
                className="text-xl font-bold text-[#333333] mb-3 mt-6">
                Colores Disponibles
              </Typography>
              <div className="flex flex-wrap gap-3">
                {product.colors?.map((color) => (
                  <SelectionButton
                    key={color}
                    value={color}
                    label={color}
                    isSelected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                    variant="rounded"
                  />
                )) || (
                  <p className="text-[#666666]">No hay colores disponibles</p>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <Typography variant="h3" className="mb-3">
                Cantidad
              </Typography>
              <div className="flex items-center space-x-3">
                <QuantityButton
                  quantity={quantity}
                  onIncrement={() =>
                    quantity < product.stock && setQuantity(quantity + 1)
                  }
                  onDecrement={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={product.stock === 0}
                />
                <span className="text-[#666666] ml-4">
                  Stock disponible: {product.stock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-[#E91E63] text-white hover:bg-[#C2185B] h-14 text-lg font-semibold">
                <ShoppingCart size={20} className="mr-2" />
                Agregar al Carrito
              </Button>
              <button
                onClick={handleToggleFavorite}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  isFavorite(product.id)
                    ? "border-[#E91E63] bg-[#E91E63] text-white"
                    : "border-[#E0E0E0] hover:border-[#E91E63] text-[#333333]"
                }`}>
                <Heart
                  size={20}
                  className={isFavorite(product.id) ? "fill-current" : ""}
                />
              </button>
              <button className="px-6 py-3 rounded-lg border-2 border-[#E0E0E0] hover:border-[#E91E63] text-[#333333] transition-all">
                <Share size={20} />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#FAFAFA] rounded-xl">
              <div className="flex items-center space-x-3">
                <Truck className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Envío gratis</p>
                  <p className="text-xs text-[#666666]">A todo el país</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Cambios gratis</p>
                  <p className="text-xs text-[#666666]">30 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="text-[#E91E63]" size={24} />
                <div>
                  <p className="font-semibold text-sm">Compra segura</p>
                  <p className="text-xs text-[#666666]">100% protegida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Descripción
            </h2>
            <p className="text-[#666666] leading-relaxed mb-6">
              {product.description}
            </p>

            <h3
              className="text-xl font-bold text-[#333333] mb-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Características
            </h3>
            <ul className="space-y-2">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-[#666666]">
                  <div className="w-2 h-2 bg-[#E91E63] rounded-full mr-3"></div>
                  {feature}
                </li>
              )) || (
                <li className="text-[#666666]">
                  No hay características disponibles
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2
              className="text-2xl font-bold text-[#333333] mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Reseñas de Clientes
            </h2>
            <Card className="bg-[#FAFAFA] border-0">
              <CardContent className="p-6">
                {loadingReviews ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse"></div>
                          ))}
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>

                    {/* Skeleton de reseñas */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border-b border-[#F0F0F0] pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, j) => (
                                <div
                                  key={j}
                                  className="w-3 h-3 bg-gray-200 rounded mr-1 animate-pulse"></div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-20 mt-2 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(product.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-[#666666]">
                          {product.rating?.toFixed(1)} de 5 estrellas
                        </span>
                      </div>
                      <span className="text-sm text-[#666666]">
                        {reviews.length} reseñas
                      </span>
                    </div>

                    {/* Lista de reseñas */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-[#F0F0F0] pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-[#333333]">
                              {review.customerName}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={`${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-[#666666]">
                              {review.comment}
                            </p>
                          )}
                          <span className="text-xs text-[#999999]">
                            {new Date(review.createdAt).toLocaleDateString(
                              "es-AR"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#666666]">No hay reseñas aún</p>
                    <p className="text-sm text-[#999999] mt-2">
                      ¡Sé el primero en dejar una reseña!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2
            className="text-3xl font-bold text-[#333333] text-center mb-8"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Productos Relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {loadingRelated ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-lg animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : relatedProducts.length === 0 ? (
              <p className="text-center text-[#666666]">
                No se encontraron productos relacionados.
              </p>
            ) : (
              relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
