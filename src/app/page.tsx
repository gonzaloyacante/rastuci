"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Truck, CreditCard, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { ProductCardSkeleton as UISkeletonProductCard, CategorySkeleton } from "@/components/ui/Skeleton";

// --- Tipos ---
type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

// --- Skeleton Components ---
function ProductCardSkeleton() {
  return (
    <Card className="surface rounded-xl shadow-lg overflow-hidden">
      <div className="relative aspect-square surface-secondary skeleton-pulse" />
      <CardContent className="p-4 text-center">
        <div className="h-6 surface-secondary rounded mb-2 skeleton-pulse" />
        <div className="h-8 surface-secondary rounded mb-4 skeleton-pulse" />
        <div className="h-10 surface-secondary rounded skeleton-pulse" />
      </CardContent>
    </Card>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="surface rounded-xl shadow-lg overflow-hidden">
      <div className="relative aspect-square surface-secondary skeleton-pulse" />
      <div className="p-4">
        <div className="h-6 surface-secondary rounded mb-2 skeleton-pulse" />
        <div className="h-4 surface-secondary rounded skeleton-pulse" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative surface py-20 px-6">
      <div className="max-w-[1200px] mx-auto text-center">
        <div className="h-12 surface-secondary rounded mb-4 skeleton-pulse max-w-2xl mx-auto" />
        <div className="h-6 surface-secondary rounded mb-8 skeleton-pulse max-w-xl mx-auto" />
        <div className="h-12 surface-secondary rounded skeleton-pulse max-w-xs mx-auto" />
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

  // Calcular precio con descuento si está en oferta
  const originalPrice = product.price;
  const discountedPrice = product.onSale && product.salePrice 
    ? product.salePrice 
    : originalPrice;
  const hasDiscount = product.onSale && product.salePrice && product.salePrice < originalPrice;

  return (
    <Card className="surface rounded-xl shadow-lg overflow-hidden group transition-transform duration-300 hover:-translate-y-2">
      <Link
        href={`/productos/${product.id}`}
        aria-label={`Ver detalles de ${product.name}`}>
        <div
          className="relative aspect-square surface-secondary"
          style={{ position: "relative" }}>
          <Image
            src={imageUrl}
            alt={`${product.name} - ${
              product.category?.name || "Producto"
            } - ${formatPriceARS(discountedPrice)}`}
            fill
            className="object-cover"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            quality={85}
          />
          {/* Badge de oferta */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-error text-white text-xs px-2 py-1 rounded-full font-medium">
              OFERTA
            </div>
          )}
        </div>
        <CardContent className="p-4 text-center">
          <h3
            className="font-semibold text-lg"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {product.name}
          </h3>
          <div className="mt-2">
            {hasDiscount ? (
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-bold text-primary">
                  {formatPriceARS(discountedPrice)}
                </p>
                <p className="text-sm muted line-through">
                  {formatPriceARS(originalPrice)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">
                {formatPriceARS(originalPrice)}
              </p>
            )}
          </div>
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
  const [home, setHome] = useState<HomeSettings>(defaultHomeSettings);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch en paralelo para mejor rendimiento
        const [productsResponse, categoriesResponse, homeResponse] = await Promise.all([
          fetch("/api/products?onSale=true&limit=4"),
          fetch("/api/categories?limit=6"),
          fetch("/api/home"),
        ]);

        const [productsData, categoriesData, homeData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          homeResponse.json(),
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

        if (homeData.success && homeData.data) {
          setHome(homeData.data as HomeSettings);
        } else {
          setHome(defaultHomeSettings);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setProducts([]);
        setCategories([]);
        setHome(defaultHomeSettings);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="surface-secondary">
        <main>
          {/* Hero Section - No skeleton para texto fijo */}
          <section className="w-full" aria-labelledby="hero-title">
            <div className="relative h-[400px] md:h-[600px] surface">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h1
                  id="hero-title"
                  className="text-4xl md:text-6xl font-bold mb-4 font-montserrat text-primary">
                  Bienvenido a Rastuci
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl text-muted">
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
              {home.categoriesTitle}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[...Array(6)].map((_, index) => (
                <CategorySkeleton key={index} />
              ))}
            </div>
          </section>

          {/* Products Skeleton */}
          <section className="surface py-16 px-6">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10 font-montserrat">
                Productos en Oferta
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[...Array(4)].map((_, index) => (
                  <UISkeletonProductCard key={index} />
                ))}
              </div>
            </div>
          </section>

          {/* Promotional Banner - No skeleton para texto fijo */}
          <section className="py-12 px-6">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="sr-only">Beneficios de compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <Truck size={48} className="text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-bold text-lg font-montserrat">
                    Envíos a todo el país
                  </h3>
                  <p className="text-sm muted">
                    Recibí tu compra donde quieras.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <CreditCard size={48} className="text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-bold text-lg font-montserrat">
                    3 Cuotas sin interés
                  </h3>
                  <p className="text-sm muted">
                    Con todas las tarjetas de crédito.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={48} className="text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-bold text-lg font-montserrat">
                    Compra Segura
                  </h3>
                  <p className="text-sm muted">
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
    <div className="surface-secondary font-poppins">
      <main>
        {/* Hero Section */}
        <section className="w-full" aria-labelledby="hero-title">
          <div className="relative h-[calc(100svh-4rem)] overflow-hidden surface flex items-center justify-center">
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface backdrop-blur border border-muted text-primary text-sm font-medium mb-6 shadow-sm">
                ✨ Nueva temporada
              </span>
              
              {/* Logo SVG Principal */}
              <div className="mb-8">
                <Image 
                  src="/Rastući full logo.svg" 
                  alt="Rastući - Ropa Infantil de Calidad"
                  width={160}
                  height={96}
                  className="h-24 md:h-32 lg:h-40 w-auto mx-auto"
                  priority
                />
              </div>
              
              <p className="text-base md:text-xl muted mb-8 max-w-2xl">
                {home.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link href="/productos">
                  <Button variant="hero">{home.ctaPrimaryLabel}</Button>
                </Link>
                <Link href="#categorias" className="inline-flex">
                  <Button variant="product">
                    {home.ctaSecondaryLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section
            id="categorias"
            className="py-16 px-6 max-w-[1200px] mx-auto"
            aria-labelledby="categories-title">
            <h2
              id="categories-title"
              className="text-3xl font-bold text-center mb-10 font-montserrat">
              Nuestras Categorías
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {categories.map((category) => (
                <Link
                  href={`/productos?categoryId=${category.id}`}
                  key={category.id}
                  className="relative rounded-2xl overflow-hidden group shadow-lg surface aspect-[4/3] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus-visible:outline-none"
                  aria-label={`Ver productos de la categoría ${category.name}`}>
                  {/* Imagen de la categoría */}
                  <div className="relative w-full h-full">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={`Imagen representativa de ${category.name}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        quality={90}
                      />
                    ) : (
                      <div className="w-full h-full surface flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
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
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Overlay con gradiente para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                  {/* Contenido */}
                  <div className="absolute inset-0 z-20 flex items-end p-4 md:p-6">
                    <div className="w-full">
                      <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-1 drop-shadow line-clamp-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-white/90 text-xs md:text-sm drop-shadow line-clamp-2">
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
            className="surface py-16 px-6"
            aria-labelledby="featured-products-title">
            <div className="max-w-[1200px] mx-auto">
              <h2
                id="featured-products-title"
                className="text-3xl font-bold text-center mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {home.featuredTitle}
              </h2>
              <p className="text-center text-sm muted mb-10">{home.featuredSubtitle}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
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
                <div className="w-24 h-24 surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-primary"
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
                <h2 className="text-2xl font-bold mb-4 font-montserrat">
                  Próximamente
                </h2>
                <p className="muted text-lg max-w-md mx-auto">
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

        {/* Promotional Banner - Benefits from settings */}
        <section
          className="py-12 px-6"
          aria-labelledby="benefits-title">
          <div className="max-w-[1200px] mx-auto">
            <h2 id="benefits-title" className="sr-only">
              Beneficios de compra
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {home.benefits.map((b, idx) => (
                <div className="flex flex-col items-center" key={idx}>
                  {b.icon === "truck" && (
                    <Truck size={48} className="text-primary mb-3" aria-hidden="true" />
                  )}
                  {b.icon === "credit" && (
                    <CreditCard size={48} className="text-primary mb-3" aria-hidden="true" />
                  )}
                  {b.icon === "shield" && (
                    <ShieldCheck size={48} className="text-primary mb-3" aria-hidden="true" />
                  )}
                  <h3 className="font-bold text-lg font-montserrat">{b.title}</h3>
                  <p className="text-sm muted">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
