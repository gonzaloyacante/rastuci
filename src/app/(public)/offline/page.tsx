import { Metadata } from 'next';
import { Suspense } from 'react';
import OfflinePageClient from './client-page';

export const metadata: Metadata = {
  title: 'Sin Conexión - Rastuci',
  description: 'Página mostrada cuando no hay conexión a internet. Funcionalidad offline disponible.',
  robots: 'noindex, nofollow',
};

const OfflinePageSkeleton = () => (
  <div className="min-h-screen surface flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-24 h-24 surface-secondary rounded-full mx-auto animate-pulse" />
      <div className="space-y-3">
        <div className="h-8 surface-secondary rounded animate-pulse" />
        <div className="h-4 surface-secondary rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-32 surface-secondary rounded animate-pulse" />
        <div className="h-32 surface-secondary rounded animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-10 surface-secondary rounded animate-pulse" />
        <div className="flex-1 h-10 surface-secondary rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default function OfflinePage() {
  return (
    <Suspense fallback={<OfflinePageSkeleton />}>
      <OfflinePageClient />
    </Suspense>
  );
}
