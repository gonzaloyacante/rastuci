import { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/Skeleton";

import OfflinePageClient from "./client-page";

export const metadata: Metadata = {
  title: "Sin Conexión - Rastuci",
  description:
    "Página mostrada cuando no hay conexión a internet. Funcionalidad offline disponible.",
  robots: "noindex, nofollow",
};

const OfflinePageSkeleton = () => (
  <div className="min-h-screen surface flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center space-y-6">
      <Skeleton className="w-24 h-24 mx-auto" rounded="full" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" rounded="md" />
        <Skeleton className="h-4 w-full" rounded="md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" rounded="md" />
        <Skeleton className="h-32 w-full" rounded="md" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-10" rounded="md" />
        <Skeleton className="flex-1 h-10" rounded="md" />
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
