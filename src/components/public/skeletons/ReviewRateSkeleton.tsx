import { Skeleton } from "@/components/ui/Skeleton";

export function ReviewRateSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-lg mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Product info */}
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        {/* Stars */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-md" />
            ))}
          </div>
        </div>
        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" rounded="md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-32 w-full" rounded="md" />
          </div>
          <Skeleton className="h-12 w-full" rounded="md" />
        </div>
      </main>
    </div>
  );
}
