"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Truck, CreditCard, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";

// --- Tipos ---
type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

// --- Componente de Tarjeta de Producto ---
function ProductCard({ product }: { product: Product }) {
  const images = Array.isArray(product.images)
    ? product.images
    : ((typeof product.images === "string"
        ? JSON.parse(product.images)
        : []) as string[]);
  const imageUrl =
    images[0] || "https://placehold.co/300x300/FAFAFA/333333?text=No+Image";

  return (
    <Card className="bg-[#FAFAFA] rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-square bg-white">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4 text-center">
          <h3
            className="font-semibold text-lg text-[#333333]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-[#E91E63] mt-2">
            {formatPriceARS(product.price)}
          </p>
          <Button className="mt-4 bg-[#E91E63] text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#C2185B] transition-all duration-300 transform hover:scale-105">
            Ver más
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Productos en oferta (sin paginación)
        const productsResponse = await fetch(
          "/api/products?onSale=true&limit=4"
        );
        const productsData = await productsResponse.json();
        if (productsData.success && productsData.data?.data) {
          setProducts(productsData.data.data);
        } else {
          setProducts([]);
        }

        // Categorías (sin paginación)
        const categoriesResponse = await fetch("/api/categories?limit=6");
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success && categoriesData.data?.data) {
          setCategories(categoriesData.data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header currentPage="inicio" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className="bg-white text-[#333333]"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header currentPage="inicio" />

      <main>
        {/* Hero Section */}
        <section className="w-full">
          <div className="relative h-[400px] md:h-[600px] bg-gradient-to-r from-[#FCE4EC] to-[#F8BBD9]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#333333] p-4">
              <h1
                className="text-4xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Bienvenido a Rastuci
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl">
                Ropa infantil de calidad, comodidad y estilo para los más
                pequeños
              </p>
              <Button className="bg-[#E91E63] text-white uppercase font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#C2185B] transition-all duration-300 transform hover:scale-105">
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-16 px-6 max-w-[1200px] mx-auto">
            <h2
              className="text-3xl font-bold text-center mb-10"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Nuestras Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  href={`/productos?category=${category.name.toLowerCase()}`}
                  key={category.id}
                  className="relative rounded-xl overflow-hidden group shadow-lg bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD9] h-64 transition-all duration-300 hover:shadow-2xl hover:bg-[#FCE4EC]">
                  {/* Imagen de la categoría */}
                  {category.image && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-300"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <h3
                        className="text-[#333333] text-3xl font-bold mb-2"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-[#666666] text-sm">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {products.length > 0 && (
          <section className="bg-[#FAFAFA] py-16 px-6">
            <div className="max-w-[1200px] mx-auto">
              <h2
                className="text-3xl font-bold text-center mb-10"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Productos en Oferta
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        <section className="bg-[#FCE4EC] py-12 px-6">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Truck size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Envíos a todo el país
              </h3>
              <p className="text-sm text-[#757575]">
                Recibí tu compra donde quieras.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CreditCard size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                3 Cuotas sin interés
              </h3>
              <p className="text-sm text-[#757575]">
                Con todas las tarjetas de crédito.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={48} className="text-[#E91E63] mb-3" />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Compra Segura
              </h3>
              <p className="text-sm text-[#757575]">
                Tus datos siempre protegidos.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
