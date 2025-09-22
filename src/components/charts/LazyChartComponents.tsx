"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

// Fallback específico para ChartComponents
const _ChartComponentsFallback = () => (
  <div className="space-y-6">
    {/* Chart grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sales chart skeleton */}
      <div className="surface rounded-lg p-6 border border-muted">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Revenue chart skeleton */}
      <div className="surface rounded-lg p-6 border border-muted">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>

    {/* Full width chart skeleton */}
    <div className="surface rounded-lg p-6 border border-muted">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <Skeleton className="h-80 w-full" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="surface rounded-lg p-4 border border-muted">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Lazy component with proper typing
export const LazyChartComponents = React.lazy(() => import("./ChartComponents"));

export default LazyChartComponents;
