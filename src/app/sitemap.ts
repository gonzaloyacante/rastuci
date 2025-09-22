import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // 1h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://rastuci.com").replace(/\/$/, "");

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/productos`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Categories
  let categoryEntries: MetadataRoute.Sitemap = [];
  let latestUpdatedAt: Date | null = null;
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    if (categories.length > 0) {
      latestUpdatedAt = categories[0].updatedAt;
    }
    categoryEntries = categories.map((c) => ({
      url: `${base}/productos?categoryId=${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Fallback silent; static entries still work
  }

  // Products (detail pages)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });
    if (products.length > 0) {
      latestUpdatedAt = latestUpdatedAt
        ? new Date(Math.max(latestUpdatedAt.getTime(), products[0].updatedAt.getTime()))
        : products[0].updatedAt;
    }
    productEntries = products.map((p) => ({
      url: `${base}/productos/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // ignore
  }

  // Optionally attach lastModified to homepage if we computed something
  if (latestUpdatedAt) {
    staticEntries[0] = { ...staticEntries[0], lastModified: latestUpdatedAt };
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
