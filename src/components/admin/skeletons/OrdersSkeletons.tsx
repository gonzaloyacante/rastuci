"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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

export const PendingOrdersSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" rounded="md" />
        <Skeleton className="h-9 w-28" rounded="md" />
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-24" rounded="full" />
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
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
