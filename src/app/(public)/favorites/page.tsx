import { Metadata } from "next";
import { Suspense } from "react";

import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

import FavoritosPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Mis Favoritos - Rastuci",
  description:
    "Gestiona tu lista de productos favoritos. Guarda los productos que más te gusten para comprarlos más tarde.",
  keywords: "favoritos, wishlist, productos guardados, lista de deseos",
  openGraph: {
    title: "Mis Favoritos - Rastuci",
    description: "Gestiona tu lista de productos favoritos",
    type: "website",
  },
};

const FavoritosPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={`favorites-skeleton-${i}`} />
      ))}
    </div>
  </div>
);

export default function FavoritosPage() {
  return (
    <Suspense fallback={<FavoritosPageSkeleton />}>
      <FavoritosPageClient />
    </Suspense>
  );
}
