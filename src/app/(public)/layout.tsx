import Script from "next/script";

import { VacationProvider } from "@/components/providers/VacationProvider";
import VacationBanner from "@/components/vacation/VacationBanner";
import { getVacationSettings, isVacationActive } from "@/lib/vacation";
import { prisma } from "@/lib/prisma";
import { HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";
import {
  ContactSettingsSchema,
  defaultContactSettings,
} from "@/lib/validation/contact";
import { SkipLink } from "@/components/ui/SkipLink";
import HeaderShell from "@/components/header/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";

async function getHomeSettings() {
  try {
    const settingsData = await prisma.settings.findUnique({
      where: { key: "home" },
    });

    if (settingsData?.value) {
      const parsed = HomeSettingsSchema.safeParse(settingsData.value);
      if (parsed.success) {
        return parsed.data;
      }
    }
    return defaultHomeSettings;
  } catch {
    return defaultHomeSettings;
  }
}

async function getContactSettings() {
  try {
    const settingsData = await prisma.settings.findUnique({
      where: { key: "contact" },
    });

    if (settingsData?.value) {
      const parsed = ContactSettingsSchema.safeParse(settingsData.value);
      if (parsed.success) {
        return parsed.data;
      }
    }
    return defaultContactSettings;
  } catch {
    return defaultContactSettings;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [home, contact, vacationSettings] = await Promise.all([
    getHomeSettings(),
    getContactSettings(),
    getVacationSettings(),
  ]);

  const isVacation = isVacationActive(vacationSettings);

  // SEO Schema for Store Closed
  const jsonLd =
    isVacation && vacationSettings
      ? {
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Rastuci",
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              validFrom: vacationSettings.startDate
                ? new Date(vacationSettings.startDate).toISOString()
                : new Date().toISOString(),
              validThrough: vacationSettings.endDate
                ? new Date(vacationSettings.endDate).toISOString()
                : undefined,
              opens: "00:00",
              closes: "00:00",
            },
          ],
        }
      : null;

  return (
    <div className="min-h-screen flex flex-col pt-16">
      {jsonLd && (
        <Script
          id="vacation-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      </VacationProvider>
    </div>
  );
}
