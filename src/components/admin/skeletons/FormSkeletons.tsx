"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const FormSkeleton = ({ fields = 6 }: { fields?: number }) => (
  <div className="surface rounded-xl border border-muted p-6">
    <Skeleton className="h-6 w-36 mb-6" />
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" rounded="md" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-muted">
      <Skeleton className="h-10 w-24" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>
  </div>
);

export const DetailViewSkeleton = () => (
  <div className="space-y-6">
    {/* Breadcrumb */}
    <Skeleton className="h-4 w-48" />

    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" rounded="md" />
        <Skeleton className="h-10 w-24" rounded="md" />
      </div>
    </div>

    {/* Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="surface rounded-xl border border-muted p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
