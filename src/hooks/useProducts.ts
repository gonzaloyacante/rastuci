import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { useCallback } from "react";
import useSWR, { SWRConfiguration } from "swr";

interface UseProductsOptions {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetcher genérico
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export function useProducts(
  options: UseProductsOptions = {},
  config?: SWRConfiguration
) {
  const {
    category,
    search,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Construir la URL de la API como key para SWR
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (category) {
      params.append("categoryId", category);
    }
    if (search) {
      params.append("search", search);
    }
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    return `/api/products?${params.toString()}`;
  }, [category, search, page, limit, sortBy, sortOrder]);

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    buildApiUrl(),
    fetcher,
    {
      keepPreviousData: true, // Mantiene datos viejos mientras carga nuevos (mejor UX)
      ...config,
    }
  );

  return {
    products: data?.data?.data || [],
    total: data?.data?.total || 0,
    page: data?.data?.page || 1,
    limit: data?.data?.limit || 12,
    totalPages: data?.data?.totalPages || 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Error") : null,
    mutate,
  };
}

export function useProduct(id: string, config?: SWRConfiguration) {
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    data: Product;
  }>(id ? `/api/products/${id}` : null, fetcher, config);

  return {
    product: data?.data || null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Error") : null,
  };
}

export function useRelatedProducts(
  productId: string,
  categoryId?: string,
  config?: SWRConfiguration
) {
  const key =
    productId && categoryId
      ? `/api/products?categoryId=${categoryId}&limit=4`
      : null;

  const { data, isLoading } = useSWR<ProductsResponse>(key, fetcher, config);

  // Filtrar el producto actual y limitar a 3
  const products =
    data?.data?.data?.filter((p) => p.id !== productId).slice(0, 3) || [];

  return { products, isLoading };
}
