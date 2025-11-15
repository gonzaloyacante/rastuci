import CategoryIcon from "@/components/ui/CategoryIcon";
import { CategorySkeleton } from "@/components/ui/Skeleton";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { Category } from "@/types";
import Link from "next/link";

interface CategoriesSectionProps {
  categories: Category[];
  home?: HomeSettings;
  loading?: boolean;
}

export function CategoriesSection({
  categories,
  home,
  loading = false,
}: CategoriesSectionProps) {
  if (loading) {
    return (
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center font-montserrat">
            {home?.categoriesTitle || defaultHomeSettings.categoriesTitle}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(8)].map((_, index) => (
            <CategorySkeleton key={`item-${index}`} />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      id="categorias"
      className="py-12 px-4 max-w-7xl mx-auto"
      aria-labelledby="categories-title"
    >
      <div className="mb-8">
        <h2
          id="categories-title"
          className="text-2xl md:text-3xl font-bold text-center font-montserrat"
        >
          Nuestras Categorías
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((category) => (
          <Link
            href={`/productos?categoryId=${category.id}`}
            key={category.id}
            className="group"
            aria-label={`Ver productos de la categoría ${category.name}`}
          >
            <div className="relative rounded-xl overflow-hidden shadow-sm surface transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-muted/10">
              {/* Fondo con gradiente sutil */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/15" />

              {/* Contenido centrado - Aspecto compacto */}
              <div className="relative flex flex-col items-center justify-center p-4 sm:p-5 text-center min-h-[140px] sm:min-h-40">
                {/* Icono más pequeño */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <CategoryIcon categoryName={category.name} />
                </div>

                {/* Título de la categoría más compacto */}
                <h3 className="text-sm sm:text-base font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {category.name}
                </h3>

                {/* Descripción solo en pantallas grandes y más corta */}
                {category.description && (
                  <p className="hidden lg:block text-xs text-muted line-clamp-2 mb-2">
                    {category.description}
                  </p>
                )}

                {/* Indicador de navegación más pequeño */}
                <div className="flex items-center gap-1 text-primary/80 group-hover:text-primary transition-colors duration-300 mt-auto">
                  <span className="text-xs font-medium">Ver</span>
                  <svg
                    className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
