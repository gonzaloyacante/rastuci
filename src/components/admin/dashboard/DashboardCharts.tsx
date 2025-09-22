import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  // Helper: compute CSS color from a semantic utility class
  const getStyleColor = (
    className: string,
    prop: "color" | "backgroundColor" | "borderLeftColor" = "color"
  ) => {
    if (typeof window === "undefined") return undefined as unknown as string;
    const el = document.createElement("span");
    el.className = className;
    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    const color = getComputedStyle(el)[prop as keyof CSSStyleDeclaration];
    document.body.removeChild(el);
    return String(color || '');
  };

  // Semantic colors
  const primaryColor = getStyleColor("text-primary");
  const mutedText = getStyleColor("muted");
  const surfaceBg = getStyleColor("surface", "backgroundColor");
  const borderMuted = getStyleColor("border border-muted", "borderLeftColor");
  const titleColor = getStyleColor("text-primary");
  const bodyColor = primaryColor;
  const gridColor = getStyleColor("border border-muted", "borderLeftColor");

  const salesChartData = {
    labels: monthlySales.map((item) => monthNames[parseInt(item.month) - 1]),
    datasets: [
      {
        label: "Ventas Mensuales",
        data: monthlySales.map((item) => item.revenue),
        borderColor: primaryColor,
        backgroundColor: primaryColor
          ? String(primaryColor).replace(
              /rgb\(([^)]+)\)/,
              (_: string, rgb: string) => `rgba(${rgb}, 0.08)`
            )
          : "rgba(0,0,0,0.08)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: primaryColor,
        pointBorderColor: surfaceBg || "rgb(255,255,255)",
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
          getStyleColor("text-primary"),
          getStyleColor("text-success-600") || getStyleColor("text-success"),
          getStyleColor("text-warning-600") || getStyleColor("text-warning"),
          getStyleColor("text-success") || getStyleColor("text-primary"),
          getStyleColor("text-error") || getStyleColor("text-primary"),
          getStyleColor("muted")
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
          color: mutedText,
          font: { size: 14, family: "Montserrat, sans-serif" },
        },
      },
      tooltip: {
        backgroundColor: surfaceBg,
        titleColor: titleColor,
        bodyColor: bodyColor,
        borderColor: borderMuted,
        borderWidth: 1,
        padding: 12,
        titleFont: { weight: "bold" as const, size: 16 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: mutedText },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: mutedText },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="surface rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-primary mb-4">Ventas Mensuales</h3>
        <div className="h-64">
          {!loading && monthlySales.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
          ) : (
            <AdminEmpty title="Sin datos para mostrar" />
            )}
          </div>
      </div>
      <div className="surface rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-primary mb-4">
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
