import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { logger } from "@/lib/logger";
import { generateStoreJsonLd } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { defaultHomeSettings, HomeSettingsSchema } from "@/lib/validation/home";
import { Metadata } from "next";

export const revalidate = 60; // Revalidar cada minuto

export const metadata: Metadata = {
  title: "Rastuci - Ropa Infantil de Calidad | Tienda Online",
  description:
    "Descubre la mejor ropa infantil en Rastuci. Productos de calidad, diseños únicos y comodidad para tus pequeños. Envíos a todo el país.",
};

async function getHomeData() {
  try {
    const [settingsData, rawCategories, rawFeaturedProducts] =
      await Promise.all([
        prisma.settings.findUnique({ where: { key: "home" } }),
        prisma.categories.findMany({
          orderBy: { name: "asc" },
          take: 12,
        }),
        prisma.products.findMany({
          where: {
            stock: { gt: 0 },
            onSale: true,
          },
          take: 4,
          include: { categories: true },
          orderBy: { updatedAt: "desc" },
        }),
      ]);

    // Transformar datos para coincidir con los tipos del frontend (null -> undefined)
    const categories = rawCategories.map((c) => ({
      ...c,
      description: c.description || undefined,
      image: c.imageUrl || undefined,
    }));

    const featuredProducts = rawFeaturedProducts.map((p) => {
      let images: string[] = [];
      if (Array.isArray(p.images)) {
        images = p.images as string[];
      } else if (typeof p.images === "string") {
        try {
          images = JSON.parse(p.images);
        } catch {
          images = [p.images];
        }
      }

      return {
        ...p,
        description: p.description || undefined,
        salePrice: p.salePrice || undefined,
        rating: p.rating || null,
        images,
      };
    });

    // Parsear settings o usar defaults
    let settings = defaultHomeSettings;
    if (settingsData?.value) {
      const parsed = HomeSettingsSchema.safeParse(settingsData.value);
      if (parsed.success) {
        settings = parsed.data;
      }
    }

    return { settings, categories, featuredProducts };
  } catch (error) {
    logger.error("Error fetching home data:", { error });
    return {
      settings: defaultHomeSettings,
      categories: [],
      featuredProducts: [],
    };
  }
}

export default async function HomePage() {
  const { settings, categories, featuredProducts } = await getHomeData();

  const jsonLd = generateStoreJsonLd();

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <HeroSection home={settings} />

      <CategoriesSection
        categories={categories}
        home={settings}
        display={settings.categoriesDisplay}
      />

      <FeaturedProductsSection products={featuredProducts} home={settings} />

      <BenefitsSection home={settings} />
    </main>
  );
}
