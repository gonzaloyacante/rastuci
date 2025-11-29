"use client";

import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteProductsOptions {
  category?: string;
  search?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  stockFilter?: "all" | "inStock" | "lowStock" | "outOfStock";
}

interface ProductsPageData {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook para cargar productos con scroll infinito
 */
export function useInfiniteProducts(options: UseInfiniteProductsOptions = {}) {
  const {
    category,
    search,
    limit = 24,
    sortBy = "createdAt",
    sortOrder = "desc",
    stockFilter = "all",
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref para evitar fetches duplicados
  const isFetching = useRef(false);
  const lastOptionsRef = useRef<string>("");

  // Construir URL de la API
  const buildApiUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();

      if (category && category !== "all") {
        params.append("categoryId", category);
      }
      if (search) {
        params.append("search", search);
      }
      if (stockFilter && stockFilter !== "all") {
        // Mapear filtros de stock a parámetros de API
        if (stockFilter === "inStock") {
          params.append("minStock", "1");
        } else if (stockFilter === "lowStock") {
          params.append("minStock", "1");
          params.append("maxStock", "5");
        } else if (stockFilter === "outOfStock") {
          params.append("maxStock", "0");
        }
      }
      params.append("page", pageNum.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      return `/api/products?${params.toString()}`;
    },
    [category, search, limit, sortBy, sortOrder, stockFilter]
  );

  // Serializar opciones para detectar cambios
  const optionsKey = JSON.stringify({
    category,
    search,
    sortBy,
    sortOrder,
    stockFilter,
  });

  // Fetch inicial o cuando cambian filtros
  const fetchProducts = useCallback(
    async (resetPage = false) => {
      if (isFetching.current) return;
      isFetching.current = true;

      const targetPage = resetPage ? 1 : page;

      if (resetPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const url = buildApiUrl(targetPage);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const pageData: ProductsPageData = result.data;

        if (resetPage) {
          setProducts(pageData.data);
          setPage(1);
        } else {
          setProducts((prev) => [...prev, ...pageData.data]);
        }

        setTotal(pageData.total);
        setTotalPages(pageData.totalPages);
        setHasMore(targetPage < pageData.totalPages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar productos"
        );
        logger.error("Error fetching products", { error: err });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        isFetching.current = false;
      }
    },
    [buildApiUrl, page]
  );

  // Cargar más productos
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isFetching.current) return;

    const nextPage = page + 1;
    setPage(nextPage);

    isFetching.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const url = buildApiUrl(nextPage);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const pageData: ProductsPageData = result.data;

      setProducts((prev) => [...prev, ...pageData.data]);
      setTotal(pageData.total);
      setTotalPages(pageData.totalPages);
      setHasMore(nextPage < pageData.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar más productos"
      );
      logger.error("Error loading more products", { error: err });
    } finally {
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [buildApiUrl, page, isLoadingMore, hasMore]);

  // Refrescar datos
  const mutate = useCallback(() => {
    setPage(1);
    fetchProducts(true);
  }, [fetchProducts]);

  // Effect para carga inicial y cambios de filtros
  useEffect(() => {
    if (lastOptionsRef.current !== optionsKey) {
      lastOptionsRef.current = optionsKey;
      setPage(1);
      setProducts([]);
      setHasMore(true);
      fetchProducts(true);
    }
  }, [optionsKey, fetchProducts]);

  return {
    products,
    total,
    page,
    totalPages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    mutate,
  };
}
