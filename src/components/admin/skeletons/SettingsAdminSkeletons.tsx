"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const SettingsAdminSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <Skeleton className="h-8 w-36 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Tab bar (horizontal, many tabs) */}
    <div className="flex gap-1 overflow-x-auto border-b border-muted pb-0">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 shrink-0" rounded="md" />
      ))}
    </div>

    {/* Form sections */}
    <div className="surface rounded-xl border border-muted p-6 space-y-6">
      {/* Section title */}
      <Skeleton className="h-6 w-40" />

      {/* 2-column fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" rounded="md" />
          </div>
        ))}
      </div>

      {/* Full-width field */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-24 w-full" rounded="md" />
      </div>

      {/* Another section */}
      <Skeleton className="h-6 w-32 mt-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" rounded="md" />
          </div>
        ))}
      </div>

      {/* Toggle rows */}
      <div className="space-y-3 pt-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-6 w-11" rounded="full" />
          </div>
        ))}
      </div>
    </div>

    {/* Save button */}
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-24" rounded="md" />
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>
  </div>
);
