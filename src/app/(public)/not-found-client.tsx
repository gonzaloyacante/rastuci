"use client";

import { ArrowLeft, Home, Package, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import ProductCard from "@/components/products/cards/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProductListSkeleton } from "@/components/ui/Skeleton";
import { ApiResponse, PaginatedResponse, Product } from "@/types";

const fetcher = async (
  url: string
): Promise<ApiResponse<PaginatedResponse<Product>>> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return (await res.json()) as ApiResponse<PaginatedResponse<Product>>;
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
  const swrKey: string | null = mounted
    ? "/api/products?limit=8&onSale=true"
    : null;

  const fallbackProducts: ApiResponse<PaginatedResponse<Product>> = {
    success: false,
    data: {
      data: [],
      total: 0,
      page: 1,
      limit: 8,
      totalPages: 1,
    },
  };

  const { data: productsData, isLoading } = useSWR<
    ApiResponse<PaginatedResponse<Product>>
  >(swrKey, fetcher, {
    fallbackData: fallbackProducts,
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

  // La API devuelve un objeto paginado: { success: true, data: { data: Product[], total, ... } }
  const products =
    productsData?.success && productsData.data
      ? (productsData.data as PaginatedResponse<Product>).data
      : [];

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="min-h-screen surface">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 404 Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="relative">
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
        {/* Product Recommendations */}

        {isLoading ? (
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
            <ProductListSkeleton />
          </div>
        ) : products.length > 0 ? (
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
        ) : null}

        {/* Footer message */}
        <div className="text-center py-8 border-t border-muted">
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
