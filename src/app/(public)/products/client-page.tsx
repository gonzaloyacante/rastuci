"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";

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
import { Product } from "@/types";

import {
  buildProductsApiUrl,
  buildProductsPageUrl,
  fetcher,
  ProductsPageClientProps,
  SORT_OPTIONS,
} from "./productsUtils";

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function ProductsPageClient({
  searchParams,
}: ProductsPageClientProps) {
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Local states
  const [viewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.buscar || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.categoria || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.sortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    searchParams.sortOrder || "desc"
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.pagina) || 1
  );
  const isPageNavigationRef = useRef(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build API URL
  const apiUrl = useMemo(
    () =>
      buildProductsApiUrl({
        page: currentPage,
        sortBy,
        sortOrder,
        search: debouncedSearch,
        categoryId: selectedCategory,
      }),
    [currentPage, sortBy, sortOrder, debouncedSearch, selectedCategory]
  );

  // Update URL when filters change
  useEffect(() => {
    const newUrl = buildProductsPageUrl({
      search: debouncedSearch,
      category: selectedCategory,
      sortBy,
      sortOrder,
      page: currentPage,
    });

    // If this navigation was triggered by a page change, perform the
    // router.replace without scrolling and then animate a smooth scroll
    // to top once the replace completes. This avoids fighting Next.js
    // default scroll behavior while keeping the UX smooth.
    // router.replace does not always return a Promise in this runtime,
    // so just call replace and rely on the pathname observer below
    // to trigger the smooth scroll when the navigation completes.
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    selectedCategory,
    sortBy,
    sortOrder,
    currentPage,
    router,
  ]);

  // Observe search params changes (query string) to trigger scroll after
  // navigation completes. We watch the serialized search params because
  // pagination updates only change the query (e.g. ?pagina=2) and not the
  // pathname.
  const searchParamsNav = useSearchParams();
  const serializedSearch = searchParamsNav ? searchParamsNav.toString() : "";
  useEffect(() => {
    if (isPageNavigationRef.current) {
      try {
        // Primero intentamos un scroll suave para la UX,
        // luego forzamos la posición a 0 tras 400ms para asegurar
        // que quede *literalmente* arriba incluso con headers sticky.
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          try {
            window.scrollTo(0, 0);
          } catch {}
        }, 700);
      } finally {
        isPageNavigationRef.current = false;
      }
    }
  }, [serializedSearch]);

  // Fetch products with SWR
  const { data, isLoading, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const products: Product[] = data?.data?.data || [];
  const totalProducts = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  // Handlers
  const handleSearch = () => setCurrentPage(1);
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };
  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    isPageNavigationRef.current = true;
    setCurrentPage(page);
  };
  const clearFilters = () => {
    setSearchInput("");
    setSelectedCategory("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Memoized options
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Todas las categorías" },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories]
  );

  const hasActiveFilters = Boolean(debouncedSearch || selectedCategory);
  const sortValue = `${sortBy}-${sortOrder}`;

  // Count active filters

  // Filter chips for mobile
  const filterChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch) {
      chips.push({
        id: "search",
        label: `Búsqueda: "${debouncedSearch}"`,
        onRemove: () => setSearchInput(""),
      });
    }
    if (selectedCategory) {
      const categoryName =
        categories.find((c) => c.id === selectedCategory)?.name || "";
      chips.push({
        id: "category",
        label: categoryName,
        onRemove: () => setSelectedCategory(""),
      });
    }
    return chips;
  }, [debouncedSearch, selectedCategory, categories]);

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
          currentPage={currentPage}
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
                onSearch={handleSearch}
                categoryOptions={categoryOptions}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                sortOptions={SORT_OPTIONS}
                sortValue={sortValue}
                onSortChange={handleSortChange}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
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
            onSearch={handleSearch}
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
          onSearch={handleSearch}
          categoryOptions={categoryOptions}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          sortOptions={SORT_OPTIONS}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          onApply={() => setCurrentPage(1)}
        />
      </div>
    </div>
  );
}
