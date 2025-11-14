"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Product } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { Grid, List, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

interface ProductsPageClientProps {
  searchParams: {
    categoria?: string;
    buscar?: string;
    pagina?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(12)].map(() => (
      <ProductCardSkeleton key={`product-card-skeleton-${Math.random()}`} />
    ))}
  </div>
);

export default function ProductsPageClient({ searchParams }: ProductsPageClientProps) {
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Estados locales
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados sincronizados con URL
  const [searchInput, setSearchInput] = useState(searchParams.buscar || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.categoria || "");
  const [sortBy, setSortBy] = useState(searchParams.sortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(searchParams.sortOrder || "desc");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.pagina) || 1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Construir URL de API
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "12");
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (debouncedSearch) {params.set("search", debouncedSearch);}
    if (selectedCategory) {params.set("categoryId", selectedCategory);}
    return `/api/products?${params.toString()}`;
  }, [currentPage, sortBy, sortOrder, debouncedSearch, selectedCategory]);

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) {params.set("buscar", debouncedSearch);}
    if (selectedCategory) {params.set("categoria", selectedCategory);}
    if (sortBy !== "createdAt") {params.set("sortBy", sortBy);}
    if (sortOrder !== "desc") {params.set("sortOrder", sortOrder);}
    if (currentPage > 1) {params.set("pagina", currentPage.toString());}

    const newUrl = params.toString() ? `/productos?${params.toString()}` : "/productos";
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, selectedCategory, sortBy, sortOrder, currentPage, router]);

  // Fetch de productos con SWR
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, isLoading, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 segundos
  });

  const products: Product[] = data?.data?.data || [];
  const totalProducts = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1);
  };

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

  // Opciones para selects
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

  // Estados de carga
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

  if (error) {
    return (
      <div className="min-h-screen surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-error mb-4">Error al cargar productos</h1>
            <p className="muted mb-4">Ocurrió un problema al cargar los productos. Inténtalo nuevamente.</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = debouncedSearch || selectedCategory;

  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controles móvil */}
        <div className="mb-6 lg:hidden">
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar productos..."
                className="text-sm"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" size="sm">
              Buscar
            </Button>
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
                options={sortOptions}
                value={`${sortBy}-${sortOrder}`}
                onChange={handleSortChange}
                placeholder="Ordenar"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'surface muted hover:bg-surface-secondary'}`}
                title="Vista de cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'surface muted hover:bg-surface-secondary'}`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Layout desktop con sidebar de filtros */}
        <div className="hidden lg:block">
          <div className="flex gap-8 min-h-screen">
            {/* Sidebar de filtros - siempre visible en desktop */}
            <aside className="w-80 flex-shrink-0">
              <div className="sticky top-24 surface border border-muted rounded-lg p-6">
                <h2 className="text-lg font-semibold text-primary mb-6">Filtros</h2>
                
                {/* Búsqueda */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Buscar productos
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Nombre, descripción..."
                      className="text-sm"
                    />
                    <Button onClick={handleSearch} variant="outline" size="sm">
                      Buscar
                    </Button>
                  </div>
                </div>

                {/* Categorías */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Categoría
                  </label>
                  <div className="space-y-2">
                    {categoryOptions.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          selectedCategory === category.value
                            ? 'bg-primary text-white'
                            : 'surface hover:bg-surface-secondary'
                        }`}
                      >
                        {category.label}
                        {selectedCategory === category.value && (
                          <span className="float-right">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ordenar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary mb-2">
                    Ordenar por
                  </label>
                  <Select
                    options={sortOptions}
                    value={`${sortBy}-${sortOrder}`}
                    onChange={handleSortChange}
                    placeholder="Ordenar por"
                  />
                </div>

                {/* Limpiar filtros */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-muted">
                    <Button onClick={clearFilters} variant="outline" fullWidth>
                      Limpiar todos los filtros
                    </Button>
                  </div>
                )}
              </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 min-w-0">
              {/* Header con controles de vista */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm muted">
                    {isLoading ? (
                      <span className="animate-pulse">Cargando productos...</span>
                    ) : (
                      <>
                        {totalProducts === 0 ? 'No se encontraron productos' : 
                         totalProducts === 1 ? '1 producto encontrado' : 
                         `${totalProducts} productos encontrados`
                        }
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm muted mr-2">Vista:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'surface muted hover:bg-surface-secondary'}`}
                    title="Vista de cuadrícula"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'surface muted hover:bg-surface-secondary'}`}
                    title="Vista de lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Productos content se renderiza aquí */}
              {isLoading ? (
                <ProductGridSkeleton />
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 surface rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 muted" />
                  </div>
                  <h3 className="text-xl font-medium text-primary mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="muted mb-6 max-w-md mx-auto">
                    {hasActiveFilters
                      ? 'Intenta ajustar los filtros de búsqueda o explorar otras categorías'
                      : 'No hay productos disponibles en este momento'
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="hero">
                      Ver todos los productos
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className={`grid gap-6 mb-8 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                      : 'grid-cols-1 max-w-4xl'
                  }`}>
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        variant={viewMode}
                      />
                    ))}
                  </div>

                  {/* Paginación en desktop */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          const page = currentPage <= 3 ? i + 1 : 
                                       currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                       currentPage - 2 + i;
                          
                          if (page < 1 || page > totalPages) {return null;}
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                page === currentPage
                                  ? 'bg-primary text-white'
                                  : 'surface muted hover:text-primary'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}

                  {/* Info de paginación */}
                  <div className="text-center mt-4 text-sm muted">
                    Página {currentPage} de {totalPages} - {totalProducts} productos en total
                  </div>
                </>
              )}
            </main>
          </div>
        </div>

        {/* Chips de filtros activos - solo móvil */}
        {hasActiveFilters && (
          <div className="mb-6 lg:hidden">
            <div className="flex flex-wrap gap-2">
              {debouncedSearch && (
                <button
                  onClick={() => setSearchInput("")}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full surface text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <span>Búsqueda: "{debouncedSearch}"</span>
                  <span>×</span>
                </button>
              )}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full surface text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <span>{categories.find(c => c.id === selectedCategory)?.name || ''}</span>
                  <span>×</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid de productos - solo móvil */}
        <div className="lg:hidden">
          {isLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 surface rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 muted" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">
                No se encontraron productos
              </h3>
              <p className="muted mb-6 max-w-md mx-auto">
                {hasActiveFilters
                  ? 'Intenta ajustar los filtros de búsqueda o explorar otras categorías'
                  : 'No hay productos disponibles en este momento'
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="hero">
                  Ver todos los productos
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid gap-6 mb-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 max-w-2xl mx-auto'
              }`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    variant={viewMode}
                  />
                ))}
              </div>

              {/* Paginación móvil */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                      const page = currentPage <= 2 ? i + 1 : 
                                   currentPage >= totalPages - 1 ? totalPages - 2 + i :
                                   currentPage - 1 + i;
                      
                      if (page < 1 || page > totalPages) {return null;}
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            page === currentPage
                              ? 'bg-primary text-white'
                              : 'surface muted hover:text-primary'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Siguiente
                  </Button>
                </div>
              )}

              {/* Info de paginación móvil */}
              <div className="text-center mt-4 text-xs muted">
                Página {currentPage} de {totalPages} - {totalProducts} productos
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
