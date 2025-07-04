"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = "" }: HeaderProps) {
  const { getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);

  // Actualizar el contador cuando cambie el carrito
  useEffect(() => {
    setItemCount(getItemCount());
  }, [getItemCount]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="bg-[#FCE4EC] text-center py-2">
        <p className="font-semibold text-sm text-[#444444]">
          ENVÍOS A TODO EL PAÍS - 3 CUOTAS SIN INTERÉS
        </p>
      </div>
      <nav className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-bold text-[#E91E63]"
          style={{ fontFamily: '"Montserrat", sans-serif' }}>
          Rastući
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`hover:text-[#E91E63] transition-colors ${
              currentPage === "inicio" ? "text-[#E91E63] font-semibold" : ""
            }`}>
            Inicio
          </Link>
          <Link
            href="/productos"
            className={`hover:text-[#E91E63] transition-colors ${
              currentPage === "productos" ? "text-[#E91E63] font-semibold" : ""
            }`}>
            Productos
          </Link>
          <Link
            href="/productos?filter=ofertas"
            className="font-bold text-[#4CAF50] hover:text-green-700 transition-colors">
            OFERTAS
          </Link>
          <Link
            href="/contacto"
            className={`hover:text-[#E91E63] transition-colors ${
              currentPage === "contacto" ? "text-[#E91E63] font-semibold" : ""
            }`}>
            Contacto
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/carrito">
            <Button
              variant="outline"
              className="border-[#E91E63] text-[#E91E63] hover:bg-[#FCE4EC] hover:text-[#E91E63] relative">
              <ShoppingCart className="mr-1" size={18} />
              {itemCount > 0 && <span className="ml-1">({itemCount})</span>}
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E91E63] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
