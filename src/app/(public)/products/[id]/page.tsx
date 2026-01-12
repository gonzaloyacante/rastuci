import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { logger } from "@/lib/logger";
import { generateProductJsonLd } from "@/lib/metadata";
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
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: true,
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
        price: Number(product.price),
        images,
        category: product.categories?.name || "General",
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
    const products = await prisma.products.findMany({
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
  const product = await prisma.products.findUnique({
    where: { id },
    include: {
      categories: true,
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
        category: product.categories
          ? {
              ...product.categories,
              createdAt: product.categories.createdAt.toISOString(),
              updatedAt: product.categories.updatedAt.toISOString(),
            }
          : undefined,
      }
    : null;

  // Generate JSON-LD structured data
  const jsonLd = serializedProduct
    ? generateProductJsonLd({
        id: serializedProduct.id,
        name: serializedProduct.name,
        description: serializedProduct.description || "",
        image: Array.isArray(serializedProduct.images)
          ? serializedProduct.images[0]
          : "",
        price: serializedProduct.price,
        currency: "ARS",
        availability: serializedProduct.stock > 0 ? "instock" : "outofstock",
        brand: "Rastuci",
      })
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient
          productId={id}
          initialProduct={serializedProduct}
        />
      </Suspense>
    </>
  );
}
