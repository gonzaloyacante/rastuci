/**
 * Chart theme utilities for Chart.js
 *
 * Provides computed CSS variable values for Chart.js configurations
 * to ensure charts respect the current theme (light/dark mode).
 */

export interface ChartThemeColors {
  text: string;
  textTitle: string;
  textBody: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
}

/**
 * Get computed chart theme colors from CSS variables.
 * Must be called on client-side after component mount.
 */
export function getChartThemeColors(): ChartThemeColors {
  if (typeof window === "undefined") {
    // SSR fallback - light mode defaults
    return {
      text: "rgb(107, 114, 128)",
      textTitle: "rgb(17, 24, 39)",
      textBody: "rgb(75, 85, 99)",
      grid: "rgba(209, 213, 219, 0.3)",
      tooltipBg: "rgba(255, 255, 255, 0.95)",
      tooltipBorder: "rgb(209, 213, 219)",
    };
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    text:
      styles.getPropertyValue("--chart-text").trim() || "rgb(107, 114, 128)",
    textTitle:
      styles.getPropertyValue("--chart-text-title").trim() || "rgb(17, 24, 39)",
    textBody:
      styles.getPropertyValue("--chart-text-body").trim() || "rgb(75, 85, 99)",
    grid:
      styles.getPropertyValue("--chart-grid").trim() ||
      "rgba(209, 213, 219, 0.3)",
    tooltipBg:
      styles.getPropertyValue("--chart-tooltip-bg").trim() ||
      "rgba(255, 255, 255, 0.95)",
    tooltipBorder:
      styles.getPropertyValue("--chart-tooltip-border").trim() ||
      "rgb(209, 213, 219)",
  };
}

/**
 * Generate base chart options with theme-aware colors.
 * Use in useMemo with theme dependency.
 */
export function getThemedChartOptions(colors: ChartThemeColors) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: colors.text,
          font: { size: 12, weight: 500 as const },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.textTitle,
        bodyColor: colors.textBody,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: colors.grid },
        ticks: { color: colors.text, font: { size: 11 } },
      },
      y: {
        grid: { color: colors.grid },
        ticks: { color: colors.text, font: { size: 11 } },
      },
    },
  };
}
