"use client";

import { MetricsSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import React, { useCallback, useEffect, useState } from "react";

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
}

type Period = "week" | "month" | "quarter" | "year";

const MetricasPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<MetricsDashboard | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/dashboard?period=${period}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al cargar métricas");
      }

      setDashboard(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const MetricCard: React.FC<{
    metric: MetricData;
    format?: "currency" | "number" | "percentage" | "days";
  }> = ({ metric, format = "number" }) => {
    const formatValue = (value: number): string => {
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
    };

    const trendIcon =
      metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→";
    // Para returnRate, "down" es positivo (menos devoluciones)
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
      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-content-secondary">
            {metric.label}
          </h3>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">
              {formatValue(metric.value)}
            </span>
            <div className="flex items-center gap-1">
              <Badge className={bgColor}>
                <span className={trendColor}>{trendIcon}</span>
                <span className="ml-1">
                  {Math.abs(metric.changePercent).toFixed(1)}%
                </span>
              </Badge>
            </div>
          </div>
          <p className="text-xs text-content-tertiary">
            {metric.change >= 0 ? "+" : "-"}
            {formatValue(Math.abs(metric.change))} vs período anterior
          </p>
        </div>
      </Card>
    );
  };

  const periodLabels: Record<Period, string> = {
    week: "Semana",
    month: "Mes",
    quarter: "Trimestre",
    year: "Año",
  };

  if (loading) {
    return <MetricsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-error font-medium mb-2">
            Error al cargar métricas
          </p>
          <p className="text-content-secondary text-sm mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8">
        <p className="text-content-secondary">No hay datos disponibles</p>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Métricas del Negocio</h1>
          <p className="text-content-secondary text-sm mt-1">
            Datos en tiempo real desde la base de datos
          </p>
        </div>
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
      </div>

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

      {/* Productos Top */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top Productos Vendidos</h3>
        {dashboard.topProducts.length === 0 ? (
          <div className="text-center py-8 text-content-secondary">
            <p>No hay ventas en este período</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 surface-secondary rounded"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-content-secondary">
                      {product.sales} unidades • {product.orders} órdenes
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-success">
                  ${product.revenue.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logística */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📦</span> Logística
          </h3>
          <div className="space-y-4">
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.shippingMetrics.averageDeliveryTime.label}
              </p>
              <p className="text-xl font-bold">
                {dashboard.shippingMetrics.averageDeliveryTime.value} días
              </p>
            </div>
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.shippingMetrics.onTimeDeliveryRate.label}
              </p>
              <p className="text-xl font-bold">
                {dashboard.shippingMetrics.onTimeDeliveryRate.value}%
              </p>
            </div>
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.shippingMetrics.shippingCost.label}
              </p>
              <p className="text-xl font-bold">
                $
                {dashboard.shippingMetrics.shippingCost.value.toLocaleString(
                  "es-AR"
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Clientes */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>👥</span> Clientes
          </h3>
          <div className="space-y-4">
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.customerMetrics.newCustomers.label}
              </p>
              <p className="text-xl font-bold text-success">
                {dashboard.customerMetrics.newCustomers.value}
              </p>
            </div>
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.customerMetrics.returningCustomers.label}
              </p>
              <p className="text-xl font-bold">
                {dashboard.customerMetrics.returningCustomers.value}
              </p>
            </div>
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.customerMetrics.customerLifetimeValue.label}
              </p>
              <p className="text-xl font-bold">
                $
                {dashboard.customerMetrics.customerLifetimeValue.value.toLocaleString(
                  "es-AR"
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Inventario */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Inventario
          </h3>
          <div className="space-y-4">
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.productMetrics.totalProducts.label}
              </p>
              <p className="text-xl font-bold">
                {dashboard.productMetrics.totalProducts.value}
              </p>
            </div>
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
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm text-content-secondary">
                {dashboard.productMetrics.averageRating.label}
              </p>
              <p className="text-xl font-bold">
                ⭐{" "}
                {dashboard.productMetrics.averageRating.value > 0
                  ? dashboard.productMetrics.averageRating.value.toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        {dashboard.recentActivity.length === 0 ? (
          <div className="text-center py-8 text-content-secondary">
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 surface-secondary rounded"
              >
                <span className="text-primary text-xl">
                  {activity.type === "order"
                    ? "🛍️"
                    : activity.type === "customer"
                      ? "👤"
                      : activity.type === "review"
                        ? "⭐"
                        : "📦"}
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
                {activity.value !== undefined && (
                  <Badge className="badge-default shrink-0">
                    {activity.type === "review"
                      ? `${activity.value}★`
                      : activity.type === "order"
                        ? `$${activity.value.toLocaleString("es-AR")}`
                        : activity.value}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer informativo */}
      <div className="text-center text-xs text-content-tertiary py-4">
        <p>📊 Datos en tiempo real desde la base de datos</p>
        <p className="mt-1">
          Período: {periodLabels[period]} • Actualizado:{" "}
          {new Date().toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
};

export default MetricasPage;
