"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ColorChip } from "@/components/ui/ColorChip";
import { Product, useProducts, useCategories } from "@/hooks";
import { formatCurrency } from "@/utils/formatters";
import {
  ShoppingCart,
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProductsPageClientProps {
  searchParams: {
    categoria?: string;
    buscar?: string;
    pagina?: string;
  };
}

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1, product.sizes?.[0] || "M", "");
    toast.success("Producto agregado al carrito");
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      removeFromWishlist(product.id);
      toast.success("Eliminado de favoritos");
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.jpg',
      });
      toast.success("Agregado a favoritos");
    }
  };

  const productImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? JSON.parse(product.images)
    : [];

  return (
    <div className="group surface rounded-lg shadow-sm hover:shadow-md transition-shadow border border-muted overflow-hidden">
      <div className="relative">
        {/* Badge de oferta */}
        {product.onSale && (
          <Badge variant="success" className="absolute top-2 left-2 z-10">
            Oferta
          </Badge>
        )}

        {/* Imagen del producto */}
        <Link href={`/productos/${product.id}`}>
          <div className="aspect-square relative overflow-hidden">
            {productImages.length > 0 ? (
              <Image
                src={productImages[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full surface flex items-center justify-center">
                <svg
                  className="w-12 h-12 muted"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Botones de acción */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full shadow-sm ${
              isFavorite
                ? "bg-error text-white"
                : "surface muted hover:text-error"
            }`}
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-primary text-white rounded-full shadow-sm hover:bg-primary-dark disabled:surface-secondary"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-medium text-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm muted mb-2">
          {product.category?.name || "Sin categoría"}
        </p>

        {/* Colores disponibles */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {product.colors.slice(0, 5).map((color, idx) => (
              <ColorChip key={idx} color={color} size="xs" />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs muted">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Precio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.onSale && (
              <span className="text-sm muted line-through">
                {formatCurrency(product.price * 1.2)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <Badge
            variant={
              product.stock === 0
                ? "error"
                : product.stock < 10
                ? "warning"
                : "success"
            }
            size="xs"
          >
            {product.stock === 0
              ? "Agotado"
              : product.stock < 10
              ? "Pocas unidades"
              : "En stock"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="surface rounded-lg shadow-sm border border-muted overflow-hidden">
        <div className="aspect-square surface-secondary animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 surface-secondary rounded animate-pulse" />
          <div className="h-3 surface-secondary rounded animate-pulse w-2/3" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="w-4 h-4 surface-secondary rounded-full animate-pulse" />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="h-5 surface-secondary rounded animate-pulse w-16" />
            <div className="h-4 surface-secondary rounded animate-pulse w-12" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ProductsPageClient({ searchParams }: ProductsPageClientProps) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);

  // Get initial values from search params
  const initialCategory = searchParams.categoria || "";
  const initialSearch = searchParams.buscar || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);

  const { products, isLoading, error } = useProducts({
    category: selectedCategory || undefined,
    search: searchInput || undefined,
    page: currentPage,
    sortBy,
    limit: 20,
  });

  const { categories } = useCategories();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set('buscar', searchInput);
    if (selectedCategory) params.set('categoria', selectedCategory);

    router.push(`/productos?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (searchInput) params.set('buscar', searchInput);
    if (categoryId) params.set('categoria', categoryId);

    router.push(`/productos?${params.toString()}`);
  };


  if (isLoading) {
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
            <h1 className="text-2xl font-bold text-error mb-4">Error</h1>
            <p className="muted mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {searchInput ? `Búsqueda: "${searchInput}"` :
             selectedCategory ? `Categoría: ${categories.find(c => c.id === selectedCategory)?.name || 'Categoría'}` :
             'Productos'}
          </h1>
          <p className="muted">
            {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>

        {/* Controles */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-2 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button onClick={handleSearch} variant="outline">
              Buscar
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'surface muted'}`}
              title="Vista de cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'surface muted'}`}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${showFilters ? 'bg-primary text-white' : 'surface muted'} sm:hidden`}
              title="Filtros"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 ${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white border-primary'
                    : 'surface text-primary border-muted hover:surface-secondary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 surface rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              No se encontraron productos
            </h3>
            <p className="muted mb-4">
              {searchInput || selectedCategory
                ? 'Prueba con otros términos de búsqueda o categorías'
                : 'No hay productos disponibles en este momento'}
            </p>
            {(searchInput || selectedCategory) && (
              <Button
                onClick={() => {
                  setSearchInput('');
                  setSelectedCategory('');
                  router.push('/productos');
                }}
                variant="outline"
              >
                Ver todos los productos
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              variant="outline"
              className="px-8"
            >
              Cargar más productos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
