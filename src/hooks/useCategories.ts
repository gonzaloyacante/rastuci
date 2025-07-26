import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/context/NotificationContext";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseCategoriesParams {
  includeProductCount?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  categoryProductCounts: Record<string, number>;
  totalPages: number;
  currentPage: number;
  fetchCategories: (params?: UseCategoriesParams) => Promise<void>;
  createCategory: (
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateCategory: (
    id: string,
    categoryData: Partial<Category>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategories = (
  initialParams?: UseCategoriesParams
): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryProductCounts, setCategoryProductCounts] = useState<
    Record<string, number>
  >({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  const [lastParams, setLastParams] = useState<UseCategoriesParams>(
    initialParams || {}
  );
  const { addNotification } = useNotifications();

  const fetchCategories = async (params?: UseCategoriesParams) => {
    try {
      setLoading(true);
      setError(null);
      const finalParams = { ...lastParams, ...params };
      setLastParams(finalParams);
      const urlParams = new URLSearchParams();
      if (finalParams.page)
        urlParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        urlParams.append("limit", finalParams.limit.toString());
      if (finalParams.includeProductCount)
        urlParams.append("includeProductCount", "true");
      if (finalParams.search) urlParams.append("search", finalParams.search);
      const response = await fetch(`/api/categories?${urlParams}`);
      if (!response.ok) {
        throw new Error("Error al cargar categorías");
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.data || []);
        setTotalPages(data.data.totalPages || 1);
        setCurrentPage(data.data.page || 1);
        if (data.data.categoryProductCounts) {
          setCategoryProductCounts(data.data.categoryProductCounts);
        } else {
          setCategoryProductCounts({});
        }
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      addNotification({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar categorías inicialmente
  useEffect(() => {
    fetchCategories(initialParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCategory = async (
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Error al crear categoría");
      }

      const data = await response.json();

      setCategories((prev) => [...prev, data.category]);
      addNotification({
        type: "success",
        message: "Categoría creada exitosamente",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear categoría";
      addNotification({
        type: "error",
        message: errorMessage,
      });
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    categoryData: Partial<Category>
  ) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar categoría");
      }

      const data = await response.json();

      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? data.category : cat))
      );

      addNotification({
        type: "success",
        message: "Categoría actualizada exitosamente",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar categoría";
      addNotification({
        type: "error",
        message: errorMessage,
      });
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar categoría");
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      addNotification({
        type: "success",
        message: "Categoría eliminada exitosamente",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar categoría";
      addNotification({
        type: "error",
        message: errorMessage,
      });
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    categoryProductCounts,
    totalPages,
    currentPage,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
