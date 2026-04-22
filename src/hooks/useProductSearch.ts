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
}

interface CategoryOption {
  value: string;
  label: string;
}

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
  return `/api/products?${qs.toString()}`;
}

function buildPageUrl(filters: ProductFilters): string {
  const qs = new URLSearchParams();
  if (filters.search) qs.set("buscar", filters.search);
  if (filters.categoryId) qs.set("categoria", filters.categoryId);
  if (filters.sortBy !== "createdAt") qs.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== "desc") qs.set("sortOrder", filters.sortOrder);
  if (filters.page > 1) qs.set("pagina", filters.page.toString());
  return qs.toString() ? `/productos?${qs.toString()}` : "/productos";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProductSearch(initialParams: InitialSearchParams = {}) {
  const router = useRouter();
  const isPageNavigationRef = useRef(false);

  // State derived from URL search params
  const [filters, setFilters] = useState<ProductFilters>({
    search: initialParams.buscar || "",
    categoryId: initialParams.categoria || "",
    sortBy: initialParams.sortBy || "createdAt",
    sortOrder: initialParams.sortOrder || "desc",
    page: Number(initialParams.pagina) || 1,
  });

  // Debounced search: the filter uses the raw input for the input field,
  // but the API call uses the debounced value.
  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // When debounced search changes, update filters
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);

  // Compute the API URL from current filters
  const apiUrl = useMemo(() => buildApiUrl(filters), [filters]);

  // SWR data fetching
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

  // URL sync — update browser URL when filters change
  useEffect(() => {
    const newUrl = buildPageUrl(filters);
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Scroll to top after page navigation completes
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

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({
      search: "",
      categoryId: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  }, []);

  // Computed values
  const hasActiveFilters = Boolean(debouncedSearch || filters.categoryId);
  const sortValue = `${filters.sortBy}-${filters.sortOrder}`;

  // Filter chips (label only — the page maps onRemove per chip)
  const buildFilterChips = useCallback(
    (categories: CategoryOption[]): FilterChip[] => {
      const chips: FilterChip[] = [];
      if (debouncedSearch) {
        chips.push({
          id: "search",
          label: `Búsqueda: "${debouncedSearch}"`,
        });
      }
      if (filters.categoryId) {
        const categoryName =
          categories.find((c) => c.value === filters.categoryId)?.label || "";
        if (categoryName) {
          chips.push({ id: "category", label: categoryName });
        }
      }
      return chips;
    },
    [debouncedSearch, filters.categoryId]
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
    clearFilters,

    // Utilities
    buildFilterChips,
  };
}
