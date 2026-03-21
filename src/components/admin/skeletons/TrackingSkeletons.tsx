"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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
