import { useEffect, useState } from "react";
import useSWR from "swr";

import { Category } from "@/types";

const CATEGORIES_URL = "/api/categories?includeProductCount=true";
const SWR_OPTIONS = {
  dedupingInterval: 10 * 60 * 1000,
  revalidateOnMount: false,
  revalidateOnFocus: false,
} as const;

async function fetchCategories(url: string): Promise<Category[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json();
  return result.data?.data || [];
}

export function useCategories() {
  const {
    data: categories,
    isLoading,
    error,
    mutate,
  } = useSWR<Category[]>(CATEGORIES_URL, fetchCategories, SWR_OPTIONS);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    categories: categories || [],
    isLoading: !isMounted || isLoading,
    error: error?.message || null,
    mutate: () => mutate(),
  };
}

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access the shared SWR cache for categories list
  const { data: cachedCategories } = useSWR<Category[]>(
    CATEGORIES_URL,
    fetchCategories,
    { ...SWR_OPTIONS, revalidateOnMount: false }
  );

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (cachedCategories) {
          const found = cachedCategories.find((cat) => cat.id === id);
          if (found) {
            setCategory(found);
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch(`/api/categories/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

    if (id) void fetchCategory();
  }, [id, cachedCategories]);

  return { category, isLoading, error };
}
