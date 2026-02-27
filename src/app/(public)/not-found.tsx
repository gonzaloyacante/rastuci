import { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import NotFoundClient from "./not-found-client";

export const metadata: Metadata = {
  title: "Página no encontrada (404) - Rastuci",
  description:
    "La página que buscas no existe. Explora nuestros productos y ofertas especiales.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen surface px-4">
          <Skeleton className="w-32 h-32 mb-8" />
          <Skeleton className="w-64 h-8 mb-4" />
          <Skeleton className="w-48 h-6" />
        </div>
      }
    >
      <NotFoundClient />
    </Suspense>
  );
}
