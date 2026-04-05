import { Skeleton } from "@/components/ui/Skeleton";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen surface">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <Skeleton className="w-full h-[60vh] min-h-96" rounded="none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
          <Skeleton className="h-12 w-3/4 max-w-lg" />
          <Skeleton className="h-6 w-2/4 max-w-sm" />
          <Skeleton className="h-12 w-40 mt-4" rounded="md" />
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Categories grid */}
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-3/4 mx-auto mt-2 mb-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured products */}
        <div>
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-muted overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="surface rounded-xl border border-muted p-6 text-center space-y-3">
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
