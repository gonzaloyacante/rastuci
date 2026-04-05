"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const ReviewCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-6 w-20" rounded="full" />
    </div>

    {/* Stars */}
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-4" rounded="sm" />
      ))}
    </div>

    {/* Comment */}
    <div className="space-y-1">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>

    {/* Product */}
    <div className="flex items-center gap-2 pt-1">
      <Skeleton className="h-8 w-8" rounded="sm" />
      <Skeleton className="h-3 w-36" />
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Skeleton className="h-7 w-20" rounded="md" />
      <Skeleton className="h-7 w-20" rounded="md" />
    </div>
  </div>
);

export const ReviewsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" rounded="md" />
        <Skeleton className="h-9 w-28" rounded="md" />
      </div>
    </div>

    {/* Stats bar */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="surface rounded-xl border border-muted p-3 space-y-1"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>

    {/* Filters */}
    <div className="flex gap-2 flex-wrap">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-24" rounded="full" />
      ))}
    </div>

    {/* Review cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <ReviewCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
