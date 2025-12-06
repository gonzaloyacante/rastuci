import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://rastuci.com"
  ).replace(/\/$/, "");

  // Static routes with SEO priorities
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "daily",
      priority: 1.0,
      lastModified: new Date(),
    },
    {
      url: `${base}/productos`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${base}/contacto`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: new Date(),
    },
    {
      url: `${base}/carrito`,
      changeFrequency: "always",
      priority: 0.3,
      lastModified: new Date(),
    },
    {
      url: `${base}/checkout`,
      changeFrequency: "always",
      priority: 0.1,
      lastModified: new Date(),
    },
    {
      url: `${base}/favoritos`,
      changeFrequency: "always",
      priority: 0.4,
      lastModified: new Date(),
    },
    {
      url: `${base}/offline`,
      changeFrequency: "never",
      priority: 0.1,
      lastModified: new Date(),
    },
  ];

  let latestUpdatedAt: Date | null = null;

  // Categories - optimized query
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100, // Limit for performance
    });

    if (categories.length > 0) {
      latestUpdatedAt = categories[0].updatedAt;
    }

    categoryEntries = categories
      .filter((c: (typeof categories)[0]) => c._count.products > 0) // Only categories with products
      .map((category: (typeof categories)[0]) => ({
        url: `${base}/productos?categoryId=${category.id}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: Math.min(0.8, 0.5 + category._count.products * 0.01), // Dynamic priority based on product count
      }));
  } catch (error) {
    logger.warn("Error fetching categories for sitemap:", { data: error });
  }

  // Products - optimized query with stock filter
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.products.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        stock: true,
        onSale: true,
      },
      where: {
        stock: { gt: 0 }, // Only products in stock
      },
      orderBy: { updatedAt: "desc" },
      take: 2000, // Increased for better coverage
    });

    if (
      products.length > 0 &&
      (!latestUpdatedAt || products[0].updatedAt > latestUpdatedAt)
    ) {
      latestUpdatedAt = products[0].updatedAt;
    }

    productEntries = products.map((product: (typeof products)[0]) => ({
      url: `${base}/productos/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: product.onSale
        ? ("daily" as const)
        : ("weekly" as const),
      priority: product.onSale ? 0.8 : 0.7, // Higher priority for sale items
    }));
  } catch (error) {
    logger.warn("Error fetching products for sitemap:", { data: error });
  }

  // Update homepage lastModified with latest content change
  if (latestUpdatedAt) {
    staticEntries[0] = {
      ...staticEntries[0],
      lastModified: latestUpdatedAt,
    };
    staticEntries[1] = {
      ...staticEntries[1],
      lastModified: latestUpdatedAt,
    };
  }

  const allEntries = [...staticEntries, ...categoryEntries, ...productEntries];

  // Sort by priority for better SEO (higher priority first)
  allEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return allEntries;
}
