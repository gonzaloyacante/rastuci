import { Skeleton } from "@/components/ui/Skeleton";

export function TrackingPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-300 mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 max-w-full mx-auto" />
        </div>
        {/* Search bar */}
        <div className="flex gap-3 max-w-lg mx-auto">
          <Skeleton className="h-12 flex-1" rounded="md" />
          <Skeleton className="h-12 w-28" rounded="md" />
        </div>
        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface rounded-xl border border-muted p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        {/* Event timeline */}
        <div className="surface rounded-xl border border-muted p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
