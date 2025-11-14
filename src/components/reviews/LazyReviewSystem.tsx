"use client";

import { createLazyComponentFromNamed } from "@/components/ui/LazyWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Fallback específico para ReviewSystem
const ReviewSystemFallback = () => (
  <div className="space-y-6">
    {/* Rating overview skeleton */}
    <div className="surface rounded-lg p-6 border border-muted">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall rating */}
        <div className="text-center">
          <Skeleton className="h-12 w-16 mx-auto mb-2" />
          <div className="flex justify-center mb-2 space-x-1">
            {[...Array(5)].map(() => (
              <Skeleton key={`star-skeleton-${Math.random()}`} className="h-6 w-6" />
            ))}
          </div>
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Rating distribution */}
        <div className="space-y-2">
          {[...Array(5)].map(() => (
            <div key={`rating-bar-${Math.random()}`} className="flex items-center gap-3">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="flex-1 h-2 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Write review form skeleton */}
    <div className="surface rounded-lg p-6 border border-muted">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-4">
        <div className="flex space-x-2">
          {[...Array(5)].map(() => (
            <Skeleton key={`form-star-${Math.random()}`} className="h-8 w-8" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Reviews list skeleton */}
    <div className="space-y-4">
      {[...Array(3)].map(() => (
        <div key={`review-skeleton-${Math.random()}`} className="surface rounded-lg p-6 border border-muted">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex space-x-1">
              {[...Array(5)].map(() => (
                <Skeleton key={`review-star-${Math.random()}`} className="h-4 w-4" />
              ))}
            </div>
          </div>
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Lazy component
export const LazyReviewSystem = createLazyComponentFromNamed(
  () => import("./ReviewSystem"),
  "ReviewSystem",
  <ReviewSystemFallback />,
);

export default LazyReviewSystem;
