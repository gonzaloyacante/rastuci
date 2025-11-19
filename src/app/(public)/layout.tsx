import HeaderShell from "@/components/HeaderShell";
import SiteChrome from "@/components/layout/SiteChrome";
import { SkipLink } from "@/components/ui/SkipLink";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      <SkipLink href="#navigation">Saltar a la navegación</SkipLink>
      <HeaderShell />
      <SiteChrome>
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </SiteChrome>
    </div>
  );
}
