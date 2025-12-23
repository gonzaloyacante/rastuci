"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Search,
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPriceARS } from "@/utils/formatters";

interface AnalyticsDashboardData {
  overview: {
    sessions: { today: number; week: number; month: number; total: number };
    conversions: { today: number; week: number; month: number };
    conversionRate: { today: number; week: number; month: number };
    revenue: { today: number; week: number; month: number };
  };
  devices: Array<{ type: string; count: number }>;
  topPages: Array<{ url: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
  abandonment: { count: number; value: number };
  recentSessions: Array<{
    id: string;
    startedAt: string;
    pageViews: number;
    deviceType: string;
    entryPage: string;
    isConverted: boolean;
    conversionValue: number | null;
  }>;
  sessionsOverTime: Array<{
    date: string;
    sessions: number;
    conversions: number;
  }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="surface border border-muted rounded-xl p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="surface border border-muted rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium muted">{title}</span>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {subtitle && <p className="text-xs muted mt-1">{subtitle}</p>}
      {trend && (
        <div
          className={`text-xs mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% vs anterior
        </div>
      )}
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  switch (type?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
}

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "week"
  );

  const { data, error, isLoading, mutate } = useSWR<{
    data: AnalyticsDashboardData;
  }>(
    "/api/admin/analytics/dashboard",
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const stats = data?.data;

  if (error) {
    return (
      <div className="p-8">
        <div className="surface border border-red-300 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error al cargar analíticas
          </h2>
          <p className="muted mb-4">
            No se pudieron obtener los datos del dashboard.
          </p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const getValueForRange = (obj: Record<string, number> | undefined) => {
    if (!obj) return 0;
    return obj[timeRange] || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Analytics Dashboard
          </h1>
          <p className="muted">
            Métricas de comportamiento de usuarios en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            {(["today", "week", "month"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {range === "today"
                  ? "Hoy"
                  : range === "week"
                    ? "Semana"
                    : "Mes"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sesiones"
          value={getValueForRange(stats?.overview?.sessions)}
          subtitle={`${stats?.overview?.sessions?.total || 0} total`}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Conversiones"
          value={getValueForRange(stats?.overview?.conversions)}
          subtitle={`${getValueForRange(stats?.overview?.conversionRate)}% tasa`}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          title="Ingresos"
          value={formatPriceARS(getValueForRange(stats?.overview?.revenue))}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          title="Carritos Abandonados"
          value={stats?.abandonment?.count || 0}
          subtitle={formatPriceARS(stats?.abandonment?.value || 0)}
          icon={AlertCircle}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <div className="surface border border-muted rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Sesiones por Día
          </h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-2">
              {stats?.sessionsOverTime?.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs muted w-20">
                    {new Date(day.date).toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max(
                          5,
                          (day.sessions /
                            Math.max(
                              ...stats.sessionsOverTime.map((d) => d.sessions),
                              1
                            )) *
                            100
                        )}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {day.sessions}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-green-600 w-8">
                    {day.conversions > 0 ? `+${day.conversions}` : "0"}
                  </span>
                </div>
              ))}
              {(!stats?.sessionsOverTime ||
                stats.sessionsOverTime.length === 0) && (
                <p className="text-center muted py-8">Sin datos aún</p>
              )}
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="surface border border-muted rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Dispositivos
          </h3>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-4">
              {stats?.devices?.map((device, idx) => {
                const total = stats.devices.reduce(
                  (sum, d) => sum + d.count,
                  0
                );
                const percentage = total > 0 ? (device.count / total) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <DeviceIcon type={device.type} />
                    <span className="text-sm capitalize flex-1">
                      {device.type || "Desconocido"}
                    </span>
                    <div className="w-24 bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
              {(!stats?.devices || stats.devices.length === 0) && (
                <p className="text-center muted py-8">Sin datos aún</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="surface border border-muted rounded-xl p-6">
          <h3 className="font-semibold mb-4">📄 Páginas Más Visitadas</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.topPages?.slice(0, 5).map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                >
                  <span
                    className="text-sm truncate flex-1 mr-2"
                    title={page.url}
                  >
                    {page.url?.replace(/^\//, "") || "/"}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {page.views}
                  </span>
                </div>
              ))}
              {(!stats?.topPages || stats.topPages.length === 0) && (
                <p className="text-center muted py-4">Sin datos aún</p>
              )}
            </div>
          )}
        </div>

        {/* Top Searches */}
        <div className="surface border border-muted rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsquedas Más Frecuentes
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.topSearches?.slice(0, 5).map((search, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                >
                  <span className="text-sm truncate flex-1 mr-2">
                    "{search.query}"
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {search.count}
                  </span>
                </div>
              ))}
              {(!stats?.topSearches || stats.topSearches.length === 0) && (
                <p className="text-center muted py-4">Sin datos aún</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="surface border border-muted rounded-xl p-6">
          <h3 className="font-semibold mb-4">🔴 Sesiones Recientes</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats?.recentSessions?.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-muted last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={session.deviceType} />
                    <div>
                      <p
                        className="text-sm truncate max-w-[120px]"
                        title={session.entryPage}
                      >
                        {session.entryPage?.replace(/^\//, "") || "Home"}
                      </p>
                      <p className="text-xs muted">
                        {session.pageViews} páginas
                      </p>
                    </div>
                  </div>
                  {session.isConverted ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      ✓{" "}
                      {session.conversionValue
                        ? formatPriceARS(session.conversionValue)
                        : "Conv."}
                    </span>
                  ) : (
                    <span className="text-xs muted">
                      {new Date(session.startedAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
              {(!stats?.recentSessions ||
                stats.recentSessions.length === 0) && (
                <p className="text-center muted py-4">Sin sesiones hoy</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
