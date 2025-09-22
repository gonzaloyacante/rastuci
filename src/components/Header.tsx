"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, ShoppingCart, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { ThemeToggle } from "./ui/ThemeToggle";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = "inicio" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { cartItems, getItemCount, getCartTotal } = useCart();
  const { getWishlistCount } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (term?: string) => {
    const searchQuery = term || searchTerm;
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const totalPrice = getCartTotal();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "surface backdrop-blur-md shadow-lg" : "surface"
      }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="pill-icon">
              <span className="font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-primary">Rastuci</span>
          </Link>

          {/* Navegación desktop */}
          <nav id="navigation" className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Navegación principal">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                currentPage === "inicio"
                  ? "text-primary"
                  : "muted hover:text-primary"
              }`}
              aria-current={currentPage === "inicio" ? "page" : undefined}>
              Inicio
            </Link>
            <Link
              href="/productos"
              className={`text-sm font-medium transition-colors ${
                currentPage === "productos"
                  ? "text-primary"
                  : "muted hover:text-primary"
              }`}
              aria-current={currentPage === "productos" ? "page" : undefined}>
              Productos
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors ${
                currentPage === "contacto"
                  ? "text-primary"
                  : "muted hover:text-primary"
              }`}
              aria-current={currentPage === "contacto" ? "page" : undefined}>
              Contacto
            </Link>
          </nav>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Búsqueda */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 muted hover:text-primary transition-colors"
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
              className="relative p-2 muted hover:text-primary transition-colors"
              aria-label={`Ver favoritos (${getWishlistCount()} productos)`}>
              <Heart className="w-5 h-5" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 surface text-primary border border-primary text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                  {getWishlistCount()}
                </span>
              )}
            </Link>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative p-2 muted hover:text-primary transition-colors"
              aria-label={`Ver carrito (${getItemCount()} productos)`}>
              <ShoppingCart className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 surface text-primary border border-primary text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 muted hover:text-primary transition-colors"
            aria-label="Abrir menú móvil">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav 
            className="fixed right-0 top-0 h-full w-80 surface shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            <div className="flex items-center justify-between p-4 border-b border-muted">
              <h2 className="text-lg font-semibold" id="mobile-menu-title">Menú</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 muted hover:text-primary transition-colors"
                aria-label="Cerrar menú móvil">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-4" role="menu" aria-labelledby="mobile-menu-title">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "inicio" ? "text-primary" : "muted"
                }`}
                role="menuitem"
                aria-current={currentPage === "inicio" ? "page" : undefined}>
                Inicio
              </Link>
              <Link
                href="/productos"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "productos" ? "text-primary" : "muted"
                }`}
                role="menuitem"
                aria-current={currentPage === "productos" ? "page" : undefined}>
                Productos
              </Link>
              <Link
                href="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  currentPage === "contacto" ? "text-primary" : "muted"
                }`}
                role="menuitem"
                aria-current={currentPage === "contacto" ? "page" : undefined}>
                Contacto
              </Link>
              <Link
                href="/favoritos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium muted"
                role="menuitem">
                Favoritos ({getWishlistCount()})
              </Link>
              <Link
                href="/carrito"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium muted"
                role="menuitem">
                Carrito ({getItemCount()})
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Dropdown de búsqueda */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 surface border border-muted rounded-lg shadow-xl search-dropdown">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent"
                autoFocus
              />
              <Button
                onClick={() => handleSearch()}
                variant="primary"
                size="sm"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsSearchOpen(false)}
                variant="ghost"
                size="sm"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sugerencias de búsqueda */}
            {searchTerm.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium muted">Sugerencias</h3>
                <div className="space-y-1">
                  {['Ropa de bebé', 'Ropa de niña', 'Accesorios', 'Pijamas'].filter(suggestion => 
                    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        handleSearch(suggestion);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover-surface rounded transition-colors"
                    >
                      <Search className="w-3 h-3 inline mr-2 muted" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {searchTerm.length === 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium muted">Búsquedas populares</h3>
                <div className="flex flex-wrap gap-2">
                  {['Ropa de bebé', 'Pijamas', 'Accesorios', 'Ofertas'].map((popular, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(popular);
                        handleSearch(popular);
                      }}
                      className="px-3 py-1 text-xs surface border border-muted rounded-full hover-surface transition-colors"
                    >
                      {popular}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
