import { logger } from "@/lib/logger";
import { useCallback, useEffect, useState } from "react";

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
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

  const fetchDashboardData = useCallback(async () => {
    // Prevenir múltiples llamadas simultáneas
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error("Error al cargar los datos del dashboard");
      }

      const data = await response.json();

      // El API devuelve directamente los datos sin success/data wrapper
      if (data.error) {
        throw new Error(data.error);
      }

      setStats({
        totalProducts: data.stats?.totalProducts || 0,
        totalCategories: data.stats?.totalCategories || 0,
        totalOrders: data.stats?.totalOrders || 0,
        totalUsers: 0, // Este campo no existe en el API
        totalRevenue: data.stats?.totalRevenue || 0,
        pendingOrders: data.stats?.pendingOrders || 0,
        lowStockProducts: data.lowStockProducts?.length || 0,
      });
      setRecentOrders(data.recentOrders || []);
      setLowStockProducts(data.lowStockProducts || []);
      setCategoryData(data.productsByCategoryCount || []);
      setMonthlySales(data.monthlySales || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);

      // En lugar de usar notificaciones, solo registrar el error
      logger.error("Error al cargar datos del dashboard", {
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  // Cargar datos del dashboard al montar el componente
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar, no cuando fetchDashboardData cambie

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
