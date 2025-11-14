import { Suspense } from "react";
import { Metadata } from "next";
import NotFoundClient from "./not-found-client";

export const metadata: Metadata = {
  title: "Página no encontrada (404) - Rastuci",
  description: "La página que buscas no existe. Explora nuestros productos y ofertas especiales.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen surface px-4">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-surface-secondary rounded mb-8"></div>
          <div className="w-64 h-8 bg-surface-secondary rounded mb-4"></div>
          <div className="w-48 h-6 bg-surface-secondary rounded"></div>
        </div>
      </div>
    }>
      <NotFoundClient />
    </Suspense>
  );
}
