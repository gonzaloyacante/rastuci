"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  date: string;
  status: string;
  items: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface ProductCategoryData {
  category: string;
  count: number;
}

interface MonthlySales {
  month: string;
  revenue: number;
}

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [categoryData, setCategoryData] = useState<ProductCategoryData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar estadísticas reales desde la API
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Error al cargar datos del dashboard");
        }

        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
        setCategoryData(data.productsByCategoryCount || []);
        setMonthlySales(data.monthlySales || []);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);

        // Datos de fallback para desarrollo
        setStats({
          totalProducts: 45,
          totalCategories: 8,
          totalOrders: 23,
          pendingOrders: 5,
          totalRevenue: 2450000,
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
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Preparar datos para las gráficas
  const salesChartData = {
    labels: monthlySales.map((item) => monthNames[parseInt(item.month) - 1]),
    datasets: [
      {
        label: "Ventas Mensuales",
        data: monthlySales.map((item) => item.revenue),
        borderColor: "#E91E63",
        backgroundColor: "rgba(233, 30, 99, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: "Productos por Categoría",
        data: categoryData.map((item) => item.count),
        backgroundColor: [
          "rgba(233, 30, 99, 0.7)", // Rosa
          "rgba(156, 39, 176, 0.7)", // Púrpura
          "rgba(76, 175, 80, 0.7)", // Verde
          "rgba(255, 152, 0, 0.7)", // Naranja
          "rgba(33, 150, 243, 0.7)", // Azul
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opciones para las gráficas
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-CO")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <svg
              className="h-4 w-4 text-[#E91E63]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalProducts}
            </div>
            <p className="text-xs text-gray-500">
              Productos activos en catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <svg
              className="h-4 w-4 text-[#9C27B0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalCategories}
            </div>
            <p className="text-xs text-gray-500">Categorías de productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <svg
              className="h-4 w-4 text-[#FF9800]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalOrders}
            </div>
            <p className="text-xs text-gray-500">
              <span className="text-[#FF5722] font-medium">
                {stats.pendingOrders}
              </span>{" "}
              pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <svg
              className="h-4 w-4 text-[#4CAF50]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">Total en ventas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {!loading && (
                <Line data={salesChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {!loading && (
                <Doughnut data={categoryChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E91E63]"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{order.customerName}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <span className="text-[#E91E63] font-medium">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {order.items} {order.items === 1 ? "item" : "items"}
                      </span>
                      <Link href={`/admin/pedidos/${order.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Link href="/admin/pedidos?status=PENDING">
                    <Button variant="outline">
                      Ver todos los pedidos pendientes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hay pedidos pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas y Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/productos/nuevo">
              <Button className="w-full justify-start bg-[#E91E63] hover:bg-[#C2185B] text-white">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Agregar Producto
              </Button>
            </Link>

            <Link href="/admin/categorias/nueva">
              <Button className="w-full justify-start" variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear Categoría
              </Button>
            </Link>

            <Link href="/admin/pedidos?status=PENDING">
              <Button className="w-full justify-start" variant="outline">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Ver Pedidos Pendientes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos con Bajo Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]"></div>
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="divide-y">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="py-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock < 5
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {product.stock} en stock
                      </span>
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="ml-3">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No hay productos con bajo stock</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
