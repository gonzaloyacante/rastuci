"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShoppingCart, Heart, Menu, X, User, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
// import { useFavorites } from "@/hooks/useFavorites";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = "inicio" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { cartItems, getItemCount, getCartTotal } = useCart();
  // const { favorites } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  const totalPrice = getCartTotal();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
      }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Rastuci</span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                currentPage === "inicio"
                  ? "text-pink-600"
                  : "text-gray-700 hover:text-pink-600"
              }`}>
              Inicio
            </Link>
            <Link
              href="/productos"
              className={`text-sm font-medium transition-colors ${
                currentPage === "productos"
                  ? "text-pink-600"
                  : "text-gray-700 hover:text-pink-600"
              }`}>
              Productos
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors ${
                currentPage === "contacto"
                  ? "text-pink-600"
                  : "text-gray-700 hover:text-pink-600"
              }`}>
              Contacto
            </Link>
          </nav>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Búsqueda */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Buscar productos">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Favoritos */}
            <Link
              href="/favoritos"
              className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Ver favoritos">
              <Heart className="w-5 h-5" />
              {/* {favorites && favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )} */}
            </Link>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Ver carrito">
              <ShoppingCart className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-600 hover:text-pink-600 transition-colors"
            aria-label="Abrir menú móvil">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menú</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Cerrar menú móvil">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "inicio" ? "text-pink-600" : "text-gray-700"
                }`}>
                Inicio
              </Link>
              <Link
                href="/productos"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "productos"
                    ? "text-pink-600"
                    : "text-gray-700"
                }`}>
                Productos
              </Link>
              <Link
                href="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "contacto" ? "text-pink-600" : "text-gray-700"
                }`}>
                Contacto
              </Link>
              <Link
                href="/favoritos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700">
                Favoritos (0)
              </Link>
              <Link
                href="/carrito"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-700">
                Carrito ({getItemCount()})
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de búsqueda */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Buscar productos</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                  aria-label="Cerrar búsqueda">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSearch} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <Button type="submit" className="w-full">
                  Buscar
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
