import { useMemo } from "react";

import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";

export const useFavorites = () => {
  const {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    isLoaded,
  } = useWishlist();

  // Derived state: list of favorite IDs for backward compatibility if needed
  const favorites = useMemo(
    () => wishlistItems.map((item) => item.id),
    [wishlistItems]
  );

  // Toggle favorito - Now requires the full product (or at least enough to create a WishlistItem)
  // We type it as Product to be safe, but internally we only need specific fields.
  const toggleFavorite = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      // Map Product to WishlistItem matching the context interface
      // Note: WishlistContext expects { id, name, price, image }
      // We need to resolve the image safely.
      // We expect images to be string[] according to Product type
      const image =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "";

      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: image,
      });
    }
  };

  return {
    favorites, // List of IDs
    wishlistItems, // List of full objects (new!)
    addToFavorites: (product: Product) => toggleFavorite(product), // Alias for backward compatibility but smarter
    removeFromFavorites: removeFromWishlist,
    toggleFavorite,
    isFavorite: isInWishlist,
    getFavoritesCount: getWishlistCount,
    clearFavorites: clearWishlist,
    isLoaded,
  };
};
