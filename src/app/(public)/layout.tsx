import { headers } from "next/headers";
import Script from "next/script";

import HeaderShell from "@/components/header/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";
import CookieBanner from "@/components/legal/CookieBanner";
import { VacationProvider } from "@/components/providers/VacationProvider";
import { SkipLink } from "@/components/ui/SkipLink";
import VacationBanner from "@/components/vacation/VacationBanner";
import { safeJsonLd } from "@/lib/json-ld";
import {
  getContactSettings,
  getHomeSettings,
} from "@/lib/server/layout-settings";
import { getVacationSettings, isVacationActive } from "@/lib/vacation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? "";

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
          id="org-schema"
          type="application/ld+json"
          nonce={nonce || undefined}
          // [XSS] nosemgrep: react-dangerouslysetinnerhtml — JSON-LD serializado con safeJsonLd, no HTML de usuario
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}
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
        <CookieBanner />
      </VacationProvider>
    </div>
  );
}
