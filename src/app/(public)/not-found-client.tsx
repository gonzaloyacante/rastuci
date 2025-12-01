"use client";

import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types";
import { ArrowLeft, Home, Package, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

export default function NotFoundClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch featured/popular products ONLY after mount (lazy loading)
  // Using null key prevents SWR from fetching until mounted
  const { data: productsData, isLoading } = useSWR<{
    success: boolean;
    data: Product[];
  }>(mounted ? "/api/products?limit=8&featured=true" : null, fetcher, {
    fallbackData: { success: false, data: [] },
    revalidateOnFocus: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/productos?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const products = productsData?.success ? productsData.data : [];

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="min-h-screen surface">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 404 Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="text-primary text-9xl md:text-[12rem] font-bold font-montserrat opacity-20">
              404
            </div>
            <div className="relative -mt-16 md:-mt-20">
              <h1 className="text-4xl md:text-6xl font-bold text-primary font-montserrat mb-4">
                ¡Oops!
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">
                Página no encontrada
              </h2>
              <p className="text-lg muted max-w-2xl mx-auto">
                La página que buscas no existe o ha sido movida. No te
                preocupes, tenemos muchas otras cosas geniales para mostrarte.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="hero"
              size="lg"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Volver Atrás
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Home size={20} />
                Ir al Inicio
              </Button>
            </Link>
            <Link href="/productos">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Package size={20} />
                Ver Productos
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="surface border border-muted">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-primary mb-2 font-montserrat">
                  ¿Buscabas algo específico?
                </h3>
                <p className="muted">Prueba buscar el producto que necesitas</p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted"
                    size={20}
                  />
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg">
                  Buscar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Product Recommendations */}
        {!isLoading && products.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primary mb-2 font-montserrat flex items-center justify-center gap-2">
                <TrendingUp size={24} />
                Productos Populares
              </h3>
              <p className="muted">
                Quizás te interese alguno de estos productos destacados
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/productos">
                <Button variant="outline" size="lg">
                  Ver Todos los Productos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-primary mb-6 text-center font-montserrat">
            ¿Necesitas ayuda?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="surface border border-muted hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="pill-icon mx-auto mb-4">
                  <Home size={24} />
                </div>
                <h4 className="font-semibold text-primary mb-2">
                  Página Principal
                </h4>
                <p className="text-sm muted mb-4">
                  Explora nuestras ofertas y productos destacados
                </p>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    Ir al Inicio
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="surface border border-muted hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="pill-icon mx-auto mb-4">
                  <Package size={24} />
                </div>
                <h4 className="font-semibold text-primary mb-2">Catálogo</h4>
                <p className="text-sm muted mb-4">
                  Navega por todas nuestras categorías
                </p>
                <Link href="/productos">
                  <Button variant="outline" size="sm">
                    Ver Catálogo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="surface border border-muted hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="pill-icon mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h4 className="font-semibold text-primary mb-2">Contacto</h4>
                <p className="text-sm muted mb-4">
                  ¿Tienes preguntas? Estamos aquí para ayudarte
                </p>
                <Link href="/contacto">
                  <Button variant="outline" size="sm">
                    Contactanos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-center mt-12 py-8 border-t border-muted">
          <p className="text-sm muted">
            Si el problema persiste, por favor{" "}
            <Link
              href="/contacto"
              className="text-primary underline hover:no-underline"
            >
              contáctanos
            </Link>{" "}
            para obtener ayuda.
          </p>
        </div>
      </main>
    </div>
  );
}
