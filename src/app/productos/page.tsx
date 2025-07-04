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
import { Search, Filter, Grid, List, Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

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
    name: "Body Estampado",
    price: 1299,
    images: ["https://placehold.co/400x500/FFF9C4/333333?text=Body+Bebé"],
    category: {
      id: "3",
      name: "Bebé",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categoryId: "3",
    stock: 25,
    description: "Body suave con estampados divertidos",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Niña",
    description: "Ropa para niñas",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Niño",
    description: "Ropa para niños",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Bebé",
    description: "Ropa para bebés",
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
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Obtener funciones del carrito
  const { addToCart } = useCart();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        // Usar datos mock si no hay categorías
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(mockCategories);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (search) params.append("search", search);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success && data.data.data && data.data.data.length > 0) {
        setProducts(data.data.data);
      } else {
        // Usar datos mock si no hay productos
        let filteredProducts = mockProducts;

        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (p) => p.category?.id === selectedCategory
          );
        }

        if (search) {
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              (p.description &&
                p.description.toLowerCase().includes(search.toLowerCase()))
          );
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredAndSortedProducts = products
    .filter((product) => {
      if (selectedFilters.length === 0) return true;
      return selectedFilters.some((filter) => {
        switch (filter) {
          case "stock":
            return product.stock > 0;
          case "oferta":
            return product.price < 2000; // Productos en oferta
          case "nuevo":
            return true; // Todos los productos mock son "nuevos"
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
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const ProductCard = ({
    product,
    viewMode,
  }: {
    product: Product;
    viewMode: "grid" | "list";
  }) => {
    // Parsear las imágenes si vienen como string
    const images = Array.isArray(product.images)
      ? product.images
      : typeof product.images === "string"
      ? JSON.parse(product.images || "[]")
      : [];

    if (viewMode === "list") {
      return (
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 aspect-square relative bg-gray-100">
              <Image
                src={
                  images[0] ||
                  "https://placehold.co/400x500/FAFAFA/333333?text=Sin+Imagen"
                }
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium">Agotado</span>
                </div>
              )}
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start mb-2">
                <h3
                  className="text-xl font-semibold text-[#333333]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {product.name}
                </h3>
                <span className="text-2xl font-bold text-[#E91E63]">
                  ${(product.price / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-[#757575] mb-2">
                {product.category?.name}
              </p>
              <p className="text-[#666666] mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="text-sm text-[#757575] ml-1">(4.8)</span>
                  </div>
                  <span className="text-sm text-[#757575]">
                    Stock: {product.stock}
                  </span>
                </div>
                <Button
                  disabled={product.stock === 0}
                  onClick={() => {
                    // Agregar al carrito con valores predeterminados
                    addToCart(product, 1, "Única", "Único");
                    toast.success(`${product.name} añadido al carrito!`, {
                      duration: 3000,
                      icon: "🛒",
                      style: {
                        borderRadius: "10px",
                        background: "#F8F9FA",
                        color: "#333",
                        border: "1px solid #E91E63",
                      },
                    });
                  }}
                  className="bg-[#E91E63] text-white hover:bg-[#C2185B] transition-colors duration-300">
                  <ShoppingCart size={16} className="mr-2" />
                  {product.stock === 0 ? "Agotado" : "Agregar"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="bg-white rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
        <Link href={`/productos/${product.id}`}>
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={
                images[0] ||
                "https://placehold.co/400x500/FAFAFA/333333?text=Sin+Imagen"
              }
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-medium">Agotado</span>
              </div>
            )}
            {product.price < 2000 && (
              <div className="absolute top-2 left-2 bg-[#4CAF50] text-white px-2 py-1 rounded text-xs font-bold">
                OFERTA
              </div>
            )}
          </div>
        </Link>
        <CardContent className="p-4 text-center">
          <h3
            className="font-semibold text-lg text-[#333333] mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {product.name}
          </h3>
          <p className="text-sm text-[#757575] mb-2">
            {product.category?.name}
          </p>
          <div className="flex items-center justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="text-yellow-400 fill-current"
              />
            ))}
            <span className="text-xs text-[#757575] ml-1">(4.8)</span>
          </div>
          <p className="text-2xl font-bold text-[#E91E63] mb-3">
            ${(product.price / 100).toFixed(2)}
          </p>
          <Button
            disabled={product.stock === 0}
            onClick={() => {
              // Agregar al carrito con valores predeterminados
              addToCart(product, 1, "Única", "Único");
              toast.success(`${product.name} añadido al carrito!`, {
                duration: 3000,
                icon: "🛒",
                style: {
                  borderRadius: "10px",
                  background: "#F8F9FA",
                  color: "#333",
                  border: "1px solid #E91E63",
                },
              });
            }}
            className="w-full bg-[#E91E63] text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#C2185B] transition-all duration-300 transform hover:scale-105">
            <ShoppingCart size={16} className="mr-2" />
            {product.stock === 0 ? "Agotado" : "Agregar"}
          </Button>
          <p className="text-xs text-[#757575] mt-2">Stock: {product.stock}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className="bg-white text-[#333333] min-h-screen"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="productos" />

      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#333333] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Nuestros Productos
          </h1>
          <p className="text-[#666666] text-lg">
            Descubre la mejor ropa infantil con estilo y calidad
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575]"
                size={20}
              />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 border-2 border-[#E0E0E0] focus:border-[#E91E63] rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#E91E63] text-white"
                      : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0]"
                  }`}>
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[#E91E63] text-white"
                      : "bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0]"
                  }`}>
                  <List size={20} />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-[#E91E63] text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Filter size={16} />
                <span>Filtros</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`md:w-64 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="bg-[#FAFAFA] rounded-xl p-6 shadow-md">
              <h3
                className="text-lg font-bold text-[#333333] mb-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Filtros
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#333333] mb-3">
                  Categorías
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === ""
                        ? "bg-[#E91E63] text-white"
                        : "hover:bg-[#E0E0E0] text-[#666666]"
                    }`}>
                    Todas las categorías
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-[#E91E63] text-white"
                          : "hover:bg-[#E0E0E0] text-[#666666]"
                      }`}>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#333333] mb-3">
                  Filtros adicionales
                </h4>
                <div className="space-y-2">
                  {[
                    { id: "stock", label: "En stock" },
                    { id: "oferta", label: "En oferta" },
                    { id: "nuevo", label: "Nuevos" },
                  ].map((filter) => (
                    <label
                      key={filter.id}
                      className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(filter.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFilters([...selectedFilters, filter.id]);
                          } else {
                            setSelectedFilters(
                              selectedFilters.filter((f) => f !== filter.id)
                            );
                          }
                        }}
                        className="w-4 h-4 text-[#E91E63] rounded focus:ring-[#E91E63]"
                      />
                      <span className="text-[#666666]">{filter.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#333333] mb-3">
                  Ordenar por
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:border-[#E91E63] focus:outline-none">
                  <option value="name">Nombre</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedFilters.length > 0 || search) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedFilters([]);
                    setSearch("");
                  }}
                  className="w-full border-[#E91E63] text-[#E91E63] hover:bg-[#FCE4EC]">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
            ) : filteredAndSortedProducts.length === 0 ? (
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
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[#666666]">
                    Mostrando {filteredAndSortedProducts.length} producto
                    {filteredAndSortedProducts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
