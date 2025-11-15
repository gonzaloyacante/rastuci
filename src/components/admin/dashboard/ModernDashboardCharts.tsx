"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import { PieChart, TrendingUp } from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  categoryData: { category: string; count: number }[];
  monthlySales: { month: string; revenue: number }[];
  loading?: boolean;
}

const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function ModernDashboardCharts({
  categoryData,
  monthlySales,
  loading = false,
}: ChartData) {
  // Datos de ventas mensuales
  const salesChartData = {
    labels: monthlySales.map(
      (item) => monthNames[parseInt(item.month) - 1] || item.month
    ),
    datasets: [
      {
        label: "Ventas ($)",
        data: monthlySales.map((item) => item.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "rgb(255, 255, 255)",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Datos de categorías
  const categoryChartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: "Productos",
        data: categoryData.map((item) => item.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(245, 158, 11, 0.8)", // Yellow
          "rgba(239, 68, 68, 0.8)", // Red
          "rgba(139, 92, 246, 0.8)", // Purple
          "rgba(6, 182, 212, 0.8)", // Cyan
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
          "rgb(139, 92, 246)",
          "rgb(6, 182, 212)",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Opciones de gráficas
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
          padding: 20,
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
        titleFont: { weight: 600, size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(209, 213, 219, 0.3)",
          display: false,
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: "rgba(209, 213, 219, 0.3)",
        },
        ticks: {
          color: "rgb(107, 114, 128)",
          font: { size: 12 },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
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
        titleFont: { weight: 600, size: 14 },
        bodyFont: { size: 13 },
      },
    },
    cutout: "60%",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div
            key={`item-${i}`}
            className="surface rounded-2xl shadow-sm border muted p-6"
          >
            <div className="animate-pulse">
              <div className="h-6 surface-secondary rounded w-1/3 mb-4"></div>
              <div className="h-64 surface-secondary rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-8"
    >
      {/* Ventas Mensuales */}
      <div className="relative overflow-hidden surface rounded-lg sm:rounded-2xl shadow-sm border muted p-3 sm:p-4 lg:p-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                Ventas Mensuales
              </h3>
              <p className="text-xs sm:text-sm muted mt-0.5 sm:mt-1">
                Evolución de ingresos por mes
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            {monthlySales.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 muted mx-auto mb-3" />
                  <p className="text-sm muted">No hay datos de ventas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Productos por Categoría */}
      <div className="relative overflow-hidden surface rounded-lg sm:rounded-2xl shadow-sm border muted p-3 sm:p-4 lg:p-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-primary">
                Productos por Categoría
              </h3>
              <p className="text-xs sm:text-sm muted mt-0.5 sm:mt-1">
                Distribución del catálogo
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>
          <div className="h-48 sm:h-56 lg:h-64">
            {categoryData.length > 0 ? (
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PieChart className="h-12 w-12 muted mx-auto mb-3" />
                  <p className="text-sm muted">No hay datos de categorías</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
