"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import ProductCard from "@/components/products/cards/ProductCard";
import { MobileFiltersSheet } from "@/components/products/filters/MobileFiltersSheet";
import {
  ActiveFilterChips,
  EmptyProductsState,
  FilterSidebar,
  Pagination,
  ProductGrid,
  ProductGridSkeleton,
  ProductsCountLabel,
  SearchInput,
} from "@/components/products/list/ProductListComponents";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategories } from "@/hooks/useCategories";
import { useProductFacets } from "@/hooks/useProductFacets";
import { useProductSearch } from "@/hooks/useProductSearch";

import { ProductsPageClientProps, SORT_OPTIONS } from "./productsUtils";

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function ProductsPageClient({
  searchParams,
}: ProductsPageClientProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { sizes: availableSizes, colors: availableColors } = useProductFacets();
  const [viewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    products,
    totalProducts,
    totalPages,
    isLoading,
    error,
    filters,
    searchInput,
    sortValue,
    hasActiveFilters,
    setSearchInput,
    handleSearchSubmit,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
    handlePriceChange,
    handleSizeToggle,
    handleColorToggle,
    handleRatingChange,
    clearFilters,
    buildFilterChips,
  } = useProductSearch(searchParams);

  // Category options for the sidebar/sheet selectors
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Todas las categorías" },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories]
  );

  // Map hook chips (data-only) to UI chips (with onRemove callbacks)
  const filterChips = useMemo(() => {
    const chips = buildFilterChips(categoryOptions);
    return chips.map((chip) => ({
      ...chip,
      onRemove: () => {
        if (chip.id === "search") setSearchInput("");
        else if (chip.id === "category") handleCategoryChange("");
        else if (chip.id === "price") {
          handlePriceChange("", "");
        } else if (chip.id.startsWith("size-")) {
          handleSizeToggle(chip.id.replace("size-", ""));
        } else if (chip.id.startsWith("color-")) {
          handleColorToggle(chip.id.replace("color-", ""));
        } else if (chip.id === "rating") {
          handleRatingChange(filters.minRating);
        }
      },
    }));
  }, [
    buildFilterChips,
    categoryOptions,
    filters.minRating,
    setSearchInput,
    handleCategoryChange,
    handlePriceChange,
    handleSizeToggle,
    handleColorToggle,
    handleRatingChange,
  ]);

  // Loading state
  if (categoriesLoading) {
    return (
      <div className="min-h-screen surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-error mb-4">
              Error al cargar productos
            </h1>
            <p className="muted mb-4">
              Ocurrió un problema al cargar los productos. Inténtalo nuevamente.
            </p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  // Product list renderer (shared between mobile and desktop)
  const renderProducts = (isMobile = false) => {
    if (isLoading) return <ProductGridSkeleton />;

    if (products.length === 0) {
      return (
        <EmptyProductsState
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      );
    }

    return (
      <>
        <ProductGrid viewMode={viewMode} isMobile={isMobile}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={viewMode}
              priority={index < 4}
            />
          ))}
        </ProductGrid>

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={totalProducts}
          onPageChange={handlePageChange}
          size={isMobile ? "sm" : "md"}
          maxVisiblePages={isMobile ? 3 : 5}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-8 items-start">
            {/* Sidebar */}
            <aside className="w-96 shrink-0 sticky top-20">
              <FilterSidebar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onSearch={handleSearchSubmit}
                categoryOptions={categoryOptions}
                selectedCategory={filters.categoryId}
                onCategoryChange={handleCategoryChange}
                sortOptions={SORT_OPTIONS}
                sortValue={sortValue}
                onSortChange={handleSortChange}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={handlePriceChange}
                selectedSizes={filters.sizes}
                onSizeToggle={handleSizeToggle}
                availableSizes={availableSizes}
                selectedColors={filters.colors}
                onColorToggle={handleColorToggle}
                availableColors={availableColors}
                minRating={filters.minRating}
                onRatingChange={handleRatingChange}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <ProductsCountLabel
                  isLoading={isLoading}
                  count={totalProducts}
                />
                {/* ViewModeToggle comentado - siempre cuadrícula */}
                {/* <ViewModeToggle
                  viewMode={viewMode}
                  onChange={setViewMode}
                  showLabel
                /> */}
              </div>
              {renderProducts(false)}
            </main>
          </div>
        </div>

        {/* Mobile & Tablet Layout */}
        <div className="lg:hidden space-y-3">
          {/* Search Bar */}
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearchSubmit}
          />

          {/* Filter & Sort Row */}
          <div className="flex items-center gap-2">
            {/* Filtrar button with active count badge */}
            <button
              onClick={() => setFiltersOpen(true)}
              className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                hasActiveFilters
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "surface border-muted text-base-secondary hover:border-primary hover:text-primary"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtrar</span>
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[11px] font-bold leading-none">
                  {filterChips.length}
                </span>
              )}
            </button>

            {/* Sort pills – horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto flex-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
                    sortValue === option.value
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "surface border-muted text-base-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <ActiveFilterChips chips={filterChips} />
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
                Limpiar todo
              </button>
            </div>
          )}

          {/* Products Count & View Toggle */}
          <div className="flex justify-between items-center">
            <ProductsCountLabel isLoading={isLoading} count={totalProducts} />
            {/* ViewModeToggle comentado - siempre cuadrícula */}
            {/* <ViewModeToggle viewMode={viewMode} onChange={setViewMode} /> */}
          </div>

          {/* Products */}
          {renderProducts(true)}
        </div>

        {/* Mobile Filters Bottom Sheet */}
        <MobileFiltersSheet
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearch={handleSearchSubmit}
          categoryOptions={categoryOptions}
          selectedCategory={filters.categoryId}
          onCategoryChange={handleCategoryChange}
          sortOptions={SORT_OPTIONS}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onApply={() => handlePageChange(1)}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onPriceChange={handlePriceChange}
          selectedSizes={filters.sizes}
          onSizeToggle={handleSizeToggle}
          availableSizes={availableSizes}
          selectedColors={filters.colors}
          onColorToggle={handleColorToggle}
          availableColors={availableColors}
          minRating={filters.minRating}
          onRatingChange={handleRatingChange}
        />
      </div>
    </div>
  );
}
