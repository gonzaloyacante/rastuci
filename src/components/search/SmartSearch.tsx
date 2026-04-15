"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Search,
  Star,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { Suspense } from "react";

import { LoadingSpinner } from "@/components/ui/Spinner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, FADE_IN_DOWN } from "@/lib/animations";

import { useSmartSearch } from "./useSmartSearch";

interface SmartSearchProps {
  placeholder?: string;
  showTrending?: boolean;
  showRecent?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onSearch?: (query: string) => void;
}

const sizes = {
  sm: { input: "px-4 py-2 text-sm", icon: "w-4 h-4", container: "max-w-md" },
  md: { input: "px-4 py-3 text-base", icon: "w-5 h-5", container: "max-w-lg" },
  lg: { input: "px-6 py-4 text-lg", icon: "w-6 h-6", container: "max-w-2xl" },
};

function SmartSearchContent({
  placeholder = "Buscar productos...",
  showTrending = true,
  showRecent = true,
  className = "",
  size = "md",
  onSearch,
}: SmartSearchProps) {
  const reduceMotion = useReducedMotion();
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    isLoading,
    suggestions,
    selectedIndex,
    recentSearches,
    trendingSearches,
    inputRef,
    handleSearch,
    handleKeyDown,
    clearSearch,
    removeRecentSearch,
  } = useSmartSearch({ showTrending, showRecent, onSearch });

  const sz = sizes[size];

  return (
    <div className={`relative ${sz.container} ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <LoadingSpinner size="sm" className="muted" />
          ) : (
            <Search className={`${sz.icon} muted`} />
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
          className={`w-full ${sz.input} pl-10 pr-10 border border-surface-secondary rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white text-primary placeholder-muted transition-colors`}
        />

        {query && (
          <button
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
          >
            <X className={`${sz.icon} muted hover:text-primary`} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={FADE_IN_DOWN}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : DURATION.FAST }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
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
                        window.location.href = suggestion.href;
                      } else {
                        handleSearch(suggestion.text);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${selectedIndex === index ? "bg-pink-50 text-pink-700" : "hover:bg-surface text-primary"}`}
                  >
                    <div className="shrink-0">
                      <Tag className="w-4 h-4 muted" />
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
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${selectedIndex === currentIndex ? "bg-pink-50" : "hover:bg-surface"}`}
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
                        aria-label={`Eliminar búsqueda: ${recentSearch}`}
                      >
                        <X className="w-3 h-3 muted" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {showTrending &&
              (!query || query.length < 2) &&
              trendingSearches.length > 0 && (
                <div className="p-2 border-t border-surface-secondary">
                  <div className="text-xs font-medium muted px-3 py-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Búsquedas populares
                  </div>
                  {trendingSearches.map((trendingSearch, index) => {
                    const currentIndex =
                      suggestions.length + recentSearches.length + index;
                    return (
                      <button
                        key={trendingSearch}
                        onClick={() => handleSearch(trendingSearch)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${selectedIndex === currentIndex ? "bg-pink-50 text-pink-700" : "hover:bg-surface text-primary"}`}
                      >
                        <TrendingUp className="w-4 h-4 muted" />
                        <span className="text-sm">{trendingSearch}</span>
                      </button>
                    );
                  })}
                </div>
              )}

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
                    Buscar &quot;{query}&quot; en todos los productos
                  </button>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="button"
          tabIndex={0}
          aria-label="Cerrar búsqueda"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function SmartSearch(props: SmartSearchProps) {
  return (
    <Suspense fallback={null}>
      <SmartSearchContent {...props} />
    </Suspense>
  );
}
