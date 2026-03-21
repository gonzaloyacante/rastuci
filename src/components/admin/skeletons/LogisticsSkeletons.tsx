"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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
