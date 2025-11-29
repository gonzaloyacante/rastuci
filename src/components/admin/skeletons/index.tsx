"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

// ============================================
// DASHBOARD SKELETONS
// ============================================

export const DashboardStatCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl surface shadow-sm border border-muted">
    <div className="relative p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-2">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12" rounded="lg" />
        <Skeleton className="h-5 w-14" rounded="full" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const DashboardQuickActionSkeleton = () => (
  <div className="surface rounded-xl p-4 border border-muted flex items-center gap-3">
    <Skeleton className="w-10 h-10" rounded="lg" />
    <div className="flex-1">
      <Skeleton className="h-4 w-28 mb-2" />
      <Skeleton className="h-3 w-36" />
    </div>
  </div>
);

export const DashboardChartSkeleton = () => {
  // Static heights for chart bars to avoid runtime randomness
  const barHeights = [
    "h-16",
    "h-32",
    "h-24",
    "h-40",
    "h-20",
    "h-48",
    "h-28",
    "h-36",
    "h-12",
    "h-44",
    "h-20",
    "h-32",
  ];

  return (
    <div className="surface rounded-xl sm:rounded-2xl shadow-sm border border-muted p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-10" rounded="full" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2 pt-8">
        {barHeights.map((height, i) => (
          <Skeleton key={i} className={`flex-1 ${height}`} rounded="sm" />
        ))}
      </div>
    </div>
  );
};

export const DashboardPieChartSkeleton = () => (
  <div className="surface rounded-xl sm:rounded-2xl shadow-sm border border-muted p-4 sm:p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton className="h-5 w-44 mb-2" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="h-10 w-10" rounded="full" />
    </div>
    <div className="flex items-center justify-center py-8">
      <Skeleton className="h-48 w-48" rounded="full" />
    </div>
    <div className="flex justify-center gap-4 mt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" rounded="full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen surface p-3 sm:p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <DashboardStatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="surface rounded-xl sm:rounded-2xl shadow-sm border border-muted p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-10" rounded="full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <DashboardQuickActionSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardChartSkeleton />
        <DashboardPieChartSkeleton />
      </div>
    </div>
  </div>
);

// ============================================
// TABLE SKELETONS
// ============================================

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export const TableSkeleton = ({
  columns = 5,
  rows = 8,
  showHeader = true,
  showActions = true,
}: TableSkeletonProps) => (
  <div className="surface rounded-xl border border-muted overflow-hidden">
    {showHeader && (
      <div className="flex items-center justify-between p-4 border-b border-muted">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" rounded="md" />
          <Skeleton className="h-9 w-32" rounded="md" />
        </div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted">
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
            {showActions && (
              <th className="px-4 py-3 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-muted last:border-0">
              {[...Array(columns)].map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn("h-4", colIdx === 0 ? "w-32" : "w-20")}
                  />
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8" rounded="md" />
                    <Skeleton className="h-8 w-8" rounded="md" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Pagination */}
    <div className="flex items-center justify-between p-4 border-t border-muted">
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);

// ============================================
// METRICS SKELETONS
// ============================================

export const MetricCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <Skeleton className="h-4 w-24 mb-2" />
    <div className="flex items-end justify-between">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-6 w-14" rounded="full" />
    </div>
  </div>
);

export const MetricsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" rounded="md" />
        ))}
      </div>
    </div>

    {/* Main Metrics Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>

    {/* Secondary Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <div className="surface rounded-xl border border-muted p-4">
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Metrics */}
      <div className="surface rounded-xl border border-muted p-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>

    {/* Activity Feed */}
    <div className="surface rounded-xl border border-muted p-4">
      <Skeleton className="h-6 w-36 mb-4" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8" rounded="full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-64 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// LOGISTICS SKELETONS
// ============================================

export const LogisticsTabsSkeleton = () => (
  <div className="flex gap-2 mb-6">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-10 w-28" rounded="md" />
    ))}
  </div>
);

export const SupplierCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12" rounded="full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" rounded="full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-4 w-20" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);

export const LogisticsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-28 mb-2" />
      <Skeleton className="h-4 w-56" />
    </div>

    <LogisticsTabsSkeleton />

    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-32" rounded="md" />
      <Skeleton className="h-10 w-32" rounded="md" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <SupplierCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// SUPPORT SKELETONS
// ============================================

export const TicketCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" rounded="full" />
        <Skeleton className="h-6 w-14" rounded="full" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-20" rounded="md" />
    </div>
  </div>
);

export const SupportSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    <LogisticsTabsSkeleton />

    <div className="flex flex-wrap items-center gap-4 mb-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// FORM SKELETONS
// ============================================

export const FormSkeleton = ({ fields = 6 }: { fields?: number }) => (
  <div className="surface rounded-xl border border-muted p-6">
    <Skeleton className="h-6 w-36 mb-6" />
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" rounded="md" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-muted">
      <Skeleton className="h-10 w-24" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>
  </div>
);

// ============================================
// DETAIL VIEW SKELETONS
// ============================================

export const DetailViewSkeleton = () => (
  <div className="space-y-6">
    {/* Breadcrumb */}
    <Skeleton className="h-4 w-48" />

    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" rounded="md" />
        <Skeleton className="h-10 w-24" rounded="md" />
      </div>
    </div>

    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// ORDERS SKELETONS
// ============================================

export const OrderCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="h-6 w-20" rounded="full" />
    </div>
    <div className="flex items-center gap-4 mb-3">
      <Skeleton className="h-16 w-16" rounded="md" />
      <div className="flex-1">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-muted">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-8 w-24" rounded="md" />
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-10 w-32" rounded="md" />
    </div>

    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// PRODUCTS ADMIN SKELETONS
// ============================================

export const ProductAdminCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted overflow-hidden">
    <Skeleton className="aspect-video w-full" rounded="none" />
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-muted">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" rounded="md" />
          <Skeleton className="h-8 w-8" rounded="md" />
        </div>
      </div>
    </div>
  </div>
);

export const ProductsAdminSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36" rounded="md" />
    </div>

    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <ProductAdminCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// USERS SKELETONS
// ============================================

export const UserCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12" rounded="full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-6 w-16" rounded="full" />
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-3 w-28" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);

export const UsersSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32" rounded="md" />
    </div>

    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// CATEGORIES SKELETONS
// ============================================

export const CategoryAdminCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16" rounded="lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mt-3" />
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);

export const CategoriesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36" rounded="md" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <CategoryAdminCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ============================================
// TRACKING SKELETONS
// ============================================

export const TrackingCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-20" rounded="full" />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-24" rounded="md" />
    </div>
  </div>
);

export const TrackingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28" rounded="md" />
        <Skeleton className="h-10 w-28" rounded="md" />
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <TrackingCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
