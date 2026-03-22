"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ProgressBarProps {
  label: string;
  value: number;
  count?: number;
  percentage?: number;
  color?: "primary" | "success" | "warning" | "error";
}

const progressColorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

export function ProgressBar({
  label,
  value,
  count,
  percentage,
  color = "primary",
}: ProgressBarProps) {
  const displayPercentage = percentage ?? value;

  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 bg-surface-secondary rounded-full h-2">
          <div
            className={`${progressColorMap[color]} h-2 rounded-full`}
            style={{ width: `${Math.min(displayPercentage, 100)}%` }}
          />
        </div>
        <span className="text-sm text-muted w-20 text-right">
          {count !== undefined
            ? `${count} (${displayPercentage}%)`
            : `${displayPercentage}%`}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Distribution Chart (simple bar chart)
// ============================================================================

interface DistributionItem {
  label: string;
  count: number;
  percentage?: number;
}

interface DistributionChartProps {
  title: string;
  items: DistributionItem[];
}

export function DistributionChart({ title, items }: DistributionChartProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <ProgressBar
              key={item.label}
              label={item.label}
              value={(item.count / maxCount) * 100}
              count={item.count}
              percentage={item.percentage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
