import { Skeleton } from "@/components/ui/Skeleton";

export function CheckoutPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-300 mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20 hidden sm:block" rounded="md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-muted p-6 space-y-4">
              <Skeleton className="h-6 w-40" rounded="md" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" rounded="md" />
                  <Skeleton className="h-10 w-full" rounded="md" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-muted p-6 space-y-4">
              <Skeleton className="h-6 w-36" rounded="md" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" rounded="md" />
                    <Skeleton className="h-4 w-1/2" rounded="md" />
                  </div>
                </div>
              ))}
              <div className="border-t border-muted pt-4 space-y-2">
                <Skeleton className="h-4 w-full" rounded="md" />
                <Skeleton className="h-5 w-2/3" rounded="md" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
