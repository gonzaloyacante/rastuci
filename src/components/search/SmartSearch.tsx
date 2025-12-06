"use client";

import useDebounce from "@/hooks/useDebounce";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronRight,
    Clock,
    Loader2,
    Search,
    Star,
    Tag,
    TrendingUp,
    X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface SearchSuggestion {
  id: string;
  type: "product" | "category" | "trending" | "recent";
  text: string;
  subtitle?: string;
  image?: string;
  category?: string;
  rating?: number;
  price?: number;
  href?: string;
}

interface SmartSearchProps {
  placeholder?: string;
  showTrending?: boolean;
  showRecent?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onSearch?: (query: string) => void;
}

export default function SmartSearch({
  placeholder = "Buscar productos...",
  showTrending = true,
  showRecent = true,
  className = "",
  size = "md",
  onSearch,
}: SmartSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Obtener búsquedas trending reales de la API
  const { data: trendingData } = useSWR(
    "/api/search/trending",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        return { trending: [] };
      }
      return res.json();
    }
  );

  // Obtener categorías para sugerencias
  // Las categorías se obtienen en fetchSuggestions cuando se necesita

  const trendingSearches = trendingData?.data?.trending || [];

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      setRecentSearches(recent.slice(0, 5));
    }
  }, []);

  // Inicializar con query de URL si existe
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  // Buscar sugerencias cuando cambia el query
  // Buscar sugerencias reales de la API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true);

    try {
      // Buscar productos que coincidan
      const productsRes = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=3`
      );
      const productsData = await productsRes.json();
      const products = productsData.data?.data || [];

      // Obtener categorías para filtrar
      const categoriesRes = await fetch("/api/categories");
      const categoriesData = await categoriesRes.json();
      const categories = categoriesData.data?.data || [];

      const suggestionsList: SearchSuggestion[] = [];

      // Agregar productos encontrados
      products.forEach((product: Product) => {
        suggestionsList.push({
          id: product.id,
          type: "product",
          text: product.name,
          subtitle: product.categories?.name || "Producto",
          rating: product.rating || undefined,
          price: product.price,
          href: `/productos/${product.id}`,
        });
      });

      // Agregar categorías que coincidan
      const matchingCategories = categories.filter(
        (cat: { id: string; name: string }) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      matchingCategories.forEach((cat: { id: string; name: string }) => {
        suggestionsList.push({
          id: cat.id,
          type: "category",
          text: cat.name,
          subtitle: `Categoría`,
          href: `/productos?category=${cat.id}`,
        });
      });

      setSuggestions(suggestionsList.slice(0, 6));
    } catch (error) {
      logger.error("Error fetching suggestions", { error });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Manejar envío de búsqueda
  const handleSearch = useCallback(
    (searchQuery: string = query) => {
      if (!searchQuery.trim()) {
        return;
      }

      // Guardar en búsquedas recientes
      const newRecent = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));

      // Ejecutar búsqueda
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/productos?q=${encodeURIComponent(searchQuery)}`);
      }

      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    [query, recentSearches, onSearch, router]
  );

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      return;
    }

    const totalSuggestions =
      suggestions.length +
      (showRecent ? recentSearches.length : 0) +
      (showTrending ? trendingSearches.length : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalSuggestions);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? totalSuggestions - 1 : prev - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          let currentIndex = 0;

          if (selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            if (suggestion.href) {
              router.push(suggestion.href);
            } else {
              handleSearch(suggestion.text);
            }
            return;
          }
          currentIndex += suggestions.length;

          if (
            showRecent &&
            selectedIndex < currentIndex + recentSearches.length
          ) {
            const recentIndex = selectedIndex - currentIndex;
            handleSearch(recentSearches[recentIndex]);
            return;
          }
          currentIndex += recentSearches.length;

          if (
            showTrending &&
            selectedIndex < currentIndex + trendingSearches.length
          ) {
            const trendingIndex = selectedIndex - currentIndex;
            handleSearch(trendingSearches[trendingIndex]);
            return;
          }
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Eliminar búsqueda reciente
  const removeRecentSearch = (searchToRemove: string) => {
    const newRecent = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  // Tamaños
  const sizes = {
    sm: {
      input: "px-4 py-2 text-sm",
      icon: "w-4 h-4",
      container: "max-w-md",
    },
    md: {
      input: "px-4 py-3 text-base",
      icon: "w-5 h-5",
      container: "max-w-lg",
    },
    lg: {
      input: "px-6 py-4 text-lg",
      icon: "w-6 h-6",
      container: "max-w-2xl",
    },
  };

  return (
    <div className={`relative ${sizes[size].container} ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className={`${sizes[size].icon} muted animate-spin`} />
          ) : (
            <Search className={`${sizes[size].icon} muted`} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full ${sizes[size].input} pl-10 pr-10
            border border-surface-secondary rounded-lg
            focus:ring-2 focus:ring-pink-500 focus:border-pink-500
            bg-white text-primary placeholder-muted
            transition-colors
          `}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
          >
            <X className={`${sizes[size].icon} muted hover:text-primary`} />
          </button>
        )}
      </div>

      {/* Panel de sugerencias */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Sugerencias de productos y categorías */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium muted px-3 py-2 border-b border-surface-secondary">
                  Sugerencias
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => {
                      if (suggestion.href) {
                        router.push(suggestion.href);
                      } else {
                        handleSearch(suggestion.text);
                      }
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors
                      ${selectedIndex === index ? "bg-pink-50 text-pink-700" : "hover:bg-surface text-primary"}
                    `}
                  >
                    <div className="shrink-0">
                      {suggestion.type === "product" ? (
                        <Tag className="w-4 h-4 muted" />
                      ) : (
                        <Tag className="w-4 h-4 muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-xs muted">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>

                    {suggestion.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-warning fill-current" />
                        <span className="text-xs muted">
                          {suggestion.rating}
                        </span>
                      </div>
                    )}

                    {suggestion.price && (
                      <div className="text-sm font-medium text-primary">
                        ${suggestion.price.toLocaleString()}
                      </div>
                    )}

                    <ChevronRight className="w-4 h-4 muted" />
                  </button>
                ))}
              </div>
            )}

            {/* Búsquedas recientes */}
            {showRecent && recentSearches.length > 0 && (
              <div className="p-2 border-t border-surface-secondary">
                <div className="text-xs font-medium muted px-3 py-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Búsquedas recientes
                </div>
                {recentSearches.map((recentSearch, index) => {
                  const currentIndex = suggestions.length + index;
                  return (
                    <div
                      key={recentSearch}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-md transition-colors
                        ${selectedIndex === currentIndex ? "bg-pink-50" : "hover:bg-surface"}
                      `}
                    >
                      <button
                        onClick={() => handleSearch(recentSearch)}
                        className="flex-1 flex items-center space-x-2 text-left"
                      >
                        <Clock className="w-4 h-4 muted" />
                        <span className="text-sm text-primary">
                          {recentSearch}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(recentSearch);
                        }}
                        className="p-1 hover:bg-surface rounded"
                      >
                        <X className="w-3 h-3 muted" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Búsquedas trending */}
            {showTrending &&
              (!query || query.length < 2) &&
              trendingSearches.length > 0 && (
                <div className="p-2 border-t border-surface-secondary">
                  <div className="text-xs font-medium muted px-3 py-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Búsquedas populares
                  </div>
                  {trendingSearches.map(
                    (trendingSearch: string, index: number) => {
                      const currentIndex =
                        suggestions.length + recentSearches.length + index;
                      return (
                        <button
                          key={trendingSearch}
                          onClick={() => handleSearch(trendingSearch)}
                          className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors
                        ${selectedIndex === currentIndex ? "bg-pink-50 text-pink-700" : "hover:bg-surface text-primary"}
                      `}
                        >
                          <TrendingUp className="w-4 h-4 muted" />
                          <span className="text-sm">{trendingSearch}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}

            {/* Sin resultados */}
            {query &&
              query.length >= 2 &&
              suggestions.length === 0 &&
              !isLoading && (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 muted mx-auto mb-2" />
                  <p className="text-sm muted">No se encontraron sugerencias</p>
                  <button
                    onClick={() => handleSearch()}
                    className="mt-2 text-sm text-pink-600 hover:text-pink-700"
                  >
                    Buscar "{query}" en todos los productos
                  </button>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar en mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
