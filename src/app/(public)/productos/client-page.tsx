"use client";

import ProductCard from "@/components/products/ProductCard";
import {
  ActiveFilterChips,
  EmptyProductsState,
  FilterSidebar,
  Pagination,
  ProductGrid,
  ProductGridSkeleton,
  ProductsCountLabel,
  SearchInput,
  ViewModeToggle,
} from "@/components/products/ProductListComponents";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

// ==============================================================================
// TYPES & CONSTANTS
// ==============================================================================
interface ProductsPageClientProps {
  searchParams: {
    categoria?: string;
    buscar?: string;
    pagina?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "🆕 Más recientes" },
  { value: "price-asc", label: "💰 Precio: menor a mayor" },
  { value: "price-desc", label: "💎 Precio: mayor a menor" },
  { value: "rating-desc", label: "⭐ Mejor valorados" },
  { value: "name-asc", label: "🔤 Nombre: A-Z" },
  { value: "name-desc", label: "🔤 Nombre: Z-A" },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function ProductsPageClient({
  searchParams,
}: ProductsPageClientProps) {
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Local states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "12");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    return `/api/products?${params.toString()}`;
  }, [currentPage, sortBy, sortOrder, debouncedSearch, selectedCategory]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("buscar", debouncedSearch);
    if (selectedCategory) params.set("categoria", selectedCategory);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("pagina", currentPage.toString());

    const newUrl = params.toString()
      ? `/productos?${params.toString()}`
      : "/productos";
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    selectedCategory,
    sortBy,
    sortOrder,
    currentPage,
    router,
  ]);

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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="h-8 surface-secondary rounded animate-pulse w-48 mb-4" />
            <div className="h-4 surface-secondary rounded animate-pulse w-full max-w-md" />
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={viewMode}
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Controls */}
        <div className="mb-6 lg:hidden">
          <div className="mb-4">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Categoría"
              />
            </div>
            <div className="flex-1">
              <Select
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={handleSortChange}
                placeholder="Ordenar"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-8 min-h-screen">
            {/* Sidebar */}
            <aside className="w-80 shrink-0">
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
                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={setViewMode}
                  showLabel
                />
              </div>
              {renderProducts(false)}
            </main>
          </div>
        </div>

        {/* Mobile Filter Chips */}
        {hasActiveFilters && (
          <div className="mb-6 lg:hidden">
            <ActiveFilterChips chips={filterChips} />
          </div>
        )}

        {/* Mobile Products Grid */}
        <div className="lg:hidden">{renderProducts(true)}</div>
      </div>
    </div>
  );
}
