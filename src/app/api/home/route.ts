import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";

export const dynamic = "force-dynamic";

// Helper to convert DB model to API format
function dbToApiFormat(
  settings: {
    headerLogoUrl: string | null;
    heroLogoUrl: string | null;
    heroImage: string | null;
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    categoriesTitle: string;
    featuredTitle: string;
    featuredSubtitle: string;
    showHeroLogo: boolean;
    showHeroTitle: boolean;
    showHeroSubtitle: boolean;
    showCtaPrimary: boolean;
    showCtaSecondary: boolean;
    showCategoriesTitle: boolean;
    showFeaturedTitle: boolean;
    showFeaturedSubtitle: boolean;
    footerLogoUrl: string | null;
    footerBrand: string;
    footerTagline: string;
    showFooterLogo: boolean;
    showFooterBrand: boolean;
    showFooterTagline: boolean;
  } | null,
  benefits: { icon: string; title: string; description: string }[]
) {
  if (!settings) {
    return defaultHomeSettings;
  }

  return {
    headerLogoUrl: settings.headerLogoUrl ?? undefined,
    heroLogoUrl: settings.heroLogoUrl ?? undefined,
    heroImage: settings.heroImage ?? undefined,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    ctaPrimaryLabel: settings.ctaPrimaryLabel,
    ctaSecondaryLabel: settings.ctaSecondaryLabel,
    categoriesTitle: settings.categoriesTitle,
    featuredTitle: settings.featuredTitle,
    featuredSubtitle: settings.featuredSubtitle,
    showHeroLogo: settings.showHeroLogo,
    showHeroTitle: settings.showHeroTitle,
    showHeroSubtitle: settings.showHeroSubtitle,
    showCtaPrimary: settings.showCtaPrimary,
    showCtaSecondary: settings.showCtaSecondary,
    showCategoriesTitle: settings.showCategoriesTitle,
    showFeaturedTitle: settings.showFeaturedTitle,
    showFeaturedSubtitle: settings.showFeaturedSubtitle,
    footer: {
      logoUrl: settings.footerLogoUrl ?? undefined,
      brand: settings.footerBrand,
      tagline: settings.footerTagline,
      showLogo: settings.showFooterLogo,
      showBrand: settings.showFooterBrand,
      showTagline: settings.showFooterTagline,
    },
    benefits: benefits.map((b) => ({
      icon: b.icon,
      title: b.title,
      description: b.description,
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, {
      key: "home:get",
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, {
        retryAfterMs: rl.retryAfterMs,
      });
    }

    // Fetch from new explicit model
    const settings = await prisma.home_settings.findUnique({
      where: { id: "default" },
      include: {
        benefits: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const data = dbToApiFormat(settings, settings?.benefits ?? []);

    // Validate against schema
    const parsed = HomeSettingsSchema.safeParse(data);

    if (!parsed.success) {
      logger.warn("Invalid home settings in DB, returning data with warnings", {
        issues: parsed.error.flatten(),
      });
      // Return data anyway so admin can see/fix it
      return ok(data);
    }

    return ok(parsed.data);
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("GET /api/home failed", e);
    const code: ApiErrorCode =
      e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
    return fail(code, e.message, e.status ?? 500);
  }
}

// PUT /api/home - Update homepage settings (ADMIN ONLY)
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const rl = await checkRateLimit(req, {
      key: "home:put",
      limit: 20,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, {
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await req.json();
    const parsed = HomeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return fail("BAD_REQUEST", parsed.error.message, 400);
    }

    const data = parsed.data;

    // Use transaction to update settings and benefits
    await prisma.$transaction(async (tx) => {
      // Upsert main settings
      await tx.home_settings.upsert({
        where: { id: "default" },
        update: {
          headerLogoUrl: data.headerLogoUrl ?? null,
          heroLogoUrl: data.heroLogoUrl ?? null,
          heroImage: data.heroImage ?? null,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          ctaPrimaryLabel: data.ctaPrimaryLabel,
          ctaSecondaryLabel: data.ctaSecondaryLabel,
          categoriesTitle: data.categoriesTitle,
          featuredTitle: data.featuredTitle,
          featuredSubtitle: data.featuredSubtitle,
          showHeroLogo: data.showHeroLogo ?? true,
          showHeroTitle: data.showHeroTitle ?? true,
          showHeroSubtitle: data.showHeroSubtitle ?? true,
          showCtaPrimary: data.showCtaPrimary ?? true,
          showCtaSecondary: data.showCtaSecondary ?? true,
          showCategoriesTitle: data.showCategoriesTitle ?? true,
          showFeaturedTitle: data.showFeaturedTitle ?? true,
          showFeaturedSubtitle: data.showFeaturedSubtitle ?? true,
          footerLogoUrl: data.footer?.logoUrl ?? null,
          footerBrand: data.footer?.brand ?? "Rastuci",
          footerTagline: data.footer?.tagline ?? "Moda infantil con amor",
          showFooterLogo: data.footer?.showLogo ?? true,
          showFooterBrand: data.footer?.showBrand ?? true,
          showFooterTagline: data.footer?.showTagline ?? true,
          updatedAt: new Date(),
        },
        create: {
          id: "default",
          headerLogoUrl: data.headerLogoUrl ?? null,
          heroLogoUrl: data.heroLogoUrl ?? null,
          heroImage: data.heroImage ?? null,
          heroTitle: data.heroTitle,
          heroSubtitle: data.heroSubtitle,
          ctaPrimaryLabel: data.ctaPrimaryLabel,
          ctaSecondaryLabel: data.ctaSecondaryLabel,
          categoriesTitle: data.categoriesTitle,
          featuredTitle: data.featuredTitle,
          featuredSubtitle: data.featuredSubtitle,
          showHeroLogo: data.showHeroLogo ?? true,
          showHeroTitle: data.showHeroTitle ?? true,
          showHeroSubtitle: data.showHeroSubtitle ?? true,
          showCtaPrimary: data.showCtaPrimary ?? true,
          showCtaSecondary: data.showCtaSecondary ?? true,
          showCategoriesTitle: data.showCategoriesTitle ?? true,
          showFeaturedTitle: data.showFeaturedTitle ?? true,
          showFeaturedSubtitle: data.showFeaturedSubtitle ?? true,
          footerLogoUrl: data.footer?.logoUrl ?? null,
          footerBrand: data.footer?.brand ?? "Rastuci",
          footerTagline: data.footer?.tagline ?? "Moda infantil con amor",
          showFooterLogo: data.footer?.showLogo ?? true,
          showFooterBrand: data.footer?.showBrand ?? true,
          showFooterTagline: data.footer?.showTagline ?? true,
        },
      });

      // Delete existing benefits and recreate
      await tx.home_benefits.deleteMany({
        where: { homeSettingsId: "default" },
      });

      // Create new benefits
      if (data.benefits && data.benefits.length > 0) {
        await tx.home_benefits.createMany({
          data: data.benefits.map((b, index) => ({
            homeSettingsId: "default",
            icon: b.icon,
            title: b.title,
            description: b.description,
            sortOrder: index,
          })),
        });
      }
    });

    // Fetch updated data to return
    const updated = await prisma.home_settings.findUnique({
      where: { id: "default" },
      include: { benefits: { orderBy: { sortOrder: "asc" } } },
    });

    const responseData = dbToApiFormat(updated, updated?.benefits ?? []);

    // Revalidate paths to ensure fresh data
    revalidatePath("/", "layout"); // Update header/footer everywhere
    revalidatePath("/", "page"); // Update homepage content

    return ok(responseData, "Configuración del Home guardada");
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("PUT /api/home failed", e);
    const code: ApiErrorCode =
      e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
    return fail(code, e.message, e.status ?? 500);
  }
});
