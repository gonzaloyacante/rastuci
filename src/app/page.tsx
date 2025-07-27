"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

// --- Skeleton Components ---
function ProductCardSkeleton() {
  return (
    <Card className="bg-[#FAFAFA] rounded-xl shadow-lg overflow-hidden">
      <div className="relative aspect-square bg-gray-200 skeleton-pulse" />
      <CardContent className="p-4 text-center">
        <div className="h-6 bg-gray-200 rounded mb-2 skeleton-pulse" />
        <div className="h-8 bg-gray-200 rounded mb-4 skeleton-pulse" />
        <div className="h-10 bg-gray-200 rounded skeleton-pulse" />
      </CardContent>
    </Card>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative aspect-square bg-gray-200 skeleton-pulse" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2 skeleton-pulse" />
        <div className="h-4 bg-gray-200 rounded skeleton-pulse" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative bg-pink-50 py-20 px-6">
      <div className="max-w-[1200px] mx-auto text-center">
        <div className="h-12 bg-gray-200 rounded mb-4 skeleton-pulse max-w-2xl mx-auto" />
        <div className="h-6 bg-gray-200 rounded mb-8 skeleton-pulse max-w-xl mx-auto" />
        <div className="h-12 bg-gray-200 rounded skeleton-pulse max-w-xs mx-auto" />
      </div>
    </section>
  );
}

// --- Componente de Tarjeta de Producto ---
function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const images = Array.isArray(product.images)
    ? product.images
    : ((typeof product.images === "string"
        ? JSON.parse(product.images)
        : []) as string[]);
  const imageUrl =
    images[0] || "https://placehold.co/300x300/FAFAFA/333333?text=No+Image";

  return (
    <Card className="bg-[#FAFAFA] rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
      <Link
        href={`/productos/${product.id}`}
        aria-label={`Ver detalles de ${product.name}`}>
        <div
          className="relative aspect-square bg-white"
          style={{ position: "relative" }}>
          <Image
            src={imageUrl}
            alt={`${product.name} - ${
              product.category?.name || "Producto"
            } - ${formatPriceARS(product.price)}`}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            quality={85}
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
          <Button variant="product" className="mt-4">
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
        // Fetch en paralelo para mejor rendimiento
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products?onSale=true&limit=4"),
          fetch("/api/categories?limit=6"),
        ]);

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (productsData.success && productsData.data?.data) {
          setProducts(productsData.data.data);
        } else {
          setProducts([]);
        }

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
      <div className="bg-white text-[#333333]">
        <main>
          {/* Hero Section - No skeleton para texto fijo */}
          <section className="w-full" aria-labelledby="hero-title">
            <div className="relative h-[400px] md:h-[600px] bg-[#FCE4EC]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#333333] p-4">
                <h1
                  id="hero-title"
                  className="text-4xl md:text-6xl font-bold mb-4 font-montserrat">
                  Bienvenido a Rastuci
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl">
                  Ropa infantil de calidad, comodidad y estilo para los más
                  pequeños
                </p>
                <Link href="/productos">
                  <Button variant="hero">Ver Productos</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Categories Skeleton */}
          <section className="py-16 px-6 max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 font-montserrat">
              Nuestras Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>
          </section>

          {/* Products Skeleton */}
          <section className="bg-[#FAFAFA] py-16 px-6">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 font-montserrat">
                Productos en Oferta
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {[...Array(4)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Promotional Banner - No skeleton para texto fijo */}
          <section className="bg-[#FCE4EC] py-12 px-6">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="sr-only">Beneficios de compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <Truck
                    size={48}
                    className="text-[#E91E63] mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-lg font-montserrat">
                    Envíos a todo el país
                  </h3>
                  <p className="text-sm text-[#757575]">
                    Recibí tu compra donde quieras.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <CreditCard
                    size={48}
                    className="text-[#E91E63] mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-lg font-montserrat">
                    3 Cuotas sin interés
                  </h3>
                  <p className="text-sm text-[#757575]">
                    Con todas las tarjetas de crédito.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck
                    size={48}
                    className="text-[#E91E63] mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-lg font-montserrat">
                    Compra Segura
                  </h3>
                  <p className="text-sm text-[#757575]">
                    Tus datos siempre protegidos.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#333333] font-poppins">
      <main>
        {/* Hero Section */}
        <section className="w-full" aria-labelledby="hero-title">
          <div className="relative h-[400px] md:h-[600px] bg-[#FCE4EC]">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#333333] p-4">
              <h1
                id="hero-title"
                className="text-4xl md:text-6xl font-bold mb-4 font-montserrat">
                Bienvenido a Rastuci
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl">
                Ropa infantil de calidad, comodidad y estilo para los más
                pequeños
              </p>
              <Link href="/productos">
                <Button variant="hero">Ver Productos</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section
            className="py-16 px-6 max-w-[1200px] mx-auto"
            aria-labelledby="categories-title">
            <h2
              id="categories-title"
              className="text-3xl font-bold text-center mb-10 font-montserrat">
              Nuestras Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  href={`/productos?category=${category.name.toLowerCase()}`}
                  key={category.id}
                  className="relative rounded-xl overflow-hidden group shadow-lg bg-white h-64 transition-all duration-300 hover:shadow-2xl"
                  aria-label={`Ver productos de la categoría ${category.name}`}>
                  {/* Imagen de la categoría */}
                  <div className="relative w-full h-full">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={`Imagen representativa de ${category.name}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        quality={90}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FCE4EC] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-[#E91E63] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-[#333333] text-xl font-bold">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Overlay con fondo sólido */}
                  <div className="absolute inset-0 bg-black/30 z-10" />
                  {/* Contenido */}
                  <div className="absolute inset-0 z-20 flex items-end p-6">
                    <div className="text-center w-full">
                      <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-white/90 text-sm drop-shadow-lg">
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
          <section
            className="bg-[#FAFAFA] py-16 px-6"
            aria-labelledby="featured-products-title">
            <div className="max-w-[1200px] mx-auto">
              <h2
                id="featured-products-title"
                className="text-3xl font-bold text-center mb-10"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Productos en Oferta
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 2} // Prioridad para las primeras 2 imágenes
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Estado vacío cuando no hay productos ni categorías */}
        {products.length === 0 && categories.length === 0 && !loading && (
          <section className="py-16 px-6 max-w-[1200px] mx-auto">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#FCE4EC] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-[#E91E63]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#333333] mb-4 font-montserrat">
                  Próximamente
                </h2>
                <p className="text-[#666666] text-lg max-w-md mx-auto">
                  Estamos preparando nuestra colección de productos. ¡Vuelve
                  pronto para descubrir nuestra ropa infantil!
                </p>
              </div>
              <Link href="/contacto">
                <Button variant="hero">Contactanos</Button>
              </Link>
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        <section
          className="bg-[#FCE4EC] py-12 px-6"
          aria-labelledby="benefits-title">
          <div className="max-w-[1200px] mx-auto">
            <h2 id="benefits-title" className="sr-only">
              Beneficios de compra
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Truck
                  size={48}
                  className="text-[#E91E63] mb-3"
                  aria-hidden="true"
                />
                <h3 className="font-bold text-lg font-montserrat">
                  Envíos a todo el país
                </h3>
                <p className="text-sm text-[#757575]">
                  Recibí tu compra donde quieras.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <CreditCard
                  size={48}
                  className="text-[#E91E63] mb-3"
                  aria-hidden="true"
                />
                <h3 className="font-bold text-lg font-montserrat">
                  3 Cuotas sin interés
                </h3>
                <p className="text-sm text-[#757575]">
                  Con todas las tarjetas de crédito.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck
                  size={48}
                  className="text-[#E91E63] mb-3"
                  aria-hidden="true"
                />
                <h3 className="font-bold text-lg font-montserrat">
                  Compra Segura
                </h3>
                <p className="text-sm text-[#757575]">
                  Tus datos siempre protegidos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
