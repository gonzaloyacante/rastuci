import { Product } from "@/types";
import { ProductCardSkeleton as UISkeletonProductCard } from "@/components/ui/Skeleton";
import ProductCard from "@/components/ProductCard";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";

interface FeaturedProductsSectionProps {
  products: Product[];
  home?: HomeSettings;
  loading?: boolean;
}

export function FeaturedProductsSection({ products, home, loading = false }: FeaturedProductsSectionProps) {
  if (loading) {
    return (
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
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      className="surface py-16 px-6"
      aria-labelledby="featured-products-title">
      <div className="max-w-[1200px] mx-auto">
        <h2
          id="featured-products-title"
          className="text-3xl font-bold text-center mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {home?.featuredTitle || defaultHomeSettings.featuredTitle}
        </h2>
        <p className="text-center text-sm muted mb-10">
          {home?.featuredSubtitle || defaultHomeSettings.featuredSubtitle}
        </p>
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
  );
}