import { Skeleton } from "@/components/ui/Skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-350 mx-auto py-6 px-4 sm:px-6">
        {/* Breadcrumb */}
        <Skeleton className="h-4 w-64 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-36" />

            {/* Variant selectors */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-9 rounded-full" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-12" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-14" rounded="md" />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" rounded="md" />
              <Skeleton className="h-12 w-12" rounded="md" />
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="surface-secondary rounded-lg p-3 text-center space-y-1">
                  <Skeleton className="h-5 w-5 mx-auto" rounded="full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
