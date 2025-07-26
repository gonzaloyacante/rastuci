import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProductCategoryData, MonthlySales } from "@/hooks/useDashboard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { AdminEmpty } from "@/components/admin";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartsProps {
  categoryData: ProductCategoryData[];
  monthlySales: MonthlySales[];
  loading: boolean;
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

export const DashboardCharts = ({
  categoryData,
  monthlySales,
  loading,
}: DashboardChartsProps) => {
  const salesChartData = {
    labels: monthlySales.map((item) => monthNames[parseInt(item.month) - 1]),
    datasets: [
      {
        label: "Ventas Mensuales",
        data: monthlySales.map((item) => item.revenue),
        borderColor: "#6C63FF",
        backgroundColor: "rgba(108, 99, 255, 0.08)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#6C63FF",
        pointBorderColor: "#fff",
        pointRadius: 5,
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
          "#6C63FF",
          "#00BFA6",
          "#FFB300",
          "#43A047",
          "#E53935",
          "#F5F5F5",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#444",
          font: { size: 14, family: "Montserrat, sans-serif" },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#222",
        bodyColor: "#6C63FF",
        borderColor: "#ECECEC",
        borderWidth: 1,
        padding: 12,
        titleFont: { weight: "bold" as const, size: 16 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        grid: { color: "#F0F0F0" },
        ticks: { color: "#888" },
      },
      y: {
        grid: { color: "#F0F0F0" },
        ticks: { color: "#888" },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-[#222] mb-4">Ventas Mensuales</h3>
        <div className="h-64">
          {!loading && monthlySales.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
          ) : (
            <AdminEmpty title="Sin datos para mostrar" />
            )}
          </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-[#222] mb-4">
            Productos por Categoría
        </h3>
        <div className="h-64">
          {!loading && categoryData.length > 0 ? (
              <Doughnut data={categoryChartData} options={chartOptions} />
          ) : (
            <AdminEmpty title="Sin datos para mostrar" />
            )}
          </div>
      </div>
    </div>
  );
};
