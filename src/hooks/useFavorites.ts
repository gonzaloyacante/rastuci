import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";

const FAVORITES_STORAGE_KEY = "rastuci_favorites";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar favoritos desde localStorage al montar el componente
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        // Asegurar que sea un array
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        logger.error("Error loading favorites from localStorage", { error });
        setFavorites([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  // Agregar producto a favoritos
  const addToFavorites = (productId: string) => {
    if (!favorites.includes(productId)) {
      setFavorites((prev) => [...prev, productId]);
    }
  };

  // Remover producto de favoritos
  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  // Toggle favorito
  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(productId);
    }
  };

  // Verificar si un producto está en favoritos
  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  // Obtener cantidad de favoritos
  const getFavoritesCount = () => {
    return favorites.length;
  };

  // Limpiar todos los favoritos
  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    isLoaded,
  };
};
