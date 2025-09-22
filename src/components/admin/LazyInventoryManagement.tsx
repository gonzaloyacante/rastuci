"use client";

import { createLazyComponentFromNamed } from "@/components/ui/LazyWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Fallback específico para InventoryManagement
const InventoryFallback = () => (
  <div className="space-y-6 p-6">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="surface rounded-lg p-4 border border-muted">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>

    {/* Table skeleton */}
    <div className="surface rounded-lg border border-muted">
      <div className="p-4 border-b border-muted">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Lazy component
export const LazyInventoryManagement = createLazyComponentFromNamed(
  () => import("./InventoryManagement"),
  "InventoryManagement",
  <InventoryFallback />,
);

export default LazyInventoryManagement;
