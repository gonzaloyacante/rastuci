"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination as UIPagination } from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Grid, List, ShoppingCart } from "lucide-react";
import { ReactNode } from "react";

// ==============================================================================
// ProductGridSkeleton
// ==============================================================================
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}

// ==============================================================================
// EmptyProductsState
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
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 surface rounded-full flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 muted" />
      </div>
      <h3 className="text-xl font-medium text-primary mb-2">
        No se encontraron productos
      </h3>
      <p className="muted mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Intenta ajustar los filtros de búsqueda o explorar otras categorías"
          : "No hay productos disponibles en este momento"}
      </p>
      {hasFilters && (
        <Button onClick={onClearFilters} variant="hero">
          Ver todos los productos
        </Button>
      )}
    </div>
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
    <div className="space-y-1">
      {options.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelect(category.value)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            selected === category.value
              ? "bg-primary text-white shadow-sm"
              : "text-gray-900 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-primary"
          }`}
        >
          {category.label}
          {selected === category.value && (
            <span className="float-right">✓</span>
          )}
        </button>
      ))}
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
}: FilterSidebarProps) {
  return (
    <div className="surface border border-muted rounded-lg p-6">
      <h2 className="text-lg font-semibold text-primary mb-6">Filtros</h2>

      {/* Búsqueda */}
      <div className="mb-6">
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
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-2">
          Categoría
        </label>
        <CategoryButtons
          options={categoryOptions}
          selected={selectedCategory}
          onSelect={onCategoryChange}
        />
      </div>

      {/* Ordenar */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-2">
          Ordenar por
        </label>
        <Select
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
          placeholder="Ordenar por"
        />
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-muted">
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
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
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
    return (
      <span className="text-sm muted animate-pulse">Cargando productos...</span>
    );
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
