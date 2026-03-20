import { MetadataRoute } from "next";

import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  // Static routes — usar las URLs canónicas reales (no las redirecciones /productos, /contacto)
  const staticRoutes = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/products", priority: 0.9, freq: "daily" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
    { path: "/tracking", priority: 0.5, freq: "monthly" },
    { path: "/legal/terms", priority: 0.3, freq: "yearly" },
    { path: "/legal/privacy", priority: 0.3, freq: "yearly" },
  ] as const;

  const routes = staticRoutes.map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq as
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never",
    priority,
  }));

  // Dynamic products — solo los activos
  const products = await prisma.products.findMany({
    where: { isActive: true },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Dynamic categories
  const categories = await prisma.categories.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/products?categoryId=${category.id}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
