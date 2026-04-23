import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export function SharedWishlistSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={`wishlist-skeleton-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
