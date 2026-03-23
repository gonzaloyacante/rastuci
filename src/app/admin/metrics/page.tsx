"use client";

import React, { useCallback, useEffect, useState } from "react";

import { PageHeaderWithActions } from "@/components/admin";
import LazyAdvancedCharts from "@/components/admin/dashboard/LazyAdvancedCharts";
import { MetricsSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

import {
  MetricCard,
  MiniStat,
  RecentActivity,
  SectionCard,
  TopProducts,
} from "./MetricsComponents";
import { MetricsDashboard, Period, periodLabels } from "./metricsTypes";

// ============================================================================
// Data Fetching Helper
// ============================================================================

async function loadDashboard(period: Period): Promise<MetricsDashboard> {
  const response = await fetch(`/api/admin/dashboard?period=${period}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "Error al cargar métricas");
  return data.data as MetricsDashboard;
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
      setDashboard(await loadDashboard(period));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchData();
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
            value={formatCurrency(dashboard.shippingMetrics.shippingCost.value)}
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
            value={formatCurrency(
              dashboard.customerMetrics.customerLifetimeValue.value
            )}
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
