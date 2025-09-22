"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SearchFilters {
  search?: string;
  categoryId?: string | null;
  sort?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  page?: number;
  limit?: number;
}

interface UseProductSearchResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  search: (query: string) => void;
  filterByCategory: (categoryId: string | null) => void;
  sortBy: (sort: string) => void;
  filterByPrice: (min: number | null, max: number | null) => void;
  loadMore: () => void;
  reset: () => void;
  filters: SearchFilters;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }
  return response.json();
};

export function useProductSearch(initialFilters: SearchFilters = {}): UseProductSearchResult {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 20,
    sort: 'newest',
    ...initialFilters,
  });

  const buildUrl = useCallback((searchFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (searchFilters.search?.trim()) {
      params.append('search', searchFilters.search.trim());
    }
    if (searchFilters.categoryId) {
      params.append('categoryId', searchFilters.categoryId);
    }
    if (searchFilters.sort) {
      params.append('sort', searchFilters.sort);
    }
    if (searchFilters.priceMin !== null && searchFilters.priceMin !== undefined) {
      params.append('priceMin', searchFilters.priceMin.toString());
    }
    if (searchFilters.priceMax !== null && searchFilters.priceMax !== undefined) {
      params.append('priceMax', searchFilters.priceMax.toString());
    }
    if (searchFilters.page) {
      params.append('page', searchFilters.page.toString());
    }
    if (searchFilters.limit) {
      params.append('limit', searchFilters.limit.toString());
    }

    return `/api/products?${params.toString()}`;
  }, []);

  const { data, error, mutate: _mutate, isLoading } = useSWR(
    buildUrl(filters),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const search = useCallback((query: string) => {
    setFilters(prev => ({
      ...prev,
      search: query,
      page: 1, // Reset to first page
    }));
  }, []);

  const filterByCategory = useCallback((categoryId: string | null) => {
    setFilters(prev => ({
      ...prev,
      categoryId,
      page: 1,
    }));
  }, []);

  const sortBy = useCallback((sort: string) => {
    setFilters(prev => ({
      ...prev,
      sort,
      page: 1,
    }));
  }, []);

  const filterByPrice = useCallback((min: number | null, max: number | null) => {
    setFilters(prev => ({
      ...prev,
      priceMin: min,
      priceMax: max,
      page: 1,
    }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      sort: 'newest',
    });
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    // Clear existing params
    params.delete('search');
    params.delete('categoryId');
    params.delete('sort');
    params.delete('priceMin');
    params.delete('priceMax');
    params.delete('page');
    
    // Add current filters
    if (filters.search?.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId);
    }
    if (filters.sort && filters.sort !== 'newest') {
      params.set('sort', filters.sort);
    }
    if (filters.priceMin !== null && filters.priceMin !== undefined) {
      params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== null && filters.priceMax !== undefined) {
      params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    }
    
    // Update URL without triggering navigation
    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  return {
    products: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    totalPages: data?.pagination?.totalPages || 0,
    currentPage: filters.page || 1,
    hasMore: (filters.page || 1) < (data?.pagination?.totalPages || 0),
    search,
    filterByCategory,
    sortBy,
    filterByPrice,
    loadMore,
    reset,
    filters,
  };
}
