import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton as UISkeletonProductCard } from "@/components/ui/Skeleton";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { Product } from "@/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface FeaturedProductsSectionProps {
  products: Product[];
  home?: HomeSettings;
  loading?: boolean;
}

export function FeaturedProductsSection({
  products,
  home,
  loading = false,
}: FeaturedProductsSectionProps) {
  if (loading) {
    return (
      <section className="surface py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 font-montserrat">
            Productos en Oferta
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={`item-${index}`}
                className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] max-w-[300px]"
              >
                <UISkeletonProductCard />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // if (!products || products.length === 0) {
  //   return null;
  // }
  // Comentado para mostrar la sección siempre, incluso sin ofertas (petición de diseño)

  return (
    <section
      className="surface py-16 px-6"
      aria-labelledby="featured-products-title"
    >
      <div className="max-w-[1400px] mx-auto">
        {(home?.showFeaturedTitle ?? true) && (
          <h2
            id="featured-products-title"
            className="text-3xl font-bold text-center mb-3 font-heading"
          >
            {home?.featuredTitle || defaultHomeSettings.featuredTitle}
          </h2>
        )}
        {(home?.showFeaturedSubtitle ?? true) && (
          <p className="text-center text-sm muted mb-10">
            {home?.featuredSubtitle || defaultHomeSettings.featuredSubtitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {!products || products.length === 0 ? (
            <div className="w-full text-center py-10">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-8 max-w-lg mx-auto border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-lg font-medium text-base-primary mb-2">
                  ¡Vaya! No hay ofertas activas en este momento.
                </p>
                <p className="text-sm muted mb-6">
                  Pero no te preocupes, tenemos precios increíbles en todo
                  nuestro catálogo.
                </p>
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
                >
                  Explorar todos los productos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] max-w-[300px]"
              >
                <ProductCard
                  product={product}
                  variant="grid"
                  priority={index < 2}
                />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            href="/productos?onSale=true"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Ver todas las ofertas
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
