import type { ChartDataPoint } from "./types";

const PERIOD_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

function getDaysForPeriod(period: string): number {
  return PERIOD_DAYS[period] ?? 365;
}

function buildDateLabel(date: Date): string {
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function groupChartLabel(chunk: ChartDataPoint[], i: number, period: "quarter" | "year"): string {
  if (period === "quarter") return `Sem ${Math.floor(i / 7) + 1}`;
  return new Date(chunk[0]?.date || "").toLocaleDateString("es-AR", { month: "short" });
}

function groupChartData(
  data: ChartDataPoint[],
  period: "quarter" | "year"
): ChartDataPoint[] {
  const grouped: ChartDataPoint[] = [];
  const groupSize = period === "quarter" ? 7 : 30;
  for (let i = 0; i < data.length; i += groupSize) {
    const chunk = data.slice(i, i + groupSize);
    grouped.push({
      date: chunk[0]?.date || "",
      value: chunk.reduce((sum, d) => sum + d.value, 0),
      label: groupChartLabel(chunk, i, period),
    });
  }
  return grouped;
}

export function generateSalesChartFromOrders(
  orders: { createdAt: Date; total: unknown }[],
  period: string
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const days = getDaysForPeriod(period);

  const salesByDate = new Map<string, number>();
  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    salesByDate.set(dateKey, (salesByDate.get(dateKey) || 0) + Number(order.total));
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    data.push({ date: dateKey, value: salesByDate.get(dateKey) || 0, label: buildDateLabel(date) });
  }

  return period === "quarter" || period === "year" ? groupChartData(data, period) : data;
}

export function generateOrdersChartFromOrders(
  orders: { createdAt: Date }[],
  period: string
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const days = getDaysForPeriod(period);

  const ordersByDate = new Map<string, number>();
  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + 1);
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    data.push({ date: dateKey, value: ordersByDate.get(dateKey) || 0, label: buildDateLabel(date) });
  }

  return period === "quarter" || period === "year" ? groupChartData(data, period) : data;
}

