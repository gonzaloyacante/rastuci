import { useState, useEffect, useCallback } from "react";

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

      // Datos de fallback para desarrollo
      setStats({
        totalProducts: 45,
        totalCategories: 8,
        totalOrders: 23,
        totalUsers: 15,
        pendingOrders: 5,
        totalRevenue: 2450000,
        lowStockProducts: 3,
      });

      // Órdenes recientes de fallback
      setRecentOrders([
        {
          id: "1",
          customerName: "María López",
          total: 78000,
          date: new Date().toISOString(),
          status: "PENDING",
          items: 2,
        },
        {
          id: "2",
          customerName: "Carlos Ruiz",
          total: 125000,
          date: new Date().toISOString(),
          status: "PENDING",
          items: 3,
        },
        {
          id: "3",
          customerName: "Ana Gómez",
          total: 45000,
          date: new Date().toISOString(),
          status: "PENDING",
          items: 1,
        },
      ]);

      // Productos con bajo stock de fallback
      setLowStockProducts([
        { id: "1", name: "Camiseta Estampada", stock: 5, price: 52000 },
        { id: "2", name: "Vestido Floral", stock: 3, price: 135000 },
        { id: "3", name: "Gorra Baseball", stock: 8, price: 35000 },
      ]);

      // Datos de categorías de fallback
      setCategoryData([
        { category: "Camisetas", count: 15 },
        { category: "Pantalones", count: 10 },
        { category: "Vestidos", count: 8 },
        { category: "Accesorios", count: 12 },
      ]);

      // Ventas mensuales de fallback
      setMonthlySales([
        { month: "01", revenue: 1500000 },
        { month: "02", revenue: 1800000 },
        { month: "03", revenue: 2200000 },
        { month: "04", revenue: 1900000 },
        { month: "05", revenue: 2100000 },
        { month: "06", revenue: 2450000 },
      ]);

      // En lugar de usar notificaciones, solo registrar el error
      console.error("Error al cargar datos del dashboard:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = async () => {
    await fetchDashboardData();
  };

  // Cargar datos del dashboard al montar el componente
  useEffect(() => {
    fetchDashboardData();
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
