import type { MetricData } from "./types";

export function calculateMetric(
  current: number,
  previous: number,
  label: string
): MetricData {
  const change = current - previous;
  const changePercent =
    previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

  return {
    label,
    value: current,
    previousValue: previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
  };
}
