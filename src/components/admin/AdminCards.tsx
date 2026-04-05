import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import type { AdminColor } from "./StatCard";
import { gradientMap, hoverGradientMap, StatCard } from "./StatCard";

export type { AdminColor } from "./StatCard";
export { StatCard } from "./StatCard";

// ============================================================================
// Stat Card (forwarded to unified StatCard)
// ============================================================================

export interface StatCardData {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color: AdminColor;
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
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={<Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            change={stat.change}
            color={stat.color}
          />
        );
      })}
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
