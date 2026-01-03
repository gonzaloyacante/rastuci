"use client";

import { PageHeaderWithActions } from "@/components/admin";
import { MetricsSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import LazyAdvancedCharts from "@/components/admin/dashboard/LazyAdvancedCharts";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

interface MetricsDashboard {
  overview: {
    totalSales: MetricData;
    totalOrders: MetricData;
    averageOrderValue: MetricData;
    customerCount: MetricData;
    conversionRate: MetricData;
    returnRate: MetricData;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    orders: number;
    revenue: number;
  }>;
  shippingMetrics: {
    averageDeliveryTime: MetricData;
    onTimeDeliveryRate: MetricData;
    shippingCost: MetricData;
  };
  customerMetrics: {
    newCustomers: MetricData;
    returningCustomers: MetricData;
    customerLifetimeValue: MetricData;
  };
  productMetrics: {
    totalProducts: MetricData;
    lowStockProducts: number;
    outOfStockProducts: number;
    averageRating: MetricData;
  };
  recentActivity: Array<{
    id: string;
    type: "order" | "customer" | "product" | "review";
    description: string;
    timestamp: string;
    value?: number;
  }>;
  ordersPerDay?: Array<{ day: string; orders: number }>;
  topCustomers?: Array<{ name: string; totalSpent: number }>;
  orderStatus?: Array<{ status: string; count: number }>;
  hourlyOrders?: Array<{ hour: string; orders: number }>;
  productPerformance?: Array<{
    product: string;
    sales: number;
    revenue: number;
    rating: number;
  }>;
}

type Period = "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  week: "Semana",
  month: "Mes",
  quarter: "Trimestre",
  year: "Año",
};

// ============================================================================
// Format Helpers
// ============================================================================

type FormatType = "currency" | "number" | "percentage" | "days";

function formatValue(value: number, format: FormatType): string {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString("es-AR")}`;
    case "percentage":
      return `${value}%`;
    case "days":
      return `${value} días`;
    default:
      return value.toLocaleString("es-AR");
  }
}

// ============================================================================
// Metric Card Component
// ============================================================================

interface MetricCardProps {
  metric: MetricData;
  format?: FormatType;
}

function MetricCard({ metric, format = "number" }: MetricCardProps) {
  const trendIcon =
    metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→";
  const isPositiveTrend =
    metric.label === "Tasa de Devolución"
      ? metric.trend === "down"
      : metric.trend === "up";
  const trendColor = isPositiveTrend
    ? "text-success"
    : metric.trend === "stable"
      ? "text-content-secondary"
      : "text-error";
  const bgColor = isPositiveTrend
    ? "badge-success"
    : metric.trend === "stable"
      ? "badge-default"
      : "badge-error";

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-medium text-content-secondary">
          {metric.label}
        </h3>
        <div className="flex items-end justify-between gap-2">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold">
            {formatValue(metric.value, format)}
          </span>
          <Badge className={bgColor}>
            <span className={trendColor}>{trendIcon}</span>
            <span className="ml-1 text-xs">
              {Math.abs(metric.changePercent).toFixed(1)}%
            </span>
          </Badge>
        </div>
        <p className="text-xs text-content-tertiary">
          {metric.change >= 0 ? "+" : "-"}
          {formatValue(Math.abs(metric.change), format)} vs anterior
        </p>
      </div>
    </Card>
  );
}

// ============================================================================
// Mini Stat Component
// ============================================================================

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: "default" | "success" | "warning" | "error";
}

function MiniStat({ label, value, color = "default" }: MiniStatProps) {
  const colorClass = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  return (
    <div className="p-2 sm:p-3 surface-secondary rounded">
      <p className="text-xs sm:text-sm text-content-secondary truncate">
        {label}
      </p>
      <p
        className={`text-base sm:text-lg lg:text-xl font-bold ${colorClass[color]}`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// Section Card Component
// ============================================================================

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

// ============================================================================
// Top Products Component
// ============================================================================

interface TopProductsProps {
  products: MetricsDashboard["topProducts"];
}

function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top Productos Vendidos</h3>
        <div className="text-center py-8 text-content-secondary">
          <p>No hay ventas en este período</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        Top Productos
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2 sm:p-3 surface-secondary rounded gap-2"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-bold shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base truncate">
                  {product.name}
                </h4>
                <p className="text-xs sm:text-sm text-content-secondary truncate">
                  {product.sales} unids • {product.orders} ord.
                </p>
              </div>
            </div>
            <span className="font-semibold text-success text-xs sm:text-sm whitespace-nowrap">
              ${product.revenue.toLocaleString("es-AR")}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Recent Activity Component
// ============================================================================

interface RecentActivityProps {
  activities: MetricsDashboard["recentActivity"];
}

const activityIcons: Record<string, string> = {
  order: "🛍️",
  customer: "👤",
  review: "⭐",
  product: "📦",
};

function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="text-center py-8 text-content-secondary">
          <p>No hay actividad reciente</p>
        </div>
      </Card>
    );
  }

  const formatActivityValue = (
    activity: MetricsDashboard["recentActivity"][0]
  ) => {
    if (activity.value === undefined) return null;
    if (activity.type === "review") return `${activity.value}★`;
    if (activity.type === "order")
      return `$${activity.value.toLocaleString("es-AR")}`;
    return activity.value;
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 surface-secondary rounded"
          >
            <span className="text-primary text-xl">
              {activityIcons[activity.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.description}</p>
              <p className="text-xs text-content-tertiary">
                {new Date(activity.timestamp).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {formatActivityValue(activity) && (
              <Badge className="badge-default shrink-0">
                {formatActivityValue(activity)}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MetricasPage() {
  const [dashboard, setDashboard] = useState<MetricsDashboard | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Error al cargar métricas");
      setDashboard(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <MetricsSkeleton />;

  if (error || !dashboard) {
    return (
      <div className="text-center py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-error font-medium mb-2">
            Error al cargar métricas
          </p>
          <p className="text-content-secondary text-sm mb-4">
            {error || "No hay datos"}
          </p>
          <Button onClick={fetchData} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Métricas del Negocio"
        subtitle="Datos en tiempo real desde la base de datos"
      >
        <div className="flex gap-2 flex-wrap">
          {(["week", "month", "quarter", "year"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "primary" : "outline"}
              onClick={() => setPeriod(p)}
              size="sm"
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </PageHeaderWithActions>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard metric={dashboard.overview.totalSales} format="currency" />
        <MetricCard metric={dashboard.overview.totalOrders} format="number" />
        <MetricCard
          metric={dashboard.overview.averageOrderValue}
          format="currency"
        />
        <MetricCard metric={dashboard.overview.customerCount} format="number" />
        <MetricCard
          metric={dashboard.overview.conversionRate}
          format="percentage"
        />
        <MetricCard
          metric={dashboard.overview.returnRate}
          format="percentage"
        />
      </div>

      <TopProducts products={dashboard.topProducts} />

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Logística" icon="📦">
          <MiniStat
            label={dashboard.shippingMetrics.averageDeliveryTime.label}
            value={`${dashboard.shippingMetrics.averageDeliveryTime.value} días`}
          />
          <MiniStat
            label={dashboard.shippingMetrics.onTimeDeliveryRate.label}
            value={`${dashboard.shippingMetrics.onTimeDeliveryRate.value}%`}
          />
          <MiniStat
            label={dashboard.shippingMetrics.shippingCost.label}
            value={`$${dashboard.shippingMetrics.shippingCost.value.toLocaleString("es-AR")}`}
          />
        </SectionCard>

        <SectionCard title="Clientes" icon="👥">
          <MiniStat
            label={dashboard.customerMetrics.newCustomers.label}
            value={dashboard.customerMetrics.newCustomers.value}
            color="success"
          />
          <MiniStat
            label={dashboard.customerMetrics.returningCustomers.label}
            value={dashboard.customerMetrics.returningCustomers.value}
          />
          <MiniStat
            label={dashboard.customerMetrics.customerLifetimeValue.label}
            value={`$${dashboard.customerMetrics.customerLifetimeValue.value.toLocaleString("es-AR")}`}
          />
        </SectionCard>

        <SectionCard title="Inventario" icon="📊">
          <MiniStat
            label={dashboard.productMetrics.totalProducts.label}
            value={dashboard.productMetrics.totalProducts.value}
          />
          <div className="p-3 surface-secondary rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-content-secondary">Stock Bajo</p>
                <p className="text-xl font-bold text-warning">
                  {dashboard.productMetrics.lowStockProducts}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-content-secondary">Sin Stock</p>
                <p className="text-xl font-bold text-error">
                  {dashboard.productMetrics.outOfStockProducts}
                </p>
              </div>
            </div>
          </div>
          <MiniStat
            label={dashboard.productMetrics.averageRating.label}
            value={
              dashboard.productMetrics.averageRating.value > 0
                ? `⭐ ${dashboard.productMetrics.averageRating.value.toFixed(1)}`
                : "⭐ N/A"
            }
          />
        </SectionCard>
      </div>

      <RecentActivity activities={dashboard.recentActivity} />

      {/* Gráficas Avanzadas */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Análisis Detallado</h2>
        <LazyAdvancedCharts
          ordersPerDay={dashboard.ordersPerDay}
          topCustomers={dashboard.topCustomers}
          orderStatus={dashboard.orderStatus}
          hourlyOrders={dashboard.hourlyOrders}
          productPerformance={dashboard.productPerformance}
          loading={loading}
        />
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-content-tertiary py-4">
        <p>📊 Datos en tiempo real desde la base de datos</p>
        <p className="mt-1">
          Período: {periodLabels[period]} • Actualizado:{" "}
          {new Date().toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}
