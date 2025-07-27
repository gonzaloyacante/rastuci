import { useState, useEffect } from "react";
import { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setCategories(result.data?.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar categorías"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isMounted]);

  return {
    categories,
    isLoading: !isMounted || isLoading,
    error,
    mutate: () => {
      const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/categories");

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setCategories(result.data?.data || []);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error al cargar categorías"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    },
  };
}

export function useCategory(id: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      setIsLoading(true);
      setError(null);

      try {
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
  }, [id]);

  return { category, isLoading, error };
}
