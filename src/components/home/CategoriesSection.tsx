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

  if (!loading && !hasCategories) {
    return null;
  }

  return (
    <section
      id="categorias"
      className="bg-surface-secondary py-16 px-6"
      aria-labelledby="categories-title"
    >
      <div className="max-w-[1400px] mx-auto">
        {(home?.showCategoriesTitle ?? true) && (
          <h2
            id="categories-title"
            className="text-3xl font-bold text-center mb-3 font-heading"
          >
            {home?.categoriesTitle ?? "Nuestras Categorías"}
          </h2>
        )}
        {(home?.showCategoriesSubtitle ?? true) && (
          <p className="text-center text-sm muted mb-10">
            {home?.categoriesSubtitle ??
              "Explorá nuestras categorías de productos"}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] max-w-[300px]"
                >
                  <CategorySkeleton />
                </div>
              ))
            : categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-none w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] max-w-[300px]"
                >
                  <CategoryCard category={category} displayMode={display} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
