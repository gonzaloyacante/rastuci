"use client";

import {
  DateRangeFilter,
  DistributionChart,
  downloadCSV,
  MetricCard,
  MetricsGrid,
  RegionSelect,
} from "@/components/admin";
import { MetricsSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Download, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// ============================================================================
// Types
// ============================================================================

interface ShippingAnalyticsData {
  totalOrders: number;
  delivery: {
    totalOrders: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    deliveredOrders: number;
    averageShippingCost: number;
    totalShippingRevenue: number;
    deliveryTimeDistribution: Array<{
      timeRange?: string;
      range: string;
      count: number;
      percentage?: number;
    }>;
    performanceByRegion: Array<{
      region: string;
      averageDeliveryTime?: number;
      onTimeRate?: number;
      count: number;
      averageCost?: number;
    }>;
  };
  satisfaction?: {
    satisfactionByDeliveryTime: Array<{
      timeRange: string;
      avgRating?: number;
      rating?: number;
      responseCount?: number;
    }>;
    overallSatisfactionRate: number;
    npsScore: number;
    recommendationRate: number;
    totalResponses?: number;
  };
  summary: {
    performanceScore: number;
    trendsIndicator: "improving" | "declining" | "stable";
  };
}

// ============================================================================
// Helper Components
// ============================================================================

function TrendBadge({
  trend,
}: {
  trend: "improving" | "declining" | "stable";
}) {
  const icons = {
    improving: TrendingUp,
    declining: TrendingDown,
    stable: Minus,
  };
  const labels = {
    improving: "Mejorando",
    declining: "Declinando",
    stable: "Estable",
  };
  const variants = {
    improving: "default",
    declining: "destructive",
    stable: "secondary",
  } as const;
  const Icon = icons[trend];

  return (
    <div className="flex items-center gap-1">
      <Icon
        className={`h-4 w-4 ${trend === "improving" ? "text-success" : trend === "declining" ? "text-error" : "text-muted"}`}
      />
      <Badge variant={variants[trend]}>{labels[trend]}</Badge>
    </div>
  );
}

function getPerformanceColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-error";
}

// ============================================================================
// Overview Cards Component
// ============================================================================

function OverviewCards({ data }: { data: ShippingAnalyticsData }) {
  return (
    <MetricsGrid columns={4}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Performance General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span
              className={`text-2xl font-bold ${getPerformanceColor(data.summary.performanceScore)}`}
            >
              {data.summary.performanceScore}%
            </span>
            <TrendBadge trend={data.summary.trendsIndicator} />
          </div>
        </CardContent>
      </Card>

      <MetricCard
        title="Tiempo Promedio"
        value={`${data.delivery.averageDeliveryTime} días`}
        subtitle="Tiempo de entrega"
      />

      <MetricCard
        title="Entregas a Tiempo"
        value={`${data.delivery.onTimeDeliveryRate}%`}
        subtitle={`${data.delivery.deliveredOrders} de ${data.delivery.totalOrders} órdenes`}
        valueColor="success"
      />

      <MetricCard
        title="Ingresos de Envío"
        value={`$${data.delivery.totalShippingRevenue}`}
        subtitle={`Promedio: $${data.delivery.averageShippingCost}`}
      />
    </MetricsGrid>
  );
}

// ============================================================================
// Region Performance Table
// ============================================================================

function RegionPerformanceTable({
  regions,
}: {
  regions: ShippingAnalyticsData["delivery"]["performanceByRegion"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Región</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Región</th>
                <th className="text-right py-2">Tiempo Promedio</th>
                <th className="text-right py-2">Tasa a Tiempo</th>
                <th className="text-right py-2">Órdenes</th>
                <th className="text-right py-2">Costo Promedio</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region) => (
                <tr key={region.region} className="border-b">
                  <td className="py-2 font-medium">{region.region}</td>
                  <td className="text-right py-2">
                    {region.averageDeliveryTime} días
                  </td>
                  <td className="text-right py-2">
                    <span
                      className={
                        (region.onTimeRate ?? 0) >= 80
                          ? "text-success"
                          : (region.onTimeRate ?? 0) >= 60
                            ? "text-warning"
                            : "text-error"
                      }
                    >
                      {region.onTimeRate}%
                    </span>
                  </td>
                  <td className="text-right py-2">{region.count}</td>
                  <td className="text-right py-2">
                    ${region.averageCost ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Satisfaction Card
// ============================================================================

function SatisfactionCard({
  satisfaction,
}: {
  satisfaction: NonNullable<ShippingAnalyticsData["satisfaction"]>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Satisfacción del Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {satisfaction.overallSatisfactionRate}/5
            </div>
            <p className="text-sm text-muted">Calificación Promedio</p>
            <p className="text-xs text-muted">
              {satisfaction.totalResponses} respuestas
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">
              {satisfaction.npsScore}
            </div>
            <p className="text-sm text-muted">NPS Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {satisfaction.recommendationRate}%
            </div>
            <p className="text-sm text-muted">Tasa de Recomendación</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Satisfacción por Tiempo de Entrega</h4>
          {satisfaction.satisfactionByDeliveryTime.map((item) => (
            <div
              key={item.timeRange}
              className="flex items-center justify-between p-3 surface rounded"
            >
              <span className="font-medium">{item.timeRange}</span>
              <div className="flex items-center gap-2">
                <span className="text-warning text-lg">
                  {"★".repeat(Math.round(item.avgRating ?? item.rating ?? 0))}
                  {"☆".repeat(
                    5 - Math.round(item.avgRating ?? item.rating ?? 0)
                  )}
                </span>
                <span className="text-sm text-muted">
                  {item.avgRating}/5 ({item.responseCount} respuestas)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Provider Comparison Card
// ============================================================================

function ProviderComparisonCard({ data }: { data: ShippingAnalyticsData }) {
  const caOrders = data.delivery.totalOrders;
  const caTime = data.delivery.averageDeliveryTime.toFixed(1);
  const caRate = data.delivery.onTimeDeliveryRate.toFixed(1);
  const caCost = data.delivery.averageShippingCost.toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedor de Envío</CardTitle>
      </CardHeader>
      <CardContent>
        <ProviderStats
          name="Correo Argentino"
          badge="Proveedor Actual"
          badgeVariant="default"
          orders={caOrders}
          avgTime={`${caTime} días`}
          onTimeRate={`${caRate}%`}
          avgCost={`$${caCost}`}
        />

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Nota:</strong> Correo Argentino es nuestro proveedor de
            envíos con cobertura nacional y más de 1000 sucursales.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProviderStatsProps {
  name: string;
  badge: string;
  badgeVariant: "default" | "secondary";
  orders: number;
  avgTime: string;
  onTimeRate: string;
  avgCost: string;
}

function ProviderStats({
  name,
  badge,
  badgeVariant,
  orders,
  avgTime,
  onTimeRate,
  avgCost,
}: ProviderStatsProps) {
  const stats = [
    { label: "Envíos Totales", value: orders },
    { label: "Tiempo Promedio", value: avgTime },
    {
      label: "Entregas a Tiempo",
      value: onTimeRate,
      className: "text-success",
    },
    { label: "Costo Promedio", value: avgCost },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-sm text-muted">{stat.label}</span>
            <span className={`font-semibold ${stat.className || ""}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ShippingAnalytics() {
  const [data, setData] = useState<ShippingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [includeDetails, setIncludeDetails] = useState(true);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
        includeDetails: includeDetails.toString(),
        ...(selectedRegion && { region: selectedRegion }),
      });
      const response = await fetch(
        `/api/analytics/shipping-performance?${params}`
      );
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch {
      toast.error("Error al cargar analíticas");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedRegion, includeDetails]);

  useEffect(() => {
    if (startDate && endDate) fetchAnalytics();
  }, [startDate, endDate, selectedRegion, includeDetails, fetchAnalytics]);

  const handleExport = () => {
    if (!data) return;
    const csvData: (string | number)[][] = [
      ["Métrica", "Valor"],
      ["Tiempo Promedio de Entrega (días)", data.delivery.averageDeliveryTime],
      ["Tasa de Entrega a Tiempo (%)", data.delivery.onTimeDeliveryRate],
      ["Total de Órdenes", data.delivery.totalOrders],
      ["Órdenes Entregadas", data.delivery.deliveredOrders],
      ["Costo Promedio de Envío", data.delivery.averageShippingCost],
      ["Ingresos Totales de Envío", data.delivery.totalShippingRevenue],
      ["Puntaje de Performance", data.summary.performanceScore],
    ];
    if (data.satisfaction) {
      csvData.push(
        ["Satisfacción Promedio", data.satisfaction.overallSatisfactionRate],
        ["NPS Score", data.satisfaction.npsScore],
        ["Tasa de Recomendación (%)", data.satisfaction.recommendationRate]
      );
    }
    downloadCSV(csvData, `shipping-analytics-${startDate}-${endDate}.csv`);
    toast.success("Exportación completada");
  };

  if (loading)
    return (
      <div className="container mx-auto p-6">
        <MetricsSkeleton />
      </div>
    );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics de Envíos</h1>
        <Button onClick={handleExport} variant="outline" disabled={!data}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      >
        <RegionSelect value={selectedRegion} onChange={setSelectedRegion} />
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeDetails}
              onChange={(e) => setIncludeDetails(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Incluir satisfacción</span>
          </label>
        </div>
      </DateRangeFilter>

      {data && (
        <>
          <OverviewCards data={data} />

          <DistributionChart
            title="Distribución de Tiempos de Entrega"
            items={data.delivery.deliveryTimeDistribution.map((d) => ({
              label: d.timeRange || d.range,
              count: d.count,
              percentage: d.percentage,
            }))}
          />

          <RegionPerformanceTable regions={data.delivery.performanceByRegion} />

          {data.satisfaction && (
            <SatisfactionCard satisfaction={data.satisfaction} />
          )}

          <ProviderComparisonCard data={data} />
        </>
      )}
    </div>
  );
}
