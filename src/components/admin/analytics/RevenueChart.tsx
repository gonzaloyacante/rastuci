"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { type DashboardData } from "@/services/analytics-service";

interface RevenueChartProps {
  data: DashboardData["chart"];
  className?: string; // Allow grid positioning
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
    }); // e.g., "Lun 15"
  };

  return (
    <Card className={`col-span-4 lg:col-span-3 ${className}`}>
      <CardHeader>
        <CardTitle>Evolución de Ingresos</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                minTickGap={30}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                width={80}
              />
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-xl">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Fecha
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {label
                                ? new Date(label).toLocaleDateString("es-AR", {
                                    day: "numeric",
                                    month: "long",
                                  })
                                : "-"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Ventas
                            </span>
                            <span className="font-bold text-primary">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
