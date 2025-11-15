"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/Input"; // TODO: Implement when needed
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Filter, Star, X } from "lucide-react";

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  rating: number;
  inStock: boolean;
  onSale: boolean;
  sortBy: "price-asc" | "price-desc" | "rating" | "newest" | "popularity";
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  availableBrands: string[];
  priceRange: [number, number];
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableBrands,
  priceRange,
  className = "",
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange,
      categories: [],
      brands: [],
      rating: 0,
      inStock: false,
      onSale: false,
      sortBy: "popularity",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) {
      count++;
    }
    if (localFilters.brands.length > 0) {
      count++;
    }
    if (localFilters.rating > 0) {
      count++;
    }
    if (localFilters.inStock) {
      count++;
    }
    if (localFilters.onSale) {
      count++;
    }
    if (
      localFilters.priceRange[0] > priceRange[0] ||
      localFilters.priceRange[1] < priceRange[1]
    ) {
      count++;
    }
    return count;
  };

  const sortOptions = [
    { value: "popularity", label: "Más Popular" },
    { value: "newest", label: "Más Reciente" },
    { value: "price-asc", label: "Precio: Menor a Mayor" },
    { value: "price-desc", label: "Precio: Mayor a Menor" },
    { value: "rating", label: "Mejor Valorado" },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {getActiveFiltersCount() > 0 && (
          <Badge variant="default" className="ml-1">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 surface border border-muted rounded-lg shadow-lg z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filtros</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ordenar por
              </label>
              <Select
                options={sortOptions}
                value={localFilters.sortBy}
                onChange={(value: string) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    sortBy: value as
                      | "popularity"
                      | "newest"
                      | "price-asc"
                      | "price-desc"
                      | "rating",
                  }))
                }
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Rango de Precio: ${localFilters.priceRange[0]} - $
                {localFilters.priceRange[1]}
              </label>
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    priceRange: value as [number, number],
                  }))
                }
                min={priceRange[0]}
                max={priceRange[1]}
                step={10}
                className="w-full"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Valoración mínima
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        rating: prev.rating === rating ? 0 : rating,
                      }))
                    }
                    className={`p-1 rounded ${
                      rating <= localFilters.rating ? "text-warning" : "muted"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categorías
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <Checkbox
                      checked={localFilters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters((prev) => ({
                            ...prev,
                            categories: [...prev.categories, category],
                          }));
                        } else {
                          setLocalFilters((prev) => ({
                            ...prev,
                            categories: prev.categories.filter(
                              (c) => c !== category
                            ),
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <label className="block text-sm font-medium mb-2">Marcas</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2">
                    <Checkbox
                      checked={localFilters.brands.includes(brand)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalFilters((prev) => ({
                            ...prev,
                            brands: [...prev.brands, brand],
                          }));
                        } else {
                          setLocalFilters((prev) => ({
                            ...prev,
                            brands: prev.brands.filter((b) => b !== brand),
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock & Sale Filters */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={localFilters.inStock}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, inStock: !!checked }))
                  }
                />
                <span className="text-sm">Solo productos en stock</span>
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={localFilters.onSale}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, onSale: !!checked }))
                  }
                />
                <span className="text-sm">Solo productos en oferta</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-muted">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Limpiar
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {localFilters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {category}
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    categories: prev.categories.filter((c) => c !== category),
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {localFilters.brands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {brand}
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    brands: prev.brands.filter((b) => b !== brand),
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {localFilters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {localFilters.rating}+ estrellas
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, rating: 0 }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {localFilters.inStock && (
            <Badge variant="secondary" className="flex items-center gap-1">
              En stock
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, inStock: false }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {localFilters.onSale && (
            <Badge variant="secondary" className="flex items-center gap-1">
              En oferta
              <button
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, onSale: false }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
