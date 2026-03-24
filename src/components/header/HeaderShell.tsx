import Image from "next/image";
import Link from "next/link";
import React from "react";

import CartWidget from "@/components/header/CartWidget.client";
import HeaderSearch from "@/components/header/HeaderSearch.client";
import MobileMenuClient from "@/components/header/MobileMenu.client";
import NavLinks from "@/components/header/NavLinks.client";
import WishlistWidget from "@/components/header/WishlistWidget.client";
import { type HomeSettings } from "@/lib/validation/home";

export default function HeaderShell({
  children: _children,
  home,
}: {
  children?: React.ReactNode;
  home?: HomeSettings;
}) {
  const brand = home?.footer?.brand || "Rastuci";
  // Use dedicated headerLogoUrl, fallback to footer.logoUrl for backwards compatibility
  const logoUrl = home?.headerLogoUrl;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brand}
                width={120}
                height={32}
                className="h-8 w-auto dark:invert"
                priority
              />
            ) : (
              <>
                <div className="pill-icon">
                  <span className="font-bold text-sm">
                    {brand.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xl font-bold text-primary">{brand}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Navegación principal"
            id="navigation"
          >
            <NavLinks />
          </nav>

          {/* Widgets: each widget is a client component and will hydrate individually */}
          <div className="hidden md:flex items-center space-x-3">
            <HeaderSearch />
            <WishlistWidget />
            <CartWidget />
          </div>

          {/* Mobile quick actions + menu button (client) */}
          <div className="md:hidden flex items-center space-x-1">
            <WishlistWidget mobile />
            <CartWidget mobile />
            <MobileMenuClient />
          </div>
        </div>
      </div>
    </header>
  );
}
