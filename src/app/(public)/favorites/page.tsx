import { Metadata } from "next";
import { Suspense } from "react";

import { FavoritesPageSkeleton } from "@/components/public/skeletons";

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

export default function FavoritosPage() {
  return (
    <Suspense fallback={<FavoritesPageSkeleton />}>
      <FavoritosPageClient />
    </Suspense>
  );
}
