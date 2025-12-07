"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import { BarChart3, Calendar, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { Bar, Line, Radar, PolarArea } from "react-chartjs-2";

// Registrar componentes
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdvancedChartsProps {
  ordersPerDay?: { day: string; orders: number }[];
  topCustomers?: { name: string; totalSpent: number }[];
  orderStatus?: { status: string; count: number }[];
  hourlyOrders?: { hour: string; orders: number }[];
  productPerformance?: { product: string; sales: number; revenue: number; rating: number }[];
  loading?: boolean;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "rgb(107, 114, 128)",
        font: { size: 12, weight: 500 },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "rgb(17, 24, 39)",
      bodyColor: "rgb(75, 85, 99)",
      borderColor: "rgb(209, 213, 219)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(209, 213, 219, 0.3)" },
      ticks: { color: "rgb(107, 114, 128)", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(209, 213, 219, 0.3)" },
      ticks: { color: "rgb(107, 114, 128)", font: { size: 11 } },
    },
  },
};

export default function AdvancedCharts({
  ordersPerDay = [],
  topCustomers = [],
  orderStatus = [],
  hourlyOrders = [],
  productPerformance = [],
  loading = false,
}: AdvancedChartsProps) {
  // Gráfica de pedidos por día (últimos 7 días)
  const ordersPerDayData = {
    labels: ordersPerDay.map((item) => item.day),
    datasets: [
      {
        label: "Pedidos",
        data: ordersPerDay.map((item) => item.orders),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Gráfica de mejores clientes
  const topCustomersData = {
    labels: topCustomers.map((c) => c.name),
    datasets: [
      {
        label: "Gasto Total ($)",
        data: topCustomers.map((c) => c.totalSpent),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(6, 182, 212, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(139, 92, 246)",
          "rgb(6, 182, 212)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  // Gráfica de estado de pedidos
  const orderStatusData = {
    labels: orderStatus.map((s) => s.status),
    datasets: [
      {
        label: "Cantidad",
        data: orderStatus.map((s) => s.count),
        backgroundColor: [
          "rgba(245, 158, 11, 0.7)", // Pendiente
          "rgba(59, 130, 246, 0.7)", // Procesando
          "rgba(16, 185, 129, 0.7)", // Completado
          "rgba(239, 68, 68, 0.7)",  // Cancelado
        ],
        borderWidth: 0,
      },
    ],
  };

  // Gráfica de pedidos por hora
  const hourlyOrdersData = {
    labels: hourlyOrders.map((h) => h.hour),
    datasets: [
      {
        label: "Pedidos",
        data: hourlyOrders.map((h) => h.orders),
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(139, 92, 246)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Gráfica de rendimiento de productos (radar)
  const productPerformanceData = {
    labels: productPerformance.map((p) => p.product.substring(0, 15)),
    datasets: [
      {
        label: "Ventas",
        data: productPerformance.map((p) => p.sales),
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
      },
      {
        label: "Ingresos ($)",
        data: productPerformance.map((p) => p.revenue / 100), // Normalizado
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface rounded-lg shadow-sm border muted p-4 lg:p-6">
            <div className="animate-pulse">
              <div className="h-4 surface-secondary rounded w-1/3 mb-4"></div>
              <div className="h-48 lg:h-64 surface-secondary rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pedidos por Día */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface rounded-lg shadow-sm border muted p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base lg:text-lg font-bold text-primary">
                Pedidos por Día
              </h3>
              <p className="text-xs lg:text-sm muted mt-1">Últimos 7 días</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="h-48 lg:h-64">
            {ordersPerDay.length > 0 ? (
              <Bar data={ordersPerDayData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm muted">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="surface rounded-lg shadow-sm border muted p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base lg:text-lg font-bold text-primary">
                Mejores Clientes
              </h3>
              <p className="text-xs lg:text-sm muted mt-1">Top 5 por gasto total</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="h-48 lg:h-64">
            {topCustomers.length > 0 ? (
              <Bar 
                data={topCustomersData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y' as const,
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm muted">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Estado de Pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="surface rounded-lg shadow-sm border muted p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base lg:text-lg font-bold text-primary">
                Estado de Pedidos
              </h3>
              <p className="text-xs lg:text-sm muted mt-1">Distribución actual</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="h-48 lg:h-64">
            {orderStatus.length > 0 ? (
              <PolarArea 
                data={orderStatusData} 
                options={{
                  ...chartOptions,
                  scales: undefined,
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm muted">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pedidos por Hora */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="surface rounded-lg shadow-sm border muted p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base lg:text-lg font-bold text-primary">
                Pedidos por Hora
              </h3>
              <p className="text-xs lg:text-sm muted mt-1">Patrón de actividad del día</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="h-48 lg:h-64">
            {hourlyOrders.length > 0 ? (
              <Line data={hourlyOrdersData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm muted">Sin datos disponibles</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rendimiento de Productos - Full Width */}
      {productPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="surface rounded-lg shadow-sm border muted p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base lg:text-lg font-bold text-primary">
                Rendimiento de Productos
              </h3>
              <p className="text-xs lg:text-sm muted mt-1">Comparativa multidimensional</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
          <div className="h-64 lg:h-80">
            <Radar 
              data={productPerformanceData} 
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    ticks: { color: "rgb(107, 114, 128)" },
                    grid: { color: "rgba(209, 213, 219, 0.3)" },
                  },
                },
              }} 
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
