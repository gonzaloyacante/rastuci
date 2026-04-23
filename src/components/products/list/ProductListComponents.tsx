"use client";

import { Check, Grid, List, ShoppingCart, Star } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination as UIPagination } from "@/components/ui/Pagination";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { getColorHex, isLightColor } from "@/utils/colors";

// ==============================================================================
// EmptyProductsState
// Usa el EmptyState compartido para evitar duplicación
// ==============================================================================
interface EmptyProductsStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyProductsState({
  hasFilters,
  onClearFilters,
}: EmptyProductsStateProps) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="No se encontraron productos"
      description={
        hasFilters
          ? "Intenta ajustar los filtros de búsqueda o explorar otras categorías"
          : "No hay productos disponibles en este momento"
      }
      actionText={hasFilters ? "Ver todos los productos" : undefined}
      onAction={hasFilters ? onClearFilters : undefined}
    />
  );
}

// ==============================================================================
// ViewModeToggle
// ==============================================================================
interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  showLabel?: boolean;
}

export function ViewModeToggle({
  viewMode,
  onChange,
  showLabel = false,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className="text-sm muted mr-2">Vista:</span>}
      <button
        onClick={() => onChange("grid")}
        className={`p-2 rounded-lg transition-all duration-200 border ${
          viewMode === "grid"
            ? "bg-primary text-white border-primary"
            : "surface muted border-transparent hover:border-primary hover:text-primary hover:bg-primary/10"
        }`}
        title="Vista de cuadrícula"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-2 rounded-lg transition-all duration-200 border ${
          viewMode === "list"
            ? "bg-primary text-white border-primary"
            : "surface muted border-transparent hover:border-primary hover:text-primary hover:bg-primary/10"
        }`}
        title="Vista de lista"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==============================================================================
// Pagination - Wrapper del componente UI reutilizable
// ==============================================================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "md";
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  size = "md",
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="space-y-4">
      <UIPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showFirstLast={totalPages > 5}
        maxVisiblePages={maxVisiblePages}
      />

      <div
        className={`text-center ${size === "sm" ? "text-xs" : "text-sm"} muted`}
      >
        Página {currentPage} de {totalPages} - {totalItems} productos
        {size === "md" && " en total"}
      </div>
    </div>
  );
}

// ==============================================================================
// SearchInput
// ==============================================================================
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar productos...",
}: SearchInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        className="text-sm flex-1"
      />
      <Button onClick={onSearch} variant="outline" size="sm">
        Buscar
      </Button>
    </div>
  );
}

// ==============================================================================
// CategoryButtons
// ==============================================================================
interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryButtonsProps {
  options: CategoryOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function CategoryButtons({
  options,
  selected,
  onSelect,
}: CategoryButtonsProps) {
  return (
    <div className="space-y-0.5">
      {options.map((category) => {
        const isActive = selected === category.value;
        return (
          <button
            key={category.value}
            onClick={() => onSelect(category.value)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-between ${
              isActive
                ? "bg-primary-50 text-primary-700 border border-primary-200"
                : "muted hover:bg-primary-50/50 hover:text-primary-600"
            }`}
          >
            <span>{category.label}</span>
            {isActive && <Check className="w-4 h-4 text-primary-500" />}
          </button>
        );
      })}
    </div>
  );
}

// ==============================================================================
// FilterSidebar
// ==============================================================================
interface FilterSidebarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  categoryOptions: CategoryOption[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortOptions: CategoryOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  // New filter props
  minPrice: string;
  maxPrice: string;
  onPriceChange: (minPrice: string, maxPrice: string) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  availableSizes: string[];
  selectedColors: string[];
  onColorToggle: (color: string) => void;
  availableColors: string[];
  minRating: number;
  onRatingChange: (rating: number) => void;
}

export function FilterSidebar({
  searchValue,
  onSearchChange,
  onSearch,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  sortOptions,
  sortValue,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedSizes,
  onSizeToggle,
  availableSizes,
  selectedColors,
  onColorToggle,
  availableColors,
  minRating,
  onRatingChange,
}: FilterSidebarProps) {
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  const applyPrice = () => {
    onPriceChange(localMin, localMax);
  };

  return (
    <div className="surface border border-muted rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-primary">Filtros</h2>

      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Buscar productos
        </label>
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder="Nombre, descripción..."
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Categoría
        </label>
        <CategoryButtons
          options={categoryOptions}
          selected={selectedCategory}
          onSelect={onCategoryChange}
        />
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Precio
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Mín"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-muted surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted"
          />
          <span className="text-muted text-sm shrink-0">—</span>
          <input
            type="number"
            min={0}
            placeholder="Máx"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="w-full px-3 py-2 text-sm rounded-lg border border-muted surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted"
          />
        </div>
      </div>

      {/* Talles */}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Talle
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((size) => {
              const isActive = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onSizeToggle(size)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "surface text-primary border-muted hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colores */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const hex = getColorHex(color);
              const isLight = isLightColor(hex);
              const isActive = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => onColorToggle(color)}
                  title={color.charAt(0).toUpperCase() + color.slice(1)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 border-transparent"
                      : isLight
                        ? "border-muted hover:border-primary"
                        : "border-transparent hover:border-primary"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Calificación mínima
        </label>
        <div className="flex gap-1.5">
          {[2, 3, 4, 5].map((stars) => {
            const isActive = minRating === stars;
            return (
              <button
                key={stars}
                onClick={() => onRatingChange(stars)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "surface text-primary border-muted hover:border-primary"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                {stars}+
              </button>
            );
          })}
        </div>
      </div>

      {/* Ordenar */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Ordenar por
        </label>
        <CategoryButtons
          options={sortOptions}
          selected={sortValue}
          onSelect={onSortChange}
        />
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-muted">
          <Button onClick={onClearFilters} variant="outline" fullWidth>
            Limpiar todos los filtros
          </Button>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// ActiveFilterChips
// ==============================================================================
interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
}

export function ActiveFilterChips({ chips }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full surface text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
        >
          <span>{chip.label}</span>
          <span>×</span>
        </button>
      ))}
    </div>
  );
}

// ==============================================================================
// ProductGrid
// ==============================================================================
interface ProductGridProps {
  viewMode: "grid" | "list";
  children: ReactNode;
  isMobile?: boolean;
}

export function ProductGrid({
  viewMode,
  children,
  isMobile = false,
}: ProductGridProps) {
  const gridClasses =
    viewMode === "grid"
      ? isMobile
        ? "grid-cols-2 md:grid-cols-2"
        : "grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      : isMobile
        ? "grid-cols-1 max-w-2xl mx-auto"
        : "grid-cols-1 max-w-4xl";

  return (
    <div className={`grid gap-3 sm:gap-6 mb-8 ${gridClasses}`}>{children}</div>
  );
}

// ==============================================================================
// ProductsCountLabel
// ==============================================================================
interface ProductsCountLabelProps {
  isLoading: boolean;
  count: number;
}

export function ProductsCountLabel({
  isLoading,
  count,
}: ProductsCountLabelProps) {
  if (isLoading) {
    return <Skeleton className="h-5 w-40" />;
  }

  return (
    <span className="text-sm muted">
      {count === 0
        ? "No se encontraron productos"
        : count === 1
          ? "1 producto encontrado"
          : `${count} productos encontrados`}
    </span>
  );
}

// ==============================================================================
// ProductGridSkeleton
// ==============================================================================
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`product-skeleton-${i}`} />
      ))}
    </div>
  );
}
