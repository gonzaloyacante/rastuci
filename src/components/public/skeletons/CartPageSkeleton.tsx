import { Skeleton } from "@/components/ui/Skeleton";

export function CartPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-300 mx-auto py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" rounded="md" />
          <Skeleton className="h-10 w-36" rounded="md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-muted">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" rounded="md" />
                  <Skeleton className="h-4 w-1/3" rounded="md" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" rounded="md" />
                    <Skeleton className="h-5 w-20 ml-auto" rounded="md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-muted p-6 h-fit space-y-4">
            <Skeleton className="h-6 w-36" rounded="md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" rounded="md" />
              <Skeleton className="h-4 w-full" rounded="md" />
              <Skeleton className="h-4 w-2/3" rounded="md" />
            </div>
            <Skeleton className="h-12 w-full" rounded="md" />
          </div>
        </div>
      </main>
    </div>
  );
}
