import { Metadata } from "next";
import { cache, Suspense } from "react";

import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { safeJsonLd } from "@/lib/json-ld";
import { logger } from "@/lib/logger";
import { generateProductJsonLd } from "@/lib/metadata";
import prisma from "@/lib/prisma";
import { generateProductMetadata } from "@/lib/seo";

import ProductDetailClient from "./client-page";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Cache deduplicado: evita N+1 — generateMetadata y ProductPage comparten el mismo resultado
const getProduct = cache(async (id: string) => {
  return prisma.products.findUnique({
    where: { id, isActive: true },
    include: { categories: true, product_variants: true },
  });
});

// Generate metadata para SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Cache deduplicado — comparte resultado con ProductPage
    const product = await getProduct(id);

    if (!product) {
      return {
        title: "Producto no encontrado - Rastuci",
        description: "El producto que buscas no está disponible.",
      };
    }
    let images: string[] = [];
    try {
      images = Array.isArray(product.images)
        ? (product.images as string[])
        : typeof product.images === "string"
          ? (JSON.parse(product.images) as string[])
          : [];
    } catch {
      images = [];
    }

    return generateProductMetadata({
      product: {
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        price: Number(product.price),
        images,
        category: product.categories?.name || "General",
        inStock:
          product.product_variants && product.product_variants.length > 0
            ? product.product_variants.some((v) => v.stock > 0)
            : product.stock > 0,
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
      where: { isActive: true },
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

  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <p className="text-muted-foreground mt-2">
          Es posible que el producto ya no esté disponible.
        </p>
      </div>
    );
  }

  let parsedImages: string[] = [];
  try {
    parsedImages = Array.isArray(product.images)
      ? (product.images as string[])
      : typeof product.images === "string"
        ? (JSON.parse(product.images) as string[])
        : [];
  } catch {
    parsedImages = [];
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: parsedImages,
  };

  // Generate JSON-LD structured data
  const jsonLd = generateProductJsonLd({
    id: serializedProduct.id,
    name: serializedProduct.name,
    description: serializedProduct.description || "",
    image: serializedProduct.images,
    price: serializedProduct.price,
    availability:
      serializedProduct.product_variants &&
      serializedProduct.product_variants.length > 0
        ? serializedProduct.product_variants.some((v) => v.stock > 0)
          ? "instock"
          : "outofstock"
        : serializedProduct.stock > 0
          ? "instock"
          : "outofstock",
    brand: "Rastuci",
  });

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // nosemgrep: react-dangerouslysetinnerhtml — JSON-LD serializado con safeJsonLd, no HTML de usuario
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
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
