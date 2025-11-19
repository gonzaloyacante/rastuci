"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MobileMenuClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 muted hover:text-primary transition-colors" aria-label="Abrir menú móvil">
        <Menu className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav className="fixed right-0 top-0 h-full w-80 surface shadow-xl" role="dialog" aria-modal="true" aria-label="Menú de navegación móvil">
            <div className="flex items-center justify-between p-4 border-b border-muted">
              <h2 className="text-lg font-semibold" id="mobile-menu-title">Menú</h2>
              <button onClick={() => setOpen(false)} className="p-2 muted hover:text-primary transition-colors" aria-label="Cerrar menú móvil">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4" role="menu" aria-labelledby="mobile-menu-title">
              <Link href="/" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium muted">Inicio</Link>
              <Link href="/productos" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium muted">Productos</Link>
              <Link href="/contacto" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium muted">Contacto</Link>
              <Link href="/favoritos" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium muted">Favoritos</Link>
              <Link href="/carrito" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium muted">Carrito</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
