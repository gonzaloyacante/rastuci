"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import useSWR from "swr";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product, Category } from "@/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Grid, List, ShoppingCart, Search } from "lucide-react";
import Select from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPriceARS as _formatPriceARS } from "@/utils/formatters";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton as UISkeletonProductCard } from "@/components/ui/Skeleton";

function _ProductsPageSkeleton() {
  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 rounded mb-2 animate-pulse surface" />
          <div className="h-4 rounded animate-pulse surface" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <aside className="hidden lg:flex lg:w-1/4">
            <div className="w-full space-y-6">
              <div className="h-6 rounded mb-4 animate-pulse surface" />
              <div>
                <div className="h-4 rounded mb-2 animate-pulse surface" />
                <div className="h-10 rounded animate-pulse surface" />
              </div>
              <div>
                <div className="h-4 rounded mb-2 animate-pulse surface" />
                <div className="h-10 rounded animate-pulse surface" />
              </div>
              <div>
                <div className="h-4 rounded mb-2 animate-pulse surface" />
                <div className="h-10 rounded animate-pulse surface" />
              </div>
            </div>
          </aside>

          <div className="hidden lg:block border-l border-muted mx-6"></div>

          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 rounded animate-pulse w-32 surface" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded animate-pulse surface" />
                <div className="h-8 w-8 rounded animate-pulse surface" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg shadow-sm overflow-hidden surface"
                >
                  <div className="aspect-square animate-pulse surface" />
                  <div className="p-4">
                    <div className="h-5 rounded mb-2 animate-pulse surface" />
                    <div className="h-6 rounded mb-4 animate-pulse surface" />
                    <div className="h-10 rounded animate-pulse surface" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Componente que usa useSearchParams
function ProductsContent() {
  const { show } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  // Accumulated product list for "Load more"
  const [productList, setProductList] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const _searchParams = useSearchParams();

  // Helper to update URL without full reload
  const _updateUrl = (params: URLSearchParams) => {
    const queryString = params.toString();
    // Use shallow routing to update URL without reloading
    router.replace(`${pathname}?${queryString}`, { scroll: false });
  };

  // Debounce search term into URL and SWR key
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Build SWR key from filters
  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    return `/api/products?${params.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedCategory,
  ]);

  // Update URL when filters change (separate from SWR key to avoid loops)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("categoryId", selectedCategory);

    const queryString = params.toString();
    if (queryString && pathname) {
      // Use shallow routing to update URL without reloading
      const newUrl = `${pathname}?${queryString}`;
      // Only update if URL actually changed
      if (
        typeof window !== "undefined" &&
        window.location.search !== `?${queryString}`
      ) {
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedCategory,
    pathname,
    router,
  ]);

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, isLoading } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  // API shape: { success, data: { data: Product[], total, totalPages, ... } }
  const products: Product[] = useMemo(() => data?.data?.data || [], [data?.data?.data]);
  const totalProducts: number = data?.data?.total || 0;
  const totalPages: number = data?.data?.totalPages || 1;

  // Reset or accumulate products depending on page or filter changes
  useEffect(() => {
    if (!data || isLoading) return;

    if (currentPage === 1) {
      // Reset list when filters/page reset
      setProductList(products);
    } else if (products.length > 0) {
      // Append when loading subsequent pages
      setProductList((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const appended = products.filter((p: Product) => !ids.has(p.id));
        return [...prev, ...appended];
      });
    }
  }, [currentPage, swrKey, data, isLoading, products]); // Include data to satisfy exhaustive-deps

  // Load categories once
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (active && json?.success) {
          setCategories(json.data?.data || []);
        }
      } catch (e) {
        console.error("Error loading categories", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
    setCurrentPage(1);
  };

  const _handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const _handleAddToCart = (product: Product) => {
    addToCart(product, 1, "M", "");
    show({
      type: "success",
      title: "Carrito",
      message: "Producto agregado al carrito",
    });
  };

  const loadingGrid = isLoading;

  const sortOptions = [
    { value: "createdAt-desc", label: "🆕 Más recientes" },
    { value: "price-asc", label: "💰 Precio: menor a mayor" },
    { value: "price-desc", label: "💎 Precio: mayor a menor" },
    { value: "rating-desc", label: "⭐ Mejor valorados" },
    { value: "name-asc", label: "🔤 Nombre: A-Z" },
    { value: "name-desc", label: "🔤 Nombre: Z-A" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const _startItem = (currentPage - 1) * 12 + 1;
  const _endItem = Math.min(currentPage * 12, totalProducts);

  return (
    <div className="min-h-screen surface pb-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header solo para móvil */}
        <div className="pt-6 pb-6 lg:hidden">
          <h1 className="text-2xl font-bold mb-2">
            Nuestros Productos
          </h1>
          <p className="text-sm muted">
            Descubre nuestra colección de ropa infantil
          </p>
        </div>

        {/* Mobile filters - Only visible on mobile */}
        <div className="mb-4 lg:hidden">
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="form-input text-sm py-2.5"
                aria-label="Buscar productos"
              />
            </div>
            <div className="w-36">
              <Select
                options={[
                  { value: "", label: "Todas" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Categorías"
                searchable
                clearable
              />
            </div>
          </div>

          {/* Sort dropdown for mobile */}
          <div className="w-full">
            <Select
              options={sortOptions}
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              placeholder="Ordenar por"
            />
          </div>
        </div>

        {/* Active filter chips - Mobile only */}
        {(selectedCategory || debouncedSearch) && (
          <div className="px-4 mb-4 lg:hidden">
            <div className="flex flex-wrap gap-2">
              {debouncedSearch && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full surface text-primary border border-primary"
                  aria-label="Quitar filtro de búsqueda"
                >
                  <span>"{debouncedSearch}"</span>
                  <span className="text-primary">×</span>
                </button>
              )}
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full surface text-primary border border-primary"
                  aria-label="Quitar filtro de categoría"
                >
                  <span>
                    {categories.find((c) => c.id === selectedCategory)?.name ||
                      ""}
                  </span>
                  <span className="text-primary">×</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results count - Mobile optimized (hidden on desktop) */}
        <div className="px-4 mb-4 flex justify-between items-center lg:hidden">
          <div className="text-xs muted">
            {isLoading && totalProducts === 0 ? (
              <span className="animate-pulse">Cargando productos...</span>
            ) : (
              `${totalProducts} productos`
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid"
                  ? "surface text-primary border border-primary"
                  : "surface muted"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list"
                  ? "surface text-primary border border-primary"
                  : "surface muted"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Header en desktop */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  Nuestros Productos
                </h1>
                <p className="text-base muted">
                  Descubre nuestra colección de ropa infantil
                </p>
              </div>
              
              {/* View Mode Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-primary">Vista de productos</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "surface text-primary border border-primary"
                        : "surface muted hover:text-primary"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Cuadrícula
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "surface text-primary border border-primary"
                        : "surface muted hover:text-primary"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Lista
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔍</span>
                  <h2 className="font-semibold text-primary">Filtros</h2>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Buscar productos
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="form-input pr-12 py-2"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 muted"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Categoría
                  </label>
                  <Select
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Todas las categorías"
                    searchable
                    clearable
                  />
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ordenar por
                  </label>
                  <Select
                    options={sortOptions}
                    value={`${sortBy}-${sortOrder}`}
                    onChange={handleSortChange}
                    placeholder="Ordenar por"
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="border-l border-muted mx-6"></div>

          {/* Desktop Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="text-sm muted">
                {isLoading && totalProducts === 0 ? (
                  <span className="animate-pulse">Cargando productos...</span>
                ) : totalProducts === 0 ? (
                  "No se encontraron productos"
                ) : (
                  <>
                    Mostrando{" "}
                    {Math.min(
                      (currentPage - 1) * pageSize + 1,
                      totalProducts
                    )}
                    -{Math.min(currentPage * pageSize, totalProducts)} de{" "}
                    {totalProducts} productos
                  </>
                )}
              </div>
            </div>

            {productList.length === 0 && !loadingGrid ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 muted mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No se encontraron productos
                </h3>
                <p className="muted">
                  Intenta ajustar los filtros o buscar con otros términos
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 mb-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid-cols-1"
                  }`}
                >
                  {loadingGrid && currentPage === 1
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <UISkeletonProductCard key={i} />
                      ))
                    : productList.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          variant={viewMode === "list" ? "list" : "grid"}
                        />
                      ))}
                </div>

                {/* Load more */}
                {currentPage < totalPages && (
                  <div className="flex justify-center mt-2">
                    <Button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      variant="hero"
                      disabled={isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Cargando...
                        </span>
                      ) : (
                        "Cargar más"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Mobile Product Grid */}
        <div className="lg:hidden">
          {productList.length === 0 && !loadingGrid ? (
            <div className="text-center py-12 px-4">
              <ShoppingCart className="w-12 h-12 muted mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No se encontraron productos
              </h3>
              <p className="muted text-sm">
                Intenta ajustar los filtros o buscar con otros términos
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Grid - 2 columns optimized */}
              <div>
                <div
                  className={`grid gap-4 mb-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                      : "grid-cols-1 max-w-sm mx-auto"
                  }`}
                >
                  {loadingGrid && currentPage === 1
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <UISkeletonProductCard key={i} />
                      ))
                    : productList.map((product) => (
                        <div key={product.id} className="w-full">
                          <ProductCard
                            product={product}
                            variant={viewMode === "list" ? "list" : "grid"}
                          />
                        </div>
                      ))}
                </div>
              </div>

              {/* Mobile Load more */}
              {currentPage < totalPages && (
                <div className="pb-6">
                  <Button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    variant="hero"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className="w-full py-3"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center gap-2 w-full">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Cargando...
                      </span>
                    ) : (
                      "Cargar más productos"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="muted">Cargando productos...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
