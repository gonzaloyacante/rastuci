import { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import CheckoutPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Checkout - Finalizar Compra | Rastuci",
  description:
    "Finaliza tu compra de forma segura con MercadoPago. Pago 100% seguro.",
  keywords: "checkout, pago, mercadopago, compra segura, finalizar compra",
  openGraph: {
    title: "Checkout - Finalizar Compra | Rastuci",
    description: "Finaliza tu compra de forma segura con MercadoPago.",
    type: "website",
  },
  alternates: {
    canonical: "/finalizar-compra",
  },
  robots: {
    index: false, // No indexar página de checkout por privacidad
    follow: false,
  },
};

const CheckoutPageSkeleton = () => (
  <div className="surface text-primary min-h-screen flex flex-col">
    <main className="grow max-w-300 mx-auto py-8 px-6 w-full">
      {/* Header Skeleton */}
      <Skeleton className="h-10 w-48 mb-8" />

      {/* Stepper Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`checkout-step-${i}`} className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              {i < 4 && <Skeleton className="w-16 h-0.5 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="surface border border-muted rounded-lg p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={`form-field-${i}`}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="surface border border-muted rounded-lg p-6 sticky top-24">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={`order-line-${i}`} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutPageClient />
    </Suspense>
  );
}
