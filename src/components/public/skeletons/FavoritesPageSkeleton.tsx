import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export function FavoritesPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <main className="max-w-350 mx-auto py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={`favorites-skeleton-${i}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
