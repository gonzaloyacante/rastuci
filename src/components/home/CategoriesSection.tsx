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
      className="surface py-16 px-6"
      aria-labelledby="categories-title"
    >
      <div className="max-w-[1400px] mx-auto">
        <h2
          id="categories-title"
          className="text-3xl font-bold text-center mb-3 font-heading"
        >
          {home?.categoriesTitle ?? "Nuestras Categorías"}
        </h2>
        <p className="text-center text-sm muted mb-10">
          {home?.categoriesSubtitle ??
            "Explorá nuestras categorías de productos"}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <CategorySkeleton key={i} />)
            : categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  displayMode={display}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
