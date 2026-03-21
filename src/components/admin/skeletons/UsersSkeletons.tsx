"use client";

import { Skeleton } from "@/components/ui/Skeleton";

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
