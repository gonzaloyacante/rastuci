import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { ProductGridSkeleton } from "@/components/products/ProductListComponents";
import { Skeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";
import ProductsPageClient from "./client-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { categoria, buscar } = await searchParams; // Await searchParams as in Next.js 15+ it might be a promise or just to be safe

  let title = "Productos - Ropa Infantil de Calidad";
  let description =
    "Explora nuestra colección completa de ropa infantil. Encuentra la ropa perfecta para tus pequeños con la mejor calidad y diseños únicos.";

  if (categoria) {
    // Try to fetch category name
    try {
      // Find category by ID or name (assuming slug is id here based on previous context, but let's check.
      // The search param is 'categoria=ID'.
      const category = await prisma.categories.findUnique({
        where: { id: categoria },
        select: { name: true },
      });
      if (category) {
        title = `${category.name} - Rastuci`;
        description = `Compra ${category.name} para niños en Rastuci. Calidad y diseño para tus hijos.`;
      }
    } catch {
      // Fallback
    }
  } else if (buscar) {
    title = `Resultados para "${buscar}" - Rastuci`;
    description = `Resultados de búsqueda para ${buscar} en Rastuci.`;
  }

  return {
    title,
    description,
    keywords: [
      "productos",
      "ropa infantil",
      "moda niños",
      categoria ? "ropa " + categoria : "colección",
      "catálogo",
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

interface SearchParams {
  categoria?: string;
  buscar?: string;
  pagina?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageClient searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
