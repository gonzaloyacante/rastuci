"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import {
  Filter,
  Grid,
  List,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatPriceARS } from "@/utils/formatters";
import ProductCard from "@/components/ProductCard";

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <aside className="hidden lg:flex lg:w-1/4">
            <div className="w-full space-y-6">
              <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse" />
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </aside>

          <div className="hidden lg:block w-px bg-gray-200 mx-6"></div>

          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sortBy,
          sortOrder,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }

        const productsRes = await fetch(`/api/products?${params.toString()}`);
        const productsData = await productsRes.json();

        if (productsData.success) {
          setProducts(productsData.data.data || []);
          setTotalPages(productsData.data.totalPages || 1);
          setTotalProducts(productsData.data.total || 0);
        }

        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data.data || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1, "M", "");
    toast.success("Producto agregado al carrito");
  };

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  const sortOptions = [
    { value: "createdAt-desc", label: "Más recientes" },
    { value: "createdAt-asc", label: "Más antiguos" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
    { value: "name-asc", label: "Nombre: A-Z" },
    { value: "name-desc", label: "Nombre: Z-A" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalProducts);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nuestros Productos
          </h1>
          <p className="text-gray-600">
            Descubre nuestra colección de ropa infantil
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <aside className="hidden lg:flex lg:w-1/4">
            <div className="w-full space-y-6">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar productos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-pink-600 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <CustomSelect
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  placeholder="Todas las categorías"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <CustomSelect
                  options={sortOptions}
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  placeholder="Ordenar por"
                />
              </div>
            </div>
          </aside>

          <div className="hidden lg:block w-px bg-gray-200 mx-6"></div>

          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Mostrando {startItem}-{endItem} de {totalProducts} productos
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros o buscar con otros términos
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 mb-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        const showEllipsis =
                          index > 0 && page - array[index - 1] > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg border ${
                                currentPage === page
                                  ? "bg-pink-600 text-white border-pink-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}>
                              {page}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
