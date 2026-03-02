import { useCallback, useEffect, useState } from "react";

import { logger } from "@/lib/logger";

export interface StatsChanges {
  products: string;
  orders: string;
  revenue: string;
  categories: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  changes: StatsChanges;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  date: string;
  status: string;
  items: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
}

export interface ProductCategoryData {
  category: string;
  count: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  categoryData: ProductCategoryData[];
  monthlySales: MonthlySales[];
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [categoryData, setCategoryData] = useState<ProductCategoryData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard", { signal });

      if (!response.ok) {
        throw new Error("Error al cargar los datos del dashboard");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setStats({
        totalProducts: data.stats?.totalProducts || 0,
        totalCategories: data.stats?.totalCategories || 0,
        totalOrders: data.stats?.totalOrders || 0,
        totalUsers: data.stats?.totalUsers || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        pendingOrders: data.stats?.pendingOrders || 0,
        lowStockProducts: data.lowStockProducts?.length || 0,
        changes: data.stats?.changes || {
          products: "+0%",
          orders: "+0%",
          revenue: "+0%",
          categories: "+0%",
        },
      });
      setRecentOrders(data.recentOrders || []);
      setLowStockProducts(data.lowStockProducts || []);
      setCategoryData(data.productsByCategoryCount || []);
      setMonthlySales(data.monthlySales || []);
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      logger.error("Error al cargar datos del dashboard", {
        error: errorMessage,
      });
    } finally {
      // Usar callback de estado asegura que siempre leemos el `loading` correcto y real,
      // no la variable atrapada en un stale closure (M-32).
      setLoading(false);
    }
  }, []);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchDashboardData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDashboardData]);

  return {
    stats,
    recentOrders,
    lowStockProducts,
    categoryData,
    monthlySales,
    loading,
    error,
    refreshDashboard,
  };
};
