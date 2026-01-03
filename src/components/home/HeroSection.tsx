"use client";

import { Button } from "@/components/ui/Button";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  home?: HomeSettings;
  loading?: boolean;
}

export function HeroSection({ home, loading = false }: HeroSectionProps) {
  const handleExploreCategories = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    const el = document.getElementById("categorias");
    if (el) {
      const header = document.querySelector("header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - Math.max(8, headerHeight);
      window.scrollTo({ top: targetY, behavior: "smooth" });

      // Aplicar highlight temporal
      el.classList.add("scroll-highlight");
      window.setTimeout(() => el.classList.remove("scroll-highlight"), 1600);
    } else {
      // Fallback: smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const heroImageSrc = home?.heroImage;
  const logoSrc = home?.heroLogoUrl || defaultHomeSettings.heroLogoUrl || "/rastuci-full-logo.svg";

  return (
    <section className="w-full" aria-labelledby="hero-title">
      <div className="relative h-[calc(100svh-4rem)] overflow-hidden surface flex items-center justify-center">
        {heroImageSrc && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImageSrc}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </div>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-muted backdrop-blur border border-theme text-base-primary text-sm font-medium mb-6 shadow-sm">
            ✨ Nueva temporada
          </span>

          {/* Logo Principal */}
          <div className="mb-8 relative w-auto h-24 md:h-32 lg:h-40">
            {/* Using width/height auto style requires strict width/height ratio or a wrapper. 
                 Since the logo is central and vital, usage of simple width/height with 'w-auto' in Next/Image can be tricky.
                 Simpler approach: Use specific width/height but keep CSS classes for responsive height.
                 Or better: Use standard img for logo if SVG to avoid complexity OR use Next/Image with 'style={{ width: 'auto', height: '100%' }}' inside the relative responsive wrapper.
              */}
            <Image
              src={logoSrc}
              alt="Rastući"
              width={300}
              height={180}
              className="h-full w-auto mx-auto" // h-full of the wrapper which is responsive
              priority
            />
          </div>

          <p className="text-base md:text-xl muted mb-8 max-w-2xl">
            {loading
              ? "Ropa infantil de calidad, comodidad y estilo para los más pequeños"
              : home?.heroSubtitle || defaultHomeSettings.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/productos">
              <Button variant="hero">
                {loading
                  ? "Ver Productos"
                  : home?.ctaPrimaryLabel ||
                  defaultHomeSettings.ctaPrimaryLabel}
              </Button>
            </Link>
            <a
              href="#categorias"
              onClick={handleExploreCategories}
              className="inline-flex"
            >
              <Button variant="product">
                {loading
                  ? "Explorar Categorías"
                  : home?.ctaSecondaryLabel ||
                  defaultHomeSettings.ctaSecondaryLabel}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
