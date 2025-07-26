"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Product, Category } from "@/types";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  SortAsc,
  SortDesc,
  Hash,
  Clock,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatPriceARS } from "@/utils/formatters";

// Mock data para cuando no hay productos en la API
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Vestido Floral de Verano",
    price: 2999,
    images: ["https://placehold.co/400x500/FCE4EC/333333?text=Vestido+Niña"],
    category: {
      id: "1",
      name: "Niña",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "1",
    stock: 15,
    description: "Hermoso vestido floral perfecto para el verano",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Camiseta de Dinosaurio",
    price: 1599,
    images: ["https://placehold.co/400x500/E0F7FA/333333?text=Camiseta+Niño"],
    category: {
      id: "2",
      name: "Niño",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "2",
    stock: 8,
    description: "Camiseta con diseño de dinosaurios para aventureros",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Conjunto de Algodón para Bebé",
    price: 2599,
    images: ["https://placehold.co/400x500/FFF9C4/333333?text=Conjunto+Bebé"],
    category: {
      id: "3",
      name: "Bebé",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "3",
    stock: 12,
    description: "Suave conjunto de algodón orgánico para bebés",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Shorts de Jean",
    price: 1999,
    images: ["https://placehold.co/400x500/E0F7FA/333333?text=Shorts+Niño"],
    category: {
      id: "2",
      name: "Niño",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "2",
    stock: 5,
    description: "Cómodos shorts de jean para el día a día",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Falda con Volados",
    price: 2199,
    images: ["https://placehold.co/400x500/FCE4EC/333333?text=Falda+Niña"],
    category: {
      id: "1",
      name: "Niña",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "1",
    stock: 20,
    description: "Falda con volados para ocasiones especiales",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Pijama de Algodón",
    price: 3499,
    images: ["https://placehold.co/400x500/E8F5E8/333333?text=Pijama+Unisex"],
    category: {
      id: "4",
      name: "Pijamas",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "4",
    stock: 10,
    description: "Cómodo pijama de algodón para dormir",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [onSaleFilter, setOnSaleFilter] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener funciones del carrito
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categorías desde la API real
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?page=1&limit=100");
        const data = await response.json();
        if (data.success && data.data?.data) {
          setCategories(data.data.data);
        } else if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch productos desde la API real
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (search) params.append("search", search);
        if (onSaleFilter) params.append("onSale", "true");
        params.append("page", currentPage.toString());
        params.append("limit", "12");
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        if (data.success && data.data.data) {
          setProducts(data.data.data);
          setTotalPages(data.data.totalPages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch (error) {
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, selectedCategory, onSaleFilter, currentPage]);

  // Handlers para búsqueda, filtros y paginación
  const handleSearch = () => {
    setCurrentPage(1);
  };
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedFilters([]);
    setOnSaleFilter(false);
    setSearch("");
    setCurrentPage(1);
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      if (selectedFilters.length === 0) return true;
      return selectedFilters.some((filter) => {
        switch (filter) {
          case "stock":
            return product.stock > 0;
          case "oferta":
            return product.onSale;
          case "nuevo":
            return (
              new Date().getTime() - new Date(product.createdAt).getTime() <
              7 * 24 * 60 * 60 * 1000
            );
          default:
            return true;
        }
      });
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          // Por ahora ordenamos por stock (productos con más stock = más populares)
          // En el futuro se podría implementar un sistema de ventas/rating
          return b.stock - a.stock;
        case "favorites":
          // Por ahora ordenamos por nombre, en el futuro se podría implementar un sistema de favoritos
          return a.name.localeCompare(b.name);
        case "offers":
          // Productos en oferta primero, luego por precio
          if (a.onSale && !b.onSale) return -1;
          if (!a.onSale && b.onSale) return 1;
          return a.price - b.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div
      className="bg-white text-[#333333] min-h-screen"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="productos" />

      <main className="max-w-[1200px] mx-auto py-4 px-2 sm:px-4">
        {/* Page Header */}
        <div className="mb-4 sm:mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#333333] mb-2 sm:mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Nuestros Productos
          </h1>
          <p className="text-[#666666] text-base sm:text-lg">
            Descubre la mejor ropa infantil con estilo y calidad
          </p>
        </div>

        {/* Botón para mostrar filtros en móvil */}
        <div className="lg:hidden mb-4 flex justify-end">
          <Button
            onClick={() => setShowFilters(true)}
            className="bg-[#E91E63] text-white hover:bg-[#C2185B] border-none shadow-md px-5 py-3 rounded-lg font-medium flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </Button>
        </div>

        {/* Overlay y Drawer de filtros en móvil */}
        {isMobile && showFilters && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-200"
              onClick={() => setShowFilters(false)}
            />
            <aside
              className="fixed top-0 right-0 w-11/12 max-w-xs h-full bg-white z-50 shadow-2xl p-6 flex flex-col animate-slide-in"
              style={{ animation: "slideIn 0.25s cubic-bezier(.4,0,.2,1)" }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#333333]">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-[#E91E63] text-2xl font-bold focus:outline-none">
                  ×
                </button>
              </div>
              {/* Filtros aquí (copiar el contenido del sidebar) */}
              {/* ...copiar el contenido del sidebar aquí... */}
              <div className="flex-1 overflow-y-auto">
                {/* Búsqueda */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#333333] mb-3">
                    Buscar productos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                    <Input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      placeholder="Buscar productos..."
                      className="pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-lg focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63] focus:ring-opacity-20 transition-all duration-200"
                    />
                  </div>
                </div>
                {/* Filtro por categoría */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#333333] mb-3">
                    Categoría
                  </label>
                  <CustomSelect
                    options={[
                      { value: "", label: "Todas las categorías" },
                      ...categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                      })),
                    ]}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    placeholder="Todas las categorías"
                    className="w-full"
                  />
                </div>
                {/* Filtro de ofertas */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={onSaleFilter}
                        onChange={(e) => setOnSaleFilter(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                          onSaleFilter
                            ? "bg-[#E91E63] border-[#E91E63]"
                            : "border-[#E0E0E0] group-hover:border-[#E91E63]"
                        }`}>
                        {onSaleFilter && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-[#333333] group-hover:text-[#E91E63] transition-colors duration-200">
                      Solo productos en oferta
                    </span>
                  </label>
                </div>
                {/* Ordenar por */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#333333] mb-3">
                    Ordenar por
                  </label>
                  <CustomSelect
                    options={[
                      {
                        value: "name",
                        label: "Nombre A-Z",
                        icon: <Hash size={16} />,
                      },
                      {
                        value: "price-low",
                        label: "Precio: menor a mayor",
                        icon: <SortAsc size={16} />,
                      },
                      {
                        value: "price-high",
                        label: "Precio: mayor a menor",
                        icon: <SortDesc size={16} />,
                      },
                      {
                        value: "newest",
                        label: "Más recientes",
                        icon: <Clock size={16} />,
                      },
                      {
                        value: "popular",
                        label: "Más populares",
                        icon: <TrendingUp size={16} />,
                      },
                      {
                        value: "favorites",
                        label: "Favoritos",
                        icon: <Heart size={16} />,
                      },
                      {
                        value: "offers",
                        label: "Ofertas primero",
                        icon: <Zap size={16} />,
                      },
                    ]}
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder="Ordenar por"
                    className="w-full"
                  />
                </div>
                {/* Limpiar filtros */}
                {(selectedCategory || search || onSaleFilter) && (
                  <Button
                    onClick={handleClearFilters}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200 cursor-pointer py-3 rounded-lg font-medium">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </aside>
          </>
        )}

        {/* Layout con sidebar (desktop) */}
        <div className="hidden lg:flex flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3
                className="text-xl font-bold text-[#333333] mb-6"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Filtros
              </h3>
              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333333] mb-3">
                  Buscar productos
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="Buscar productos..."
                    className="pl-12 pr-4 py-3 border-2 border-[#E0E0E0] rounded-lg focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63] focus:ring-opacity-20 transition-all duration-200"
                  />
                </div>
              </div>
              {/* Filtro por categoría */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333333] mb-3">
                  Categoría
                </label>
                <CustomSelect
                  options={[
                    { value: "", label: "Todas las categorías" },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  placeholder="Todas las categorías"
                  className="w-full"
                />
              </div>
              {/* Filtro de ofertas */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={onSaleFilter}
                      onChange={(e) => setOnSaleFilter(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                        onSaleFilter
                          ? "bg-[#E91E63] border-[#E91E63]"
                          : "border-[#E0E0E0] group-hover:border-[#E91E63]"
                      }`}>
                      {onSaleFilter && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-[#333333] group-hover:text-[#E91E63] transition-colors duration-200">
                    Solo productos en oferta
                  </span>
                </label>
              </div>
              {/* Ordenar por */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#333333] mb-3">
                  Ordenar por
                </label>
                <CustomSelect
                  options={[
                    {
                      value: "name",
                      label: "Nombre A-Z",
                      icon: <Hash size={16} />,
                    },
                    {
                      value: "price-low",
                      label: "Precio: menor a mayor",
                      icon: <SortAsc size={16} />,
                    },
                    {
                      value: "price-high",
                      label: "Precio: mayor a menor",
                      icon: <SortDesc size={16} />,
                    },
                    {
                      value: "newest",
                      label: "Más recientes",
                      icon: <Clock size={16} />,
                    },
                    {
                      value: "popular",
                      label: "Más populares",
                      icon: <TrendingUp size={16} />,
                    },
                    {
                      value: "favorites",
                      label: "Favoritos",
                      icon: <Heart size={16} />,
                    },
                    {
                      value: "offers",
                      label: "Ofertas primero",
                      icon: <Zap size={16} />,
                    },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                  placeholder="Ordenar por"
                  className="w-full"
                />
              </div>
              {/* Limpiar filtros */}
              {(selectedCategory || search || onSaleFilter) && (
                <Button
                  onClick={handleClearFilters}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200 cursor-pointer py-3 rounded-lg font-medium">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
          {/* Contenido principal: botones de vista + productos */}
          <div className="flex-1">
            {/* Botones de cambio de vista (desktop) */}
            <div className="flex justify-end items-center mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#E91E63] text-white shadow-md"
                      : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0] hover:text-[#333333]"
                  }`}>
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#E91E63] text-white shadow-md"
                      : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0] hover:text-[#333333]"
                  }`}>
                  <List size={20} />
                </button>
              </div>
            </div>
            {/* Grid/Listado de productos */}
            <div className="w-full max-w-full">
              {loading ? (
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl text-[#E0E0E0] mb-4">🛍️</div>
                  <h3
                    className="text-xl font-bold text-[#333333] mb-2"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    No se encontraron productos
                  </h3>
                  <p className="text-[#666666] mb-4">
                    {search || selectedCategory || selectedFilters.length > 0
                      ? "Prueba ajustando los filtros de búsqueda."
                      : "Aún no hay productos disponibles."}
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg border border-[#F0F0F0] overflow-hidden items-stretch relative group transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl">
                          {/* Badge oferta */}
                          {product.onSale && (
                            <span className="absolute top-3 left-3 bg-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                              OFERTA
                            </span>
                          )}
                          {/* Imagen */}
                          <div className="w-full md:w-56 h-40 md:h-44 flex-shrink-0 relative m-0 md:m-4 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                            <img
                              src={
                                Array.isArray(product.images)
                                  ? product.images[0]
                                  : "/placeholder-product.jpg"
                              }
                              alt={product.name}
                              className="object-cover w-full h-full rounded-xl"
                            />
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
                                  Agotado
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Info central */}
                          <div className="flex-1 flex flex-col justify-between py-3 px-4 md:py-5 md:px-0 min-w-0">
                            <div className="flex flex-col gap-2 md:gap-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="bg-[#F8BBD9] text-[#E91E63] text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                                  {product.category?.name}
                                </span>
                              </div>
                              <h3
                                className="font-bold text-lg md:text-2xl text-[#333333] mb-1 line-clamp-2"
                                style={{
                                  fontFamily: "'Montserrat', sans-serif",
                                }}>
                                {product.name}
                              </h3>
                              <p className="text-[#666666] text-sm md:text-base line-clamp-2 mb-2 md:mb-0">
                                {product.description}
                              </p>
                            </div>
                            {/* Opcional: stock, envío, etc. */}
                          </div>
                          {/* Columna derecha: precio y acción */}
                          <div className="flex flex-col justify-center items-end gap-3 p-4 min-w-[140px] md:min-w-[180px] bg-white/80">
                            <span className="text-2xl md:text-3xl font-extrabold text-[#E91E63] mb-1">
                              ${product.price.toLocaleString("es-CO")}
                            </span>
                            <Button
                              disabled={product.stock === 0}
                              className="flex items-center gap-2 bg-[#E91E63] text-white hover:bg-[#C2185B] px-6 py-3 rounded-lg text-base font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all duration-200 w-full md:w-auto justify-center">
                              <ShoppingCart size={20} />
                              {product.stock === 0 ? "Agotado" : "Agregar"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Controles de paginación */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-10">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg">
                        Anterior
                      </Button>
                      <span className="text-sm text-[#666666] font-medium bg-[#F5F5F5] px-4 py-2 rounded-lg">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg">
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grid/Listado de productos para móvil/tablet */}
        <div className="w-full max-w-full lg:hidden">
          {/* Controles de vista (solo en mobile/tablet) */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-[#666666] font-medium">
              Mostrando {products.length} producto
              {products.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#E91E63] text-white shadow-md"
                    : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0] hover:text-[#333333]"
                }`}>
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#E91E63] text-white shadow-md"
                    : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0] hover:text-[#333333]"
                }`}>
                <List size={20} />
              </button>
            </div>
          </div>
          {/* Products Grid/List */}
          {loading ? (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-[#E0E0E0] mb-4">🛍️</div>
              <h3
                className="text-xl font-bold text-[#333333] mb-2"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                No se encontraron productos
              </h3>
              <p className="text-[#666666] mb-4">
                {search || selectedCategory || selectedFilters.length > 0
                  ? "Prueba ajustando los filtros de búsqueda."
                  : "Aún no hay productos disponibles."}
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg border border-[#F0F0F0] overflow-hidden items-stretch relative group transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl">
                      {/* Badge oferta */}
                      {product.onSale && (
                        <span className="absolute top-3 left-3 bg-[#E91E63] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                          OFERTA
                        </span>
                      )}
                      {/* Imagen */}
                      <div className="w-full md:w-56 h-40 md:h-44 flex-shrink-0 relative m-0 md:m-4 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                        <img
                          src={
                            Array.isArray(product.images)
                              ? product.images[0]
                              : "/placeholder-product.jpg"
                          }
                          alt={product.name}
                          className="object-cover w-full h-full rounded-xl"
                        />
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Info central */}
                      <div className="flex-1 flex flex-col justify-between py-3 px-4 md:py-5 md:px-0 min-w-0">
                        <div className="flex flex-col gap-2 md:gap-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="bg-[#F8BBD9] text-[#E91E63] text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                              {product.category?.name}
                            </span>
                          </div>
                          <h3
                            className="font-bold text-lg md:text-2xl text-[#333333] mb-1 line-clamp-2"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            {product.name}
                          </h3>
                          <p className="text-[#666666] text-sm md:text-base line-clamp-2 mb-2 md:mb-0">
                            {product.description}
                          </p>
                        </div>
                        {/* Opcional: stock, envío, etc. */}
                      </div>
                      {/* Columna derecha: precio y acción */}
                      <div className="flex flex-col justify-center items-end gap-3 p-4 min-w-[140px] md:min-w-[180px] bg-white/80">
                        <span className="text-2xl md:text-3xl font-extrabold text-[#E91E63] mb-1">
                          {formatPriceARS(product.price)}
                        </span>
                        <Button
                          disabled={product.stock === 0}
                          className="flex items-center gap-2 bg-[#E91E63] text-white hover:bg-[#C2185B] px-6 py-3 rounded-lg text-base font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all duration-200 w-full md:w-auto justify-center">
                          <ShoppingCart size={20} />
                          {product.stock === 0 ? "Agotado" : "Agregar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg">
                    Anterior
                  </Button>
                  <span className="text-sm text-[#666666] font-medium bg-[#F5F5F5] px-4 py-2 rounded-lg">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg">
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
