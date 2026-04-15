"use client";

import { Skeleton } from "@/components/ui/Skeleton";

const MessageCardSkeleton = () => (
  <div className="surface rounded-xl border border-muted p-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9" rounded="full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-16" rounded="full" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-7 w-20" rounded="md" />
      <Skeleton className="h-7 w-20" rounded="md" />
    </div>
  </div>
);

export const ContactAdminSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-52" />
      </div>
      <Skeleton className="h-9 w-32" rounded="md" />
    </div>

    {/* Tabs */}
    <div className="flex gap-1 border-b border-muted pb-0">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-32" rounded="md" />
      ))}
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="surface rounded-xl border border-muted p-3 space-y-1"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>

    {/* Filters */}
    <div className="flex gap-2">
      <Skeleton className="h-9 w-full max-w-xs" rounded="md" />
      <Skeleton className="h-9 w-32" rounded="md" />
    </div>

    {/* Messages list */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <MessageCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
