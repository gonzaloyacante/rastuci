"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { type DashboardData } from "@/services/analytics-service";
import {
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

interface DevicesCardProps {
  data: DashboardData["devices"];
  className?: string;
}

export function DevicesCard({ data, className }: DevicesCardProps) {
  // Add fill color for Recharts if not present in service (safety)
  const chartData = data.map((d) => ({
    name: d.name,
    count: d.value,
    fill: d.color || "#8884d8", // Fallback
  }));

  const totalSessions = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li
            key={`item-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.value}</span>
            </div>
            <span className="font-bold tabular-nums">
              {Math.round((entry.payload.count / (totalSessions || 1)) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className={`col-span-4 lg:col-span-1 flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle>Dispositivos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center relative">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={10}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey="count" cornerRadius={10} />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="bottom"
                content={renderLegend}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
            <div className="text-2xl font-bold tabular-nums">
              {totalSessions}
            </div>
            <div className="text-xs text-muted-foreground">Sesiones</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
