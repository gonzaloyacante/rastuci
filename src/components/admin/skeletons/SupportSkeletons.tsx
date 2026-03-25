"use client";

import { Skeleton } from "@/components/ui/Skeleton";

import { LogisticsTabsSkeleton } from "./LogisticsSkeletons";

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
