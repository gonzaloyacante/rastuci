import type { ReactNode } from "react";

// ─── Color System ─────────────────────────────────────────────────────────────

export type AdminColor =
  | "blue"
  | "emerald"
  | "amber"
  | "purple"
  | "cyan"
  | "rose"
  | "indigo"
  | "green"
  | "orange"
  | "red";

export const gradientMap: Record<AdminColor, string> = {
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-amber-600",
  purple: "from-purple-500 to-purple-600",
  cyan: "from-cyan-500 to-cyan-600",
  rose: "from-rose-500 to-rose-600",
  indigo: "from-indigo-500 to-indigo-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
};

export const hoverGradientMap: Record<AdminColor, string> = {
  blue: "from-blue-500/10 to-purple-500/10",
  emerald: "from-emerald-500/10 to-green-500/10",
  amber: "from-amber-500/10 to-orange-500/10",
  purple: "from-purple-500/10 to-indigo-500/10",
  cyan: "from-cyan-500/10 to-blue-500/10",
  rose: "from-rose-500/10 to-pink-500/10",
  indigo: "from-indigo-500/10 to-purple-500/10",
  green: "from-green-500/10 to-emerald-500/10",
  orange: "from-orange-500/10 to-amber-500/10",
  red: "from-red-500/10 to-rose-500/10",
};

// ─── Unified StatCard ─────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  /** CSS class for the icon wrapper — used in simple variant */
  iconColor?: string;
  /** Percentage change badge (e.g. "+5.2%") — shown in rich variant */
  change?: string;
  /** When provided, renders the rich gradient variant */
  color?: AdminColor;
}

/**
 * Unified StatCard.
 * - Simple variant: no `color` prop — compact card for inventory/management views.
 * - Rich variant: `color` prop provided — animated gradient card for dashboard stats.
 */
export function StatCard({
  label,
  value,
  icon,
  iconColor,
  change,
  color,
}: StatCardProps) {
  if (color) {
    const isNegative = change?.startsWith("-");
    const badgeClass = isNegative ? "badge-error" : "badge-success";

    return (
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
        <div
          className={`absolute inset-0 bg-linear-to-br ${hoverGradientMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />
        <div className="relative p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br ${gradientMap[color]} flex items-center justify-center shrink-0`}
            >
              {icon}
            </div>
            {change && (
              <span className={`${badgeClass} text-xs sm:text-sm`}>
                {change}
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-medium muted mb-1">{label}</h3>
          <p className="text-xl sm:text-2xl font-bold text-primary">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface border border-muted rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={iconColor}>{icon}</div>
        <div>
          <p className="text-sm muted">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
