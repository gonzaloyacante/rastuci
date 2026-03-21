"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const CategoryAdminCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16" rounded="lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mt-3" />
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" rounded="md" />
        <Skeleton className="h-8 w-8" rounded="md" />
      </div>
    </div>
  </div>
);

export const CategoriesSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36" rounded="md" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <CategoryAdminCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
