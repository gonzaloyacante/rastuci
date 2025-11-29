import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
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
        description: product.description || undefined,
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

// Generar params estáticos para los productos más recientes/populares (SSG)
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      take: 20, // Pre-renderizar los 20 primeros productos
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    logger.error("Error generating static params:", { error });
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch product data on server to pass to client (avoid double fetch)
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  // Transform to match the Product interface expected by client
  // Serializing dates to strings because Client Components cannot receive Date objects
  const serializedProduct = product
    ? {
        ...product,
        price: Number(product.price),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        category: product.category
          ? {
              ...product.category,
              createdAt: product.category.createdAt.toISOString(),
              updatedAt: product.category.updatedAt.toISOString(),
            }
          : undefined,
      }
    : null;

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailClient productId={id} initialProduct={serializedProduct} />
    </Suspense>
  );
}
