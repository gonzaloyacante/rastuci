import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { generateProductMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { Suspense } from "react";
import ProductDetailClient from "./client-page";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata para SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Consultar directamente a Prisma en lugar de fetch (mejor para build time)
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return {
        title: "Producto no encontrado - Rastuci",
        description: "El producto que buscas no está disponible.",
      };
    }
    const images = Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
        ? JSON.parse(product.images)
        : [];

    return generateProductMetadata({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images,
        category: product.category?.name || "General",
        inStock: product.stock > 0,
      },
    });
  } catch (error) {
    logger.error("Error generating product metadata:", { error });
    return {
      title: "Error al cargar producto - Rastuci",
      description: "Error al cargar la información del producto.",
    };
  }
}

const ProductDetailSkeleton = () => (
  <div className="min-h-screen surface">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm muted">
          <li>Inicio</li>
          <li>/</li>
          <li>Productos</li>
          <li>/</li>
          <li className="h-4 surface rounded animate-pulse w-32" />
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square surface rounded-lg animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map(() => (
              <div
                key={`thumbnail-${Math.random()}`}
                className="aspect-square surface rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-8 surface rounded animate-pulse w-3/4" />
          <div className="h-6 surface rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            <div className="h-4 surface rounded animate-pulse w-full" />
            <div className="h-4 surface rounded animate-pulse w-5/6" />
            <div className="h-4 surface rounded animate-pulse w-4/6" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map(() => (
              <div
                key={`action-button-${Math.random()}`}
                className="h-12 surface rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailClient productId={id} />
    </Suspense>
  );
}
