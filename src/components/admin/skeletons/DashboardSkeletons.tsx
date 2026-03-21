"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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
