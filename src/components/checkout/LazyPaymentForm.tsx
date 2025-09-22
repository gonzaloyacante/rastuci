"use client";

import { createLazyComponentFromNamed } from "@/components/ui/LazyWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Fallback específico para PaymentForm
const PaymentFormFallback = () => (
  <div className="space-y-6">
    {/* Payment methods skeleton */}
    <div className="surface rounded-lg p-6 border border-muted">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-3 border border-muted rounded-lg"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex items-center space-x-3 flex-1">
              <Skeleton className="h-8 w-8" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>

    {/* Payment form skeleton */}
    <div className="surface rounded-lg p-6 border border-muted">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Security info */}
      <div className="mt-4 p-3 surface border border-info rounded">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>
    </div>

    {/* Action buttons skeleton */}
    <div className="flex justify-between">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

// Lazy component
export const LazyPaymentForm = createLazyComponentFromNamed(
  () => import("./PaymentForm"),
  "PaymentForm",
  <PaymentFormFallback />,
);

export default LazyPaymentForm;
