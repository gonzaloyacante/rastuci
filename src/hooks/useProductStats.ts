import { ApiResponse } from "@/types";
import useSWR from "swr";

export interface ProductInventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface ProductStats {
  inventory: ProductInventoryStats;
  minPrice: number;
  maxPrice: number;
  availableSizes: string[];
  sizeCounts: Record<string, number>;
  availableColors: string[];
  colorCounts: Record<string, number>;
  hasRatings: boolean;
  ratingCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

const defaultInventory: ProductInventoryStats = {
  total: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
};

const defaultStats: ProductStats = {
  inventory: defaultInventory,
  minPrice: 0,
  maxPrice: 0,
  availableSizes: [],
  sizeCounts: {},
  availableColors: [],
  colorCounts: {},
  hasRatings: false,
  ratingCounts: {},
  categoryCounts: {},
};

// Fetcher interno
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

/**
 * Hook para obtener estadísticas de productos incluyendo inventario
 */
export function useProductStats() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ProductStats>>(
    "/api/products/stats",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
    }
  );

  return {
    stats: data?.data ?? defaultStats,
    inventory: data?.data?.inventory ?? defaultInventory,
    isLoading,
    error:
      error instanceof Error
        ? error.message
        : data?.error
          ? String(data.error)
          : undefined,
    mutate,
  };
}
