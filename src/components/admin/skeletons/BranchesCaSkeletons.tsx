"use client";

import { Skeleton } from "@/components/ui/Skeleton";

const BranchCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4 space-y-2">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-6 w-16" rounded="full" />
    </div>
    <div className="flex items-center gap-4 text-sm">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

export const BranchesCaSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" rounded="md" />
        <Skeleton className="h-9 w-32" rounded="md" />
      </div>
    </div>

    {/* Search + filters */}
    <div className="flex gap-2 flex-wrap">
      <Skeleton className="h-9 w-64" rounded="md" />
      <Skeleton className="h-9 w-36" rounded="md" />
      <Skeleton className="h-9 w-36" rounded="md" />
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="surface rounded-xl border border-muted p-3 space-y-1"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>

    {/* Branch list */}
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <BranchCardSkeleton key={i} />
      ))}
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" rounded="md" />
        ))}
      </div>
    </div>
  </div>
);

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-grid-${i}`}
          className="surface rounded-xl border border-muted overflow-hidden"
        >
          <Skeleton className="aspect-square w-full" rounded="none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
