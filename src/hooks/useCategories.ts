import { useState, useEffect } from "react";
import { Category } from "@/types";
import useGlobalCache from "./useGlobalCache";

// Hook optimizado para categorías con cache global
export function useCategories() {
  const {
    data: categories,
    isLoading,
    error,
    mutate,
  } = useGlobalCache<Category[]>(
    "categories",
    async () => {
      const response = await fetch("/api/categories?includeProductCount=true");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data?.data || [];
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutos para categorías
      revalidateOnMount: false, // No revalidar en cada mount
      revalidateOnFocus: false, // No revalidar en focus para mejor UX
    }
  );

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    categories: categories || [],
    isLoading: !isMounted || isLoading,
    error: error?.message || null,
    mutate: () => mutate(), // Forzar refetch si es necesario
  };
}

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Primero intentar obtener de categorías cacheadas
  const { data: cachedCategories } = useGlobalCache<Category[]>(
    "categories",
    async () => [],
    { ttl: 10 * 60 * 1000 }
  );

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Primero buscar en cache de categorías
        if (cachedCategories) {
          const cachedCategory = cachedCategories.find((cat) => cat.id === id);
          if (cachedCategory) {
            setCategory(cachedCategory);
            setIsLoading(false);
            return;
          }
        }

        // Si no está en cache, hacer fetch individual
        const response = await fetch(`/api/categories/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setCategory(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar la categoría"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, cachedCategories]);

  return { category, isLoading, error };
}
