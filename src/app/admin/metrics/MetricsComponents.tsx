import React from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

import { FormatType, MetricData, MetricsDashboard } from "./metricsTypes";

export function formatValue(value: number, format: FormatType): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return `${value}%`;
    case "days":
      return `${value} días`;
    default:
      return value.toLocaleString("es-AR");
  }
}

interface MetricCardProps {
  metric: MetricData;
  format?: FormatType;
}

export function MetricCard({ metric, format = "number" }: MetricCardProps) {
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

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: "default" | "success" | "warning" | "error";
}

export function MiniStat({ label, value, color = "default" }: MiniStatProps) {
  const colorClass = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  return (
    <div className="p-2 sm:p-3 surface-secondary rounded">
      <p className="text-xs sm:text-sm text-content-secondary truncate">{label}</p>
      <p className={`text-base sm:text-lg lg:text-xl font-bold ${colorClass[color]}`}>
        {value}
      </p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

interface TopProductsProps {
  products: MetricsDashboard["topProducts"];
}

export function TopProducts({ products }: TopProductsProps) {
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
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Top Productos</h3>
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
                <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
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

interface RecentActivityProps {
  activities: MetricsDashboard["recentActivity"];
}

const activityIcons: Record<string, string> = {
  order: "🛍️",
  customer: "👤",
  review: "⭐",
  product: "📦",
};

function formatActivityValue(activity: MetricsDashboard["recentActivity"][0]): React.ReactNode {
  if (activity.value === undefined) return null;
  if (activity.type === "review") return `${activity.value}★`;
  if (activity.type === "order") return formatCurrency(activity.value as number);
  return activity.value;
}

export function RecentActivity({ activities }: RecentActivityProps) {
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

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          const activityValue = formatActivityValue(activity);
          return (
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
              {activityValue && (
                <Badge className="badge-default shrink-0">{activityValue}</Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
