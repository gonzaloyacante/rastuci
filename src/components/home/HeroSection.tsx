"use client";

import { Button } from "@/components/ui/Button";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { type ShippingSettings } from "@/lib/validation/shipping";
import { Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  home?: HomeSettings;
  shipping?: ShippingSettings;
  loading?: boolean;
}

export function HeroSection({
  home,
  shipping,
  loading = false,
}: HeroSectionProps) {
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

  // Logo logic: STRICT. Only use what is in the DB.
  // The user explicitly deleted the fallback file and wants no default.
  const logoSrc = home?.heroLogoUrl || null;
  const heroImageSrc = home?.heroImage;

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-sm font-bold tracking-wide mb-3 shadow-lg shadow-pink-500/20 transform hover:scale-105 transition-transform duration-300">
            ✨ Nueva temporada
          </span>

          {/* Free Shipping Banner - Solo si está activado */}
          {shipping?.freeShipping && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm md:text-base shadow-2xl shadow-green-500/40 border-2 border-white/20 backdrop-blur-sm">
                <Truck className="w-5 h-5 animate-bounce" />
                <span className="tracking-wide">
                  {shipping.freeShippingLabel || "ENVÍO GRATIS"}
                </span>
                <span className="hidden sm:inline text-white/90 font-normal">
                  a todo el país
                </span>
              </div>
            </div>
          )}

          {/* Título Principal - Independiente del Logo */}
          <h1 className="sr-only">
            {home?.heroTitle ||
              defaultHomeSettings.heroTitle ||
              "Rastuci - Ropa Infantil de Calidad"}
          </h1>

          {/* Logo Principal - Rendering Condicional Estricto */}
          {logoSrc && (
            <div className="mb-8 relative w-auto h-24 md:h-32 lg:h-40">
              <Image
                src={logoSrc}
                alt="Rastući"
                width={300}
                height={180}
                className="h-full w-auto mx-auto" // h-full of the wrapper which is responsive
                priority
                unoptimized={logoSrc.endsWith(".svg")}
              />
            </div>
          )}

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
