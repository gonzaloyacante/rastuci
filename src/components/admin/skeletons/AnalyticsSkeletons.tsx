"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const KPICardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4 space-y-2">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8" rounded="lg" />
    </div>
    <Skeleton className="h-8 w-28" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" rounded="md" />
        ))}
        <Skeleton className="h-9 w-28" rounded="md" />
      </div>
    </div>

    {/* KPI Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>

    {/* Revenue Chart */}
    <div className="surface rounded-xl border border-muted p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-28" rounded="md" />
      </div>
      <Skeleton className="h-64 w-full" rounded="md" />
    </div>

    {/* Bottom row: top lists + devices */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top products / categories */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="surface rounded-xl border border-muted p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" rounded="full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Devices */}
      <div className="surface rounded-xl border border-muted p-4">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="flex justify-center mb-4">
          <Skeleton className="h-36 w-36" rounded="full" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3" rounded="full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
