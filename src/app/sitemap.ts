import prisma from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static routes
  const routes = ["", "/productos", "/contacto", "/nosotros"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  // Dynamic products
  const products = await prisma.products.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/productos/${product.id}`,
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
    url: `${baseUrl}/categorias/${category.id}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
