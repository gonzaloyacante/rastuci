import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategorySkeleton } from "@/components/ui/Skeleton";
import { type HomeSettings } from "@/lib/validation/home";
import { type Category } from "@/types";

interface CategoriesSectionProps {
  categories?: Category[];
  home?: HomeSettings;
  /** Presentación: 'image' (por defecto) o 'icon' */
  display?: "image" | "icon";
  loading?: boolean;
}

export function CategoriesSection({
  categories = [],
  home,
  display = "image",
  loading = false,
}: CategoriesSectionProps) {
  const hasCategories = categories.length > 0;

  return (
    <section
      id="categorias"
      className="py-12 px-4 max-w-7xl mx-auto"
      aria-labelledby="categories-title"
    >
      <div className="mb-8 text-center">
        <h2 id="categories-title" className="text-2xl md:text-3xl font-bold">
          {home?.categoriesTitle ?? "Nuestras Categorías"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 justify-items-center">
        {loading
          ? Array.from({ length: 12 }, (_, i) => <CategorySkeleton key={i} />)
          : hasCategories
            ? categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  displayMode={display}
                />
              ))
            : null}
      </div>
    </section>
  );
}
