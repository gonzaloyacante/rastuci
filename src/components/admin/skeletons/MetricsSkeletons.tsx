"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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
