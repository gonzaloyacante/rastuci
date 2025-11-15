// Chart utilities and data processing for admin dashboard
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "doughnut" | "area" | "scatter";
  title?: string;
  subtitle?: string;
  xAxis?: {
    label?: string;
    type?: "category" | "time" | "numeric";
    format?: string;
  };
  yAxis?: {
    label?: string;
    format?: string;
    min?: number;
    max?: number;
  };
  colors?: string[];
  responsive?: boolean;
  animation?: boolean;
  legend?: {
    show?: boolean;
    position?: "top" | "bottom" | "left" | "right";
  };
}

// Chart data processors
export class ChartDataProcessor {
  static processTimeSeriesData(
    data: TimeSeriesPoint[],
    groupBy: "hour" | "day" | "week" | "month" = "day"
  ): ChartDataPoint[] {
    const grouped = new Map<string, number>();

    data.forEach((point) => {
      const key = this.getTimeKey(point.timestamp, groupBy);
      grouped.set(key, (grouped.get(key) || 0) + point.value);
    });

    return Array.from(grouped.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  static processTopItems<T>(
    items: T[],
    getValue: (item: T) => number,
    getLabel: (item: T) => string,
    limit = 10
  ): ChartDataPoint[] {
    return items
      .map((item) => ({
        label: getLabel(item),
        value: getValue(item),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  static processPercentageData(data: ChartDataPoint[]): ChartDataPoint[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map((item) => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }

  static processGrowthData(
    current: ChartDataPoint[],
    previous: ChartDataPoint[]
  ): ChartDataPoint[] {
    return current.map((currentItem) => {
      const previousItem = previous.find((p) => p.label === currentItem.label);
      const previousValue = previousItem?.value || 0;
      const growth =
        previousValue > 0
          ? ((currentItem.value - previousValue) / previousValue) * 100
          : 0;

      return {
        ...currentItem,
        value: growth,
        metadata: {
          current: currentItem.value,
          previous: previousValue,
          growth,
        },
      };
    });
  }

  private static getTimeKey(date: Date, groupBy: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    switch (groupBy) {
      case "hour":
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:00`;
      case "day":
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      case "month":
        return `${year}-${month.toString().padStart(2, "0")}`;
      default:
        return date.toISOString().split("T")[0];
    }
  }
}

// NOTE: MockDataGenerator removed — production/admin charts must be fed with
// real aggregated data from the API (e.g. /api/orders, /api/products, /api/products/stats).
// If you need demo data for storybook or local UI development, create a separate
// dev-only helper or use the test fixtures under the `tests/` folder. Removing the
// embedded mock generator prevents accidental usage of fabricated data in the app.

// Chart color palettes
export const ChartColors = {
  primary: [
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
  ],

  success: ["#e8f5e8", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50"],
  warning: ["#fff3e0", "#ffe0b2", "#ffcc02", "#ffb74d", "#ffa726", "#ff9800"],
  error: ["#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336"],
  info: ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3"],

  gradient: {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    warning: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    error: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  },
};

// Utility functions
export function formatChartValue(
  value: number,
  type: "currency" | "percentage" | "number" = "number"
): string {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat("es-ES").format(value);
  }
}

export function getChartColor(
  index: number,
  palette: string[] = ChartColors.primary
): string {
  return palette[index % palette.length];
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function generateDateRange(days: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}
