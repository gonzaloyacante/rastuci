"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";

import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { useVacationSettings } from "@/hooks/useVacationSettings";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { Product } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error loading product: HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Error from server payload");
  return json;
};

function parseProductImages(images: unknown): string[] {
  if (Array.isArray(images)) return images as string[];
  if (typeof images === "string") {
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  }
  return [];
}

function parseColorImages(colorImages: unknown): Record<string, string[]> {
  if (!colorImages) return {};
  if (typeof colorImages === "string") {
    try {
      return JSON.parse(colorImages);
    } catch (e) {
      logger.error("Error parsing colorImages", { error: e });
      return {};
    }
  }
  return colorImages as Record<string, string[]>;
}

export function useProductDetail(
  productId: string,
  initialProduct?: Record<string, unknown>
) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { show } = useToast();
  const { shipping } = useShippingSettings();
  const { isVacationMode } = useVacationSettings();

  const { data, isLoading, error } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      fallbackData: initialProduct
        ? { success: true, data: initialProduct }
        : undefined,
    }
  );

  const product: Product | null = data?.success ? data.data : null;

  const productImages = React.useMemo(
    () => parseProductImages(product?.images),
    [product]
  );

  const colorImagesMap = React.useMemo(
    () => parseColorImages(product?.colorImages),
    [product]
  );

  const hasVariants = !!(product?.variants && product.variants.length > 0);

  const availableColors = React.useMemo(() => {
    if (!product) return [];
    if (hasVariants) return Array.from(new Set(product.variants!.map((v) => v.color)));
    return Array.isArray(product.colors) ? product.colors : [];
  }, [product, hasVariants]);

  const allSizes = React.useMemo(() => {
    if (!product) return [];
    if (hasVariants) return Array.from(new Set(product.variants!.map((v) => v.size)));
    return Array.isArray(product.sizes) ? product.sizes : [];
  }, [product, hasVariants]);

  const currentVariant =
    hasVariants && selectedColor && selectedSize && product
      ? product.variants!.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        )
      : null;

  const currentStock = resolveCurrentStock(
    product,
    hasVariants,
    currentVariant,
    selectedColor,
    selectedSize
  );

  const isProductFavorite = product ? isInWishlist(product.id) : false;

  const displayedImages = React.useMemo(() => {
    if (selectedColor && colorImagesMap[selectedColor]?.length > 0) {
      return colorImagesMap[selectedColor];
    }
    return productImages;
  }, [selectedColor, colorImagesMap, productImages]);

  // Deselect size if variant is unavailable after color change
  React.useEffect(() => {
    if (hasVariants && selectedColor && selectedSize && product) {
      const variant = product.variants?.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (!variant || variant.stock <= 0) setSelectedSize("");
    }
  }, [selectedColor, hasVariants, selectedSize, product]);

  // Clamp quantity to available stock
  React.useEffect(() => {
    if (quantity > currentStock) setQuantity(Math.max(1, currentStock));
  }, [currentStock, quantity]);

  const handleAddToCart = () => {
    if (!product) return;
    if (allSizes.length > 0 && !selectedSize) {
      show({ type: "error", title: "Talle", message: "Por favor selecciona un talle" });
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      show({ type: "error", title: "Color", message: "Por favor selecciona un color" });
      return;
    }
    addToCart(
      product,
      quantity,
      allSizes.length > 0 ? selectedSize : "Único",
      availableColors.length > 0 ? selectedColor : "Sin color"
    );
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
        image: product.images[0] || PLACEHOLDER_IMAGE,
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
        logger.error("Error sharing:", { error: err });
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      show({ type: "success", title: "Compartir", message: "Enlace copiado al portapapeles" });
    }
  };

  return {
    product,
    isLoading,
    error,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    quantity,
    setQuantity,
    productImages,
    colorImagesMap,
    hasVariants,
    availableColors,
    allSizes,
    currentVariant,
    currentStock,
    isProductFavorite,
    displayedImages,
    shipping,
    isVacationMode,
    handleAddToCart,
    handleToggleFavorite,
    handleShare,
    goBack: () => router.back(),
  };
}

function resolveCurrentStock(
  product: Product | null,
  hasVariants: boolean,
  currentVariant: { stock: number } | null | undefined,
  selectedColor: string,
  selectedSize: string
): number {
  if (!product) return 0;
  if (!hasVariants) return product.stock;
  if (currentVariant) return currentVariant.stock;
  if (selectedColor && selectedSize) return 0; // Invalid combination
  return product.stock; // Show total when no selection yet
}
