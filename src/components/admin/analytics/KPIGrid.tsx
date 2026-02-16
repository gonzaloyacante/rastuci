"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { type DashboardData } from "@/services/analytics-service";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPIGridProps {
  data: DashboardData["kpi"];
}

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  format?: "currency" | "number" | "percent";
  trendData?: { value: number }[]; // Placeholder for future real trend data
}

function KPICard({
  title,
  value,
  change,
  icon: Icon,
  trendData = [],
}: KPICardProps) {
  const isPositive = change >= 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  // Mock sparkline data if empty (to keep UI consistent until backend provides history per KPI)
  const sparklineData =
    trendData.length > 0
      ? trendData
      : [
          { value: 10 },
          { value: 15 },
          { value: 12 },
          { value: 18 },
          { value: 25 },
          { value: 20 },
          { value: 28 },
        ];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold tabular-nums tracking-tight">
            {value}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}
            >
              <ChangeIcon className="w-3 h-3" />
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs periodo anterior
            </span>
          </div>

          {/* Sparkline */}
          <div className="h-[40px] mt-2 opacity-50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "#10b981" : "#f43f5e"} // Emerald or Rose
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPIGrid({ data }: KPIGridProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Ingresos Totales"
        value={formatCurrency(data.revenue.value)}
        change={data.revenue.change}
        icon={DollarSign}
        // Future: trendData={data.revenue.trend}
      />
      <KPICard
        title="Órdenes"
        value={data.orders.value.toString()}
        change={data.orders.change}
        icon={ShoppingCart}
      />
      <KPICard
        title="Ticket Promedio (AOV)"
        value={formatCurrency(data.aov.value)}
        change={data.aov.change}
        icon={Target}
      />
      <KPICard
        title="Conversión (Est.)"
        value={`${data.conversion.value}%`}
        change={data.conversion.change}
        icon={Users}
      />
    </div>
  );
}
