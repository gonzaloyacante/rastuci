import Link from "next/link";
import React from "react";

import CartWidget from "@/components/header/CartWidget.client";
import MobileMenuClient from "@/components/header/MobileMenu.client";
import WishlistWidget from "@/components/header/WishlistWidget.client";

export default function HeaderShell({
  children: _children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="pill-icon">
              <span className="font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-primary">Rastuci</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="text-sm font-medium muted hover:text-primary"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="text-sm font-medium muted hover:text-primary"
            >
              Productos
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium muted hover:text-primary"
            >
              Contacto
            </Link>
          </nav>

          {/* Widgets: each widget is a client component and will hydrate individually */}
          <div className="hidden md:flex items-center space-x-4">
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
