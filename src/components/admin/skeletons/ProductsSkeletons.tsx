"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const ProductAdminCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted overflow-hidden">
    <Skeleton className="aspect-video w-full" rounded="none" />
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-muted">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" rounded="md" />
          <Skeleton className="h-8 w-8" rounded="md" />
        </div>
      </div>
    </div>
  </div>
);

export const ProductsAdminSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36" rounded="md" />
    </div>

    <div className="flex flex-wrap items-center gap-4">
      <Skeleton className="h-10 flex-1 max-w-sm" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <ProductAdminCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
