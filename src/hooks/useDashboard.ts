import { useCallback, useEffect, useState } from "react";

import type { MetricsDashboard } from "@/lib/dashboard/types";
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

const formatChange = (changePercent: number): string => {
  const abs = Math.abs(changePercent).toFixed(1);
  return changePercent >= 0 ? `+${abs}%` : `-${abs}%`;
};

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

      const response = await fetch("/api/admin/dashboard?period=year", {
        signal,
      });

      if (!response.ok) {
        throw new Error("Error al cargar los datos del dashboard");
      }

      const json: { success: boolean; data: MetricsDashboard } =
        await response.json();

      if (!json.success || !json.data) {
        throw new Error("Error al procesar los datos del dashboard");
      }

      const data = json.data;

      setStats({
        totalProducts: Math.round(data.productMetrics.totalProducts.value),
        totalCategories: data.productMetrics.totalCategories,
        totalOrders: Math.round(data.overview.totalOrders.value),
        totalUsers: Math.round(data.overview.customerCount.value),
        totalRevenue: data.overview.totalSales.value,
        pendingOrders: 0,
        lowStockProducts: data.productMetrics.lowStockProducts,
        changes: {
          products: formatChange(
            data.productMetrics.totalProducts.changePercent
          ),
          orders: formatChange(data.overview.totalOrders.changePercent),
          revenue: formatChange(data.overview.totalSales.changePercent),
          categories: "+0%",
        },
      });
      setRecentOrders(
        data.recentActivity
          .filter((a) => a.type === "order")
          .map((a) => ({
            id: a.id,
            customerName: a.description,
            total: a.value ?? 0,
            date: a.timestamp,
            status: "PENDING",
            items: 0,
          }))
      );
      setLowStockProducts([]);
      setCategoryData(
        data.topCategories.map((c) => ({
          category: c.name,
          count: Math.round(c.sales),
        }))
      );
      setMonthlySales(
        data.salesChart.map((p) => ({
          month:
            p.label ??
            new Date(p.date).toLocaleDateString("es-AR", { month: "short" }),
          revenue: p.value,
        }))
      );
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      logger.error("Error al cargar datos del dashboard", {
        error: errorMessage,
      });
    } finally {
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
