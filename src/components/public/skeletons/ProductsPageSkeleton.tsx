import { Skeleton } from "@/components/ui/Skeleton";

export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-350 mx-auto py-6 px-4 sm:px-6">
        <Skeleton className="h-4 w-48 mb-6" rounded="md" />
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-24" rounded="md" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" rounded="md" />
                  ))}
                </div>
              </div>
            ))}
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" rounded="md" />
              <Skeleton className="h-9 w-40" rounded="md" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-muted overflow-hidden"
                >
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" rounded="md" />
                    <Skeleton className="h-5 w-1/2" rounded="md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
