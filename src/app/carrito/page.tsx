import { Metadata } from 'next';
import { Suspense } from 'react';
import CartPageClient from './client-page';

export const metadata: Metadata = {
  title: 'Carrito de Compras - Rastuci',
  description: 'Revisa y gestiona los productos en tu carrito de compras. Procede al checkout cuando estés listo.',
  keywords: 'carrito, compras, checkout, productos, pago, envío gratis',
  openGraph: {
    title: 'Carrito de Compras - Rastuci',
    description: 'Gestiona tu carrito de compras y procede al checkout.',
    type: 'website',
  },
  alternates: {
    canonical: '/carrito',
  },
};

const CartPageSkeleton = () => (
  <div className="surface text-primary min-h-screen flex flex-col">
    <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
      {/* Header Skeleton */}
      <div className="h-10 surface-secondary rounded animate-pulse w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={`cart-skeleton-${i}`} className="flex items-center surface p-4 rounded-lg shadow-sm border border-muted">
              <div className="w-24 h-24 surface-secondary rounded animate-pulse mr-4" />
              <div className="flex-grow">
                <div className="h-6 surface-secondary rounded animate-pulse w-48 mb-2" />
                <div className="h-4 surface-secondary rounded animate-pulse w-32 mb-1" />
                <div className="h-4 surface-secondary rounded animate-pulse w-24 mb-2" />
                <div className="h-6 surface-secondary rounded animate-pulse w-20" />
              </div>
              <div className="w-24 h-10 surface-secondary rounded animate-pulse mr-6" />
              <div className="w-5 h-5 surface-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="surface p-6 rounded-lg shadow-sm border border-muted">
            <div className="h-8 surface-secondary rounded animate-pulse w-48 mb-6" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 surface-secondary rounded animate-pulse w-16" />
                <div className="h-4 surface-secondary rounded animate-pulse w-20" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 surface-secondary rounded animate-pulse w-12" />
                <div className="h-4 surface-secondary rounded animate-pulse w-16" />
              </div>
              <div className="border-t border-muted my-4"></div>
              <div className="flex justify-between">
                <div className="h-6 surface-secondary rounded animate-pulse w-12" />
                <div className="h-6 surface-secondary rounded animate-pulse w-20" />
              </div>
            </div>
            <div className="h-12 surface-secondary rounded animate-pulse w-full mt-6" />
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
