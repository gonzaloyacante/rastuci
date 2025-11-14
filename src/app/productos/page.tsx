import { Suspense } from "react";
import { Metadata } from "next";
import ProductsPageClient from "./client-page";

export const metadata: Metadata = {
  title: "Productos - Ropa Infantil de Calidad",
  description: "Explora nuestra colección completa de ropa infantil. Encuentra la ropa perfecta para tus pequeños con la mejor calidad y diseños únicos.",
  keywords: ["productos", "ropa infantil", "moda niños", "colección", "catálogo"],
  openGraph: {
    title: "Productos - Rastuci",
    description: "Explora nuestra colección completa de ropa infantil de calidad",
    type: "website",
  },
};

interface SearchParams {
  categoria?: string;
  buscar?: string;
  pagina?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ProductsPageProps {
  searchParams: SearchParams;
}

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 surface-secondary rounded animate-pulse w-48 mb-4" />
          <div className="h-4 surface-secondary rounded animate-pulse w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map(() => (
            <div key={`product-skeleton-${Math.random()}`} className="surface rounded-lg shadow-sm border border-muted overflow-hidden">
              <div className="aspect-square surface-secondary animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 surface-secondary rounded animate-pulse" />
                <div className="h-3 surface-secondary rounded animate-pulse w-2/3" />
                <div className="flex justify-between items-center">
                  <div className="h-5 surface-secondary rounded animate-pulse w-16" />
                  <div className="h-4 surface-secondary rounded animate-pulse w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageClient searchParams={searchParams} />
    </Suspense>
  );
}
