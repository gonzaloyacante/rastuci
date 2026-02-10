import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { logger } from "@/lib/logger";
import { generateStoreJsonLd } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { defaultHomeSettings } from "@/lib/validation/home";
import { defaultShippingSettings } from "@/lib/validation/shipping";
import { Metadata } from "next";

export const revalidate = 300; // Revalidar cada 5 minutos

export const metadata: Metadata = {
  title: "Rastuci - Ropa Infantil de Calidad | Tienda Online",
  description:
    "Descubre la mejor ropa infantil en Rastuci. Productos de calidad, diseños únicos y comodidad para tus pequeños. Envíos a todo el país.",
};

async function getHomeData() {
  try {
    const [homeSettings, shippingSettings, rawCategories, rawFeaturedProducts] =
      await Promise.all([
        prisma.home_settings.findUnique({
          where: { id: "default" },
          include: { benefits: { orderBy: { sortOrder: "asc" } } },
        }),
        prisma.shipping_settings.findUnique({
          where: { id: "default" },
        }),
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
        price: Number(p.price),
        description: p.description || undefined,
        salePrice: p.salePrice ? Number(p.salePrice) : undefined,
        rating: p.rating || null,
        images,
        colorImages: p.colorImages as Record<string, string[]> | null,
      };
    });

    // Usar settings relacionales o defaults
    const settings = homeSettings
      ? {
          heroTitle: homeSettings.heroTitle,
          showHeroTitle: homeSettings.showHeroTitle,
          heroSubtitle: homeSettings.heroSubtitle,
          showHeroSubtitle: homeSettings.showHeroSubtitle,
          heroLogoUrl: homeSettings.heroLogoUrl ?? "",
          showHeroLogo: homeSettings.showHeroLogo,
          heroImage: homeSettings.heroImage ?? undefined,
          headerLogoUrl: homeSettings.headerLogoUrl ?? "",
          ctaPrimaryLabel: homeSettings.ctaPrimaryLabel,
          showCtaPrimary: homeSettings.showCtaPrimary,
          ctaSecondaryLabel: homeSettings.ctaSecondaryLabel,
          showCtaSecondary: homeSettings.showCtaSecondary,
          categoriesTitle: homeSettings.categoriesTitle,
          showCategoriesTitle: homeSettings.showCategoriesTitle,
          categoriesSubtitle: homeSettings.categoriesSubtitle,
          showCategoriesSubtitle: homeSettings.showCategoriesSubtitle,
          categoriesDisplay: homeSettings.categoriesDisplay as "image" | "icon",
          featuredTitle: homeSettings.featuredTitle,
          showFeaturedTitle: homeSettings.showFeaturedTitle,
          featuredSubtitle: homeSettings.featuredSubtitle,
          showFeaturedSubtitle: homeSettings.showFeaturedSubtitle,
          benefits: homeSettings.benefits.map((b) => ({
            icon: b.icon,
            title: b.title,
            description: b.description,
          })),
          footer: {
            brand: homeSettings.footerBrand,
            showBrand: homeSettings.showFooterBrand,
            tagline: homeSettings.footerTagline,
            showTagline: homeSettings.showFooterTagline,
            logoUrl: homeSettings.footerLogoUrl ?? "",
            showLogo: homeSettings.showFooterLogo,
          },
        }
      : defaultHomeSettings;

    // Usar shipping settings relacionales o defaults
    const shipping = shippingSettings
      ? {
          ...defaultShippingSettings,
          freeShipping: shippingSettings.enableFreeShipping,
          freeShippingMinAmount: Number(shippingSettings.freeShippingMin),
        }
      : defaultShippingSettings;

    return { settings, shipping, categories, featuredProducts };
  } catch (error) {
    logger.error("Error fetching home data:", { error });
    return {
      settings: defaultHomeSettings,
      shipping: defaultShippingSettings,
      categories: [],
      featuredProducts: [],
    };
  }
}

export default async function HomePage() {
  const { settings, shipping, categories, featuredProducts } =
    await getHomeData();

  const jsonLd = generateStoreJsonLd();

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <HeroSection home={settings} shipping={shipping} />

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
