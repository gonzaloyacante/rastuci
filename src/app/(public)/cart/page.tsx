import { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import CartPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Carrito de Compras - Rastuci",
  description:
    "Revisa y gestiona los productos en tu carrito de compras. Procede al checkout cuando estés listo.",
  keywords: "carrito, compras, checkout, productos, pago",
  openGraph: {
    title: "Carrito de Compras - Rastuci",
    description: "Gestiona tu carrito de compras y procede al checkout.",
    type: "website",
  },
  alternates: {
    canonical: "/carrito",
  },
};

const CartPageSkeleton = () => (
  <div className="surface text-primary min-h-screen flex flex-col">
    <main className="grow max-w-[1200px] mx-auto py-8 px-6 w-full">
      {/* Header Skeleton */}
      <Skeleton className="h-10 w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`cart-skeleton-${i}`}
              className="flex items-center surface p-4 rounded-lg shadow-sm border border-muted"
            >
              <Skeleton className="w-24 h-24 mr-4 shrink-0" />
              <div className="grow">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="w-24 h-10 mr-6 shrink-0" />
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
            </div>
          ))}
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="surface p-6 rounded-lg shadow-sm border border-muted">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="border-t border-muted my-4"></div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageClient />
    </Suspense>
  );
}
