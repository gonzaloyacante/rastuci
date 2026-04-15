"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export const LegalAdminSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>

    {/* Tabs */}
    <div className="flex gap-1 border-b border-muted">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-36" rounded="md" />
      ))}
    </div>

    {/* Editor area */}
    <div className="surface rounded-xl border border-muted p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap border-b border-muted pb-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" rounded="md" />
        ))}
        <Skeleton className="h-8 w-1 mx-2" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" rounded="md" />
        ))}
      </div>

      {/* Title */}
      <Skeleton className="h-8 w-3/4" />

      {/* Paragraphs */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-5/6" />
      </div>

      <Skeleton className="h-6 w-48" />

      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>

    {/* Save button */}
    <div className="flex justify-end">
      <Skeleton className="h-10 w-28" rounded="md" />
    </div>
  </div>
);
