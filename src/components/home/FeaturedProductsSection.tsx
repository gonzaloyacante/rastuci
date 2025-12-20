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

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      className="surface py-16 px-6"
      aria-labelledby="featured-products-title"
    >
      <div className="max-w-[1400px] mx-auto">
        <h2
          id="featured-products-title"
          className="text-3xl font-bold text-center mb-3 font-heading"
        >
          {home?.featuredTitle || defaultHomeSettings.featuredTitle}
        </h2>
        <p className="text-center text-sm muted mb-10">
          {home?.featuredSubtitle || defaultHomeSettings.featuredSubtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {products.map((product, index) => (
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
          ))}
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
