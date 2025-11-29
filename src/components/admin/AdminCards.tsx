import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// ============================================================================
// Color System
// ============================================================================

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

const gradientMap: Record<AdminColor, string> = {
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

const hoverGradientMap: Record<AdminColor, string> = {
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

// ============================================================================
// Stat Card
// ============================================================================

export interface StatCardData {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color: AdminColor;
}

export function StatCard({ stat }: { stat: StatCardData }) {
  const Icon = stat.icon;
  const isNegative = stat.change?.startsWith("-");
  const badgeClass = isNegative ? "badge-error" : "badge-success";

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border muted hover:shadow-lg transition-all duration-300 group">
      <div
        className={`absolute inset-0 bg-linear-to-br ${hoverGradientMap[stat.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-linear-to-br ${gradientMap[stat.color]} flex items-center justify-center shrink-0`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          {stat.change && (
            <span className={`${badgeClass} text-xs sm:text-sm`}>
              {stat.change}
            </span>
          )}
        </div>
        <h3 className="text-xs sm:text-sm font-medium muted mb-1">
          {stat.label}
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-primary">
          {stat.value}
        </p>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: StatCardData[];
  columns?: 2 | 3 | 4;
}

const gridColsMap = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <div className={`grid ${gridColsMap[columns]} gap-3 sm:gap-4 lg:gap-6`}>
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}

// ============================================================================
// Section Header
// ============================================================================

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: AdminColor;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "blue",
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary">{title}</h2>
        {subtitle && (
          <p className="text-xs sm:text-sm muted mt-1">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div
          className={`h-10 w-10 rounded-full bg-linear-to-br ${gradientMap[iconColor]} flex items-center justify-center shrink-0`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
      {action}
    </div>
  );
}

// ============================================================================
// Page Header
// ============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base text-muted">{subtitle}</p>
      )}
    </div>
  );
}

// ============================================================================
// Admin Card (base card with hover effects)
// ============================================================================

export interface AdminCardProps {
  children: ReactNode;
  className?: string;
  hoverGradient?: AdminColor;
  noPadding?: boolean;
}

export function AdminCard({
  children,
  className = "",
  hoverGradient,
  noPadding = false,
}: AdminCardProps) {
  return (
    <div
      className={`relative overflow-hidden surface rounded-xl sm:rounded-2xl shadow-sm border muted ${!noPadding ? "p-4 sm:p-6" : ""} ${hoverGradient ? "group hover:shadow-lg transition-all duration-300" : ""} ${className}`}
    >
      {hoverGradient && (
        <div
          className={`absolute inset-0 bg-linear-to-br ${hoverGradientMap[hoverGradient]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />
      )}
      <div className={hoverGradient ? "relative" : ""}>{children}</div>
    </div>
  );
}

// ============================================================================
// Admin Section (card with header)
// ============================================================================

export interface AdminSectionProps extends SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

export function AdminSection({
  children,
  className = "",
  ...headerProps
}: AdminSectionProps) {
  return (
    <AdminCard className={className}>
      <SectionHeader {...headerProps} />
      {children}
    </AdminCard>
  );
}
