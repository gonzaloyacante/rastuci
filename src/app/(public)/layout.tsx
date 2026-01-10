import HeaderShell from "@/components/header/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";
import { SkipLink } from "@/components/ui/SkipLink";

import { prisma } from "@/lib/prisma";
import { defaultHomeSettings, HomeSettingsSchema } from "@/lib/validation/home";
import { ContactSettingsSchema, defaultContactSettings } from "@/lib/validation/contact";

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
  const [home, contact] = await Promise.all([
    getHomeSettings(),
    getContactSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      <SkipLink href="#navigation">Saltar a la navegación</SkipLink>
      <HeaderShell home={home} />
      <SiteChrome home={home} contact={contact}>
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </SiteChrome>
    </div>
  );
}
