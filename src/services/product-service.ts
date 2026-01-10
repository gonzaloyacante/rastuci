import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Servicio de productos optimizado con Cache de Next.js
 * Reduce la carga en la base de datos para la página principal y listados.
 */

// Cache key generators
// const getProductsKey = (category?: string, featured?: boolean) =>
//   `products:${category || "all"}:${featured ? "featured" : "standard"}`;

export const getCachedProducts = unstable_cache(
  async (category?: string, featured?: boolean) => {
    return await prisma.products.findMany({
      where: {
        ...(category ? { categories: { name: category } } : {}),
        ...(featured ? { onSale: true } : {}),
      },
      include: {
        // categories is a relation, must include.
        categories: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },
  ["products-list"], // Tags for revalidation
  {
    revalidate: 60 * 5, // 5 minutes cache
    tags: ["products"],
  }
);

export const getCachedProductBySlug = unstable_cache(
  async (id: string) => {
    // Note: We use ID in URLs currently, not slug
    return await prisma.products.findUnique({
      where: { id },
      include: {
        variants: true,
        categories: true,
        product_reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  },
  ["product-detail"],
  {
    revalidate: 60 * 60, // 1 hour cache
    tags: ["products"],
  }
);
