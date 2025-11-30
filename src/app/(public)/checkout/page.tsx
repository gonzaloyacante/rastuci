import { Metadata } from "next";
import { Suspense } from "react";
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
    canonical: "/checkout",
  },
  robots: {
    index: false, // No indexar página de checkout por privacidad
    follow: false,
  },
};

const CheckoutPageSkeleton = () => (
  <div className="surface text-primary min-h-screen flex flex-col">
    <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
      {/* Header Skeleton */}
      <div className="h-10 surface-secondary rounded animate-pulse w-48 mb-8" />

      {/* Stepper Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={`checkout-step-${Math.random()}`}
              className="flex items-center"
            >
              <div className="w-8 h-8 surface-secondary rounded-full animate-pulse" />
              {i < 4 && (
                <div className="w-16 h-0.5 surface-secondary animate-pulse mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="surface border border-muted rounded-lg p-6">
            <div className="h-8 surface-secondary rounded animate-pulse w-64 mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map(() => (
                <div key={`form-field-${Math.random()}`}>
                  <div className="h-4 surface-secondary rounded animate-pulse w-24 mb-2" />
                  <div className="h-12 surface-secondary rounded animate-pulse w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="surface border border-muted rounded-lg p-6 sticky top-24">
            <div className="h-6 surface-secondary rounded animate-pulse w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map(() => (
                <div
                  key={`order-line-${Math.random()}`}
                  className="flex justify-between"
                >
                  <div className="h-4 surface-secondary rounded animate-pulse w-20" />
                  <div className="h-4 surface-secondary rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
            <div className="h-12 surface-secondary rounded animate-pulse w-full mt-6" />
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
