"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

import { Product } from "@/types";
import { fetcher } from "@/utils/fetcher";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductFilters {
  search: string;
  categoryId: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  minPrice: string;
  maxPrice: string;
  sizes: string[];
  colors: string[];
  minRating: number;
  page: number;
}

export interface FilterChip {
  id: string;
  label: string;
}

interface ProductsApiData {
  data?: Product[];
  total?: number;
  totalPages?: number;
}

interface ProductsApiResponse {
  success: boolean;
  data?: ProductsApiData;
}

interface InitialSearchParams {
  buscar?: string;
  categoria?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pagina?: string;
  minPrecio?: string;
  maxPrecio?: string;
  talles?: string | string[];
  colores?: string | string[];
  minRating?: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

const EMPTY_FILTERS: ProductFilters = {
  search: "",
  categoryId: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  minPrice: "",
  maxPrice: "",
  sizes: [],
  colors: [],
  minRating: 0,
  page: 1,
};

// ---------------------------------------------------------------------------
// URL Builders
// ---------------------------------------------------------------------------

function buildApiUrl(filters: ProductFilters): string {
  const qs = new URLSearchParams();
  qs.set("page", filters.page.toString());
  qs.set("limit", "12");
  qs.set("sortBy", filters.sortBy);
  qs.set("sortOrder", filters.sortOrder);
  if (filters.search) qs.set("search", filters.search);
  if (filters.categoryId) qs.set("categoryId", filters.categoryId);
  if (filters.minPrice) qs.set("minPrice", filters.minPrice);
  if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice);
  filters.sizes.forEach((s) => qs.append("sizes", s));
  filters.colors.forEach((c) => qs.append("colors", c));
  if (filters.minRating > 0) qs.set("minRating", filters.minRating.toString());
  return `/api/products?${qs.toString()}`;
}

function buildPageUrl(filters: ProductFilters): string {
  const qs = new URLSearchParams();
  if (filters.search) qs.set("buscar", filters.search);
  if (filters.categoryId) qs.set("categoria", filters.categoryId);
  if (filters.sortBy !== "createdAt") qs.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== "desc") qs.set("sortOrder", filters.sortOrder);
  if (filters.minPrice) qs.set("minPrecio", filters.minPrice);
  if (filters.maxPrice) qs.set("maxPrecio", filters.maxPrice);
  filters.sizes.forEach((s) => qs.append("talles", s));
  filters.colors.forEach((c) => qs.append("colores", c));
  if (filters.minRating > 0) qs.set("minRating", filters.minRating.toString());
  if (filters.page > 1) qs.set("pagina", filters.page.toString());
  return qs.toString() ? `/productos?${qs.toString()}` : "/productos";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProductSearch(initialParams: InitialSearchParams = {}) {
  const router = useRouter();
  const isPageNavigationRef = useRef(false);

  const normArray = (v?: string | string[]): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const [filters, setFilters] = useState<ProductFilters>({
    search: initialParams.buscar || "",
    categoryId: initialParams.categoria || "",
    sortBy: initialParams.sortBy || "createdAt",
    sortOrder: initialParams.sortOrder || "desc",
    minPrice: initialParams.minPrecio || "",
    maxPrice: initialParams.maxPrecio || "",
    sizes: normArray(initialParams.talles),
    colors: normArray(initialParams.colores),
    minRating: Number(initialParams.minRating) || 0,
    page: Number(initialParams.pagina) || 1,
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);

  const apiUrl = useMemo(() => buildApiUrl(filters), [filters]);

  const { data, isLoading, error } = useSWR<ProductsApiResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const products: Product[] = data?.data?.data || [];
  const totalProducts = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  useEffect(() => {
    const newUrl = buildPageUrl(filters);
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    if (!isPageNavigationRef.current) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    const forceTopTimer = setTimeout(() => {
      try {
        window.scrollTo(0, 0);
      } catch {
        // noop
      }
    }, 700);
    isPageNavigationRef.current = false;
    return () => clearTimeout(forceTopTimer);
  }, [filters.page]);

  // Handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 1 }));
  }, []);

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split("-");
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order as "asc" | "desc",
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    isPageNavigationRef.current = true;
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePriceChange = useCallback(
    (minPrice: string, maxPrice: string) => {
      setFilters((prev) => ({ ...prev, minPrice, maxPrice, page: 1 }));
    },
    []
  );

  const handleSizeToggle = useCallback((size: string) => {
    setFilters((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
        page: 1,
      };
    });
  }, []);

  const handleColorToggle = useCallback((color: string) => {
    setFilters((prev) => {
      const exists = prev.colors.includes(color);
      return {
        ...prev,
        colors: exists
          ? prev.colors.filter((c) => c !== color)
          : [...prev.colors, color],
        page: 1,
      };
    });
  }, []);

  const handleRatingChange = useCallback((minRating: number) => {
    setFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === minRating ? 0 : minRating,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({ ...EMPTY_FILTERS });
  }, []);

  const hasActiveFilters = Boolean(
    debouncedSearch ||
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sizes.length ||
    filters.colors.length ||
    filters.minRating > 0
  );

  const sortValue = `${filters.sortBy}-${filters.sortOrder}`;

  const buildFilterChips = useCallback(
    (categories: CategoryOption[]): FilterChip[] => {
      const chips: FilterChip[] = [];
      if (debouncedSearch) {
        chips.push({ id: "search", label: `Búsqueda: "${debouncedSearch}"` });
      }
      if (filters.categoryId) {
        const name =
          categories.find((c) => c.value === filters.categoryId)?.label || "";
        if (name) chips.push({ id: "category", label: name });
      }
      if (filters.minPrice && filters.maxPrice) {
        chips.push({
          id: "price",
          label: `$${filters.minPrice} – $${filters.maxPrice}`,
        });
      } else if (filters.minPrice) {
        chips.push({ id: "price", label: `Desde $${filters.minPrice}` });
      } else if (filters.maxPrice) {
        chips.push({ id: "price", label: `Hasta $${filters.maxPrice}` });
      }
      filters.sizes.forEach((s) =>
        chips.push({ id: `size-${s}`, label: `Talle ${s}` })
      );
      filters.colors.forEach((c) => chips.push({ id: `color-${c}`, label: c }));
      if (filters.minRating > 0) {
        chips.push({
          id: "rating",
          label: `${filters.minRating}★ o más`,
        });
      }
      return chips;
    },
    [
      debouncedSearch,
      filters.categoryId,
      filters.minPrice,
      filters.maxPrice,
      filters.sizes,
      filters.colors,
      filters.minRating,
    ]
  );

  return {
    // Data
    products,
    totalProducts,
    totalPages,
    isLoading,
    error,

    // Filter state
    filters,
    searchInput,
    sortValue,
    hasActiveFilters,

    // Handlers
    setSearchInput,
    handleSearchSubmit,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handlePriceChange,
    handleSizeToggle,
    handleColorToggle,
    handleRatingChange,
    clearFilters,

    // Utilities
    buildFilterChips,
  };
}
