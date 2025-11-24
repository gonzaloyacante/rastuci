import HeaderShell from "@/components/header/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";
import { SkipLink } from "@/components/ui/SkipLink";

import { prisma } from "@/lib/prisma";
import { defaultHomeSettings, HomeSettingsSchema } from "@/lib/validation/home";

async function getHomeSettings() {
  try {
    const settingsData = await prisma.setting.findUnique({
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

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const home = await getHomeSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      <SkipLink href="#navigation">Saltar a la navegación</SkipLink>
      <HeaderShell />
      <SiteChrome home={home}>
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </SiteChrome>
    </div>
  );
}
