import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 surface-secondary rounded animate-pulse w-96 mx-auto mb-4" />
          <div className="h-6 surface-secondary rounded animate-pulse w-full max-w-2xl mx-auto" />
        </div>

        {/* Info Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="surface p-6 rounded-xl border border-muted flex flex-col items-center text-center space-y-4"
            >
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Map/Info Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
