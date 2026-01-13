"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronDown, Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  categories: Category[];
  onSearch: (query: string) => void;
  onCategoryFilter: (categoryId: string | null) => void;
  onSortChange: (sort: string) => void;
  onPriceFilter: (min: number | null, max: number | null) => void;
  currentSearch?: string;
  currentCategory?: string | null;
  currentSort?: string;
  currentPriceRange?: { min: number | null; max: number | null };
}

export function SearchFilters({
  categories,
  onSearch,
  onCategoryFilter,
  onSortChange,
  onPriceFilter,
  currentSearch = "",
  currentCategory = null,
  currentSort = "newest",
  currentPriceRange = { min: null, max: null },
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(
    currentPriceRange.min?.toString() || ""
  );
  const [priceMax, setPriceMax] = useState(
    currentPriceRange.max?.toString() || ""
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handlePriceFilter = () => {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    onPriceFilter(min, max);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceMin("");
    setPriceMax("");
    onSearch("");
    onCategoryFilter(null);
    onSortChange("newest");
    onPriceFilter(null, null);
  };

  const hasActiveFilters =
    currentSearch ||
    currentCategory ||
    currentPriceRange.min !== null ||
    currentPriceRange.max !== null;

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          aria-label="Buscar productos"
        />
        <Button type="submit" aria-label="Ejecutar búsqueda">
          Buscar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </Button>
      </form>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="surface border border-muted rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-error hover:text-error"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categoría
              </label>
              <select
                value={currentCategory || ""}
                onChange={(e) => onCategoryFilter(e.target.value || null)}
                className="w-full px-3 py-2 surface border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por precio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Rango de precio
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  onBlur={handlePriceFilter}
                  min="0"
                  step="0.01"
                  aria-label="Precio mínimo"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  onBlur={handlePriceFilter}
                  min="0"
                  step="0.01"
                  aria-label="Precio máximo"
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ordenar por
              </label>
              <select
                value={currentSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-3 py-2 surface border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label="Ordenar productos"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentSearch && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm surface border border-muted">
              Búsqueda: "{currentSearch}"
              <Button
                onClick={() => onSearch("")}
                variant="ghost"
                className="ml-2 text-error hover:text-error p-0 h-auto min-h-0 min-w-0 hover:bg-transparent"
                aria-label="Quitar filtro de búsqueda"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
          {currentCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm surface border border-muted">
              Categoría:{" "}
              {categories.find((c) => c.id === currentCategory)?.name}
              <Button
                onClick={() => onCategoryFilter(null)}
                variant="ghost"
                className="ml-2 text-error hover:text-error p-0 h-auto min-h-0 min-w-0 hover:bg-transparent"
                aria-label="Quitar filtro de categoría"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
          {(currentPriceRange.min !== null ||
            currentPriceRange.max !== null) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm surface border border-muted">
              Precio: {currentPriceRange.min || 0} -{" "}
              {currentPriceRange.max || "∞"}
              <Button
                onClick={() => onPriceFilter(null, null)}
                variant="ghost"
                className="ml-2 text-error hover:text-error p-0 h-auto min-h-0 min-w-0 hover:bg-transparent"
                aria-label="Quitar filtro de precio"
              >
                <X className="w-3 h-3" />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
