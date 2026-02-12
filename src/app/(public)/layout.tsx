import Script from "next/script";

import { VacationProvider } from "@/components/providers/VacationProvider";
import VacationBanner from "@/components/vacation/VacationBanner";
import { getVacationSettings, isVacationActive } from "@/lib/vacation";
import { prisma } from "@/lib/prisma";
import { defaultHomeSettings } from "@/lib/validation/home";
import { defaultContactSettings } from "@/lib/validation/contact";
import { SkipLink } from "@/components/ui/SkipLink";
import HeaderShell from "@/components/header/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";

async function getHomeSettings() {
  try {
    const settings = await prisma.home_settings.findUnique({
      where: { id: "default" },
      include: { benefits: { orderBy: { sortOrder: "asc" } } },
    });

    if (!settings) return defaultHomeSettings;

    // Map to application format
    return {
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroLogoUrl: settings.heroLogoUrl ?? undefined,
      heroImage: settings.heroImage ?? undefined,
      headerLogoUrl: settings.headerLogoUrl ?? undefined,
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
      categoriesSubtitle: settings.categoriesSubtitle,
      categoriesDisplay: settings.categoriesDisplay as "image" | "icon",
      showCategoriesSubtitle: settings.showCategoriesSubtitle,
      benefits: settings.benefits.map((b) => ({
        icon: b.icon,
        title: b.title,
        description: b.description,
      })),
      footer: {
        logoUrl: settings.footerLogoUrl ?? undefined,
        brand: settings.footerBrand,
        tagline: settings.footerTagline,
        showLogo: settings.showFooterLogo,
        showBrand: settings.showFooterBrand,
        showTagline: settings.showFooterTagline,
      },
    };
  } catch (err) {
    console.error("Error fetching home settings in layout:", err);
    return defaultHomeSettings;
  }
}

async function getContactSettings() {
  try {
    const settings = await prisma.contact_settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) return defaultContactSettings;

    return {
      headerTitle: settings.headerTitle,
      headerSubtitle: settings.headerSubtitle,
      emails: settings.emails,
      phones: settings.phones,
      address: {
        lines: [settings.addressLine1 ?? "", settings.addressLine2 ?? ""],
        cityCountry: settings.addressCityCountry ?? "",
      },
      hours: {
        title: settings.hoursTitle,
        weekdays: settings.hoursWeekdays,
        saturday: settings.hoursSaturday,
        sunday: settings.hoursSunday,
      },
      form: {
        title: settings.formTitle,
        nameLabel: settings.formNameLabel,
        emailLabel: settings.formEmailLabel,
        phoneLabel: settings.formPhoneLabel,
        messageLabel: settings.formMessageLabel,
        submitLabel: settings.formSubmitLabel,
        successTitle: settings.formSuccessTitle,
        successMessage: settings.formSuccessMessage,
        sendAnotherLabel: settings.formSendAnother,
      },
      faqs: [],
      social: {
        instagram: {
          url: settings.instagramUrl ?? "",
          username: settings.instagramUsername ?? "",
        },
        facebook: {
          url: settings.facebookUrl ?? "",
          username: settings.facebookUsername ?? "",
        },
        whatsapp: {
          url: settings.whatsappUrl ?? "",
          username: settings.whatsappUsername ?? "",
        },
        tiktok: {
          url: settings.tiktokUrl ?? "",
          username: settings.tiktokUsername ?? "",
        },
        youtube: {
          url: settings.youtubeUrl ?? "",
          username: settings.youtubeUsername ?? "",
        },
      },
    };
  } catch (err) {
    console.error("Error fetching contact settings in layout:", err);
    return defaultContactSettings;
  }
}

import { headers } from "next/headers";

// ... existing imports

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  const [home, contact, vacationSettings] = await Promise.all([
    getHomeSettings(),
    getContactSettings(),
    getVacationSettings(),
  ]);

  const isVacation = isVacationActive(vacationSettings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: contact.headerTitle || "Rastuci",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: home.heroLogoUrl,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contact.phones[0],
      contactType: "customer service",
      areaServed: "AR",
    },
    sameAs: [
      contact.social.instagram.url,
      contact.social.facebook.url,
      contact.social.tiktok.url,
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {jsonLd && (
        <Script
          id="vacation-schema"
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      // ...
      <VacationProvider
        initialSettings={vacationSettings}
        initialIsActive={isVacation}
      >
        <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
        <SkipLink href="#navigation">Saltar a la navegación</SkipLink>

        <VacationBanner />

        <HeaderShell home={home} />
        <SiteChrome home={home} contact={contact}>
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
        </SiteChrome>
      </VacationProvider>
    </div>
  );
}
