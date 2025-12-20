import { Metadata } from "next";
import { Suspense } from "react";
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
        <div className="h-8 surface-secondary rounded animate-pulse w-48 mb-2" />
        <div className="h-4 surface-secondary rounded animate-pulse w-64" />
      </div>
      <div className="h-10 surface-secondary rounded animate-pulse w-32" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={`favorites-skeleton-${i}`}
          className="surface rounded-lg border border-muted overflow-hidden"
        >
          <div className="aspect-square surface-secondary animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-6 surface-secondary rounded animate-pulse w-full" />
            <div className="h-8 surface-secondary rounded animate-pulse w-20" />
            <div className="flex gap-2">
              <div className="h-10 surface-secondary rounded animate-pulse flex-1" />
              <div className="h-10 w-10 surface-secondary rounded animate-pulse" />
            </div>
          </div>
        </div>
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
