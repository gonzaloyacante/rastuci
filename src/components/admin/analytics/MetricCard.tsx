"use client";

import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "improving" | "declining" | "stable";
  trendValue?: string;
  icon?: LucideIcon;
  valueColor?: "default" | "success" | "warning" | "error";
}

function getTrendIcon(trend?: string) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-error" />;
    default:
      return <Minus className="h-4 w-4 text-muted" />;
  }
}

function getTrendLabel(trend?: string) {
  switch (trend) {
    case "improving":
      return "Mejorando";
    case "declining":
      return "Declinando";
    default:
      return "Estable";
  }
}

function getTrendVariant(
  trend?: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (trend) {
    case "improving":
      return "default";
    case "declining":
      return "destructive";
    default:
      return "secondary";
  }
}

const valueColorMap = {
  default: "",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  valueColor = "default",
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${valueColorMap[valueColor]}`}>
              {value}
            </div>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(trend)}
              <Badge variant={getTrendVariant(trend)}>
                {trendValue || getTrendLabel(trend)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Metrics Grid
// ============================================================================

interface MetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const metricsGridColsMap = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function MetricsGrid({ children, columns = 4 }: MetricsGridProps) {
  return (
    <div className={`grid ${metricsGridColsMap[columns]} gap-4`}>
      {children}
    </div>
  );
}
