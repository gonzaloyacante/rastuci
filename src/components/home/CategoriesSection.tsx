import Link from "next/link";
import { Category } from "@/types";
import { CategorySkeleton } from "@/components/ui/Skeleton";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";

interface CategoriesSectionProps {
  categories: Category[];
  home?: HomeSettings;
  loading?: boolean;
}

export function CategoriesSection({ categories, home, loading = false }: CategoriesSectionProps) {
  if (loading) {
    return (
      <section className="min-h-[calc(100svh-4rem)] py-16 px-6 max-w-[1200px] mx-auto flex flex-col justify-center">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center mb-10 font-montserrat">
            {home?.categoriesTitle || defaultHomeSettings.categoriesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 flex-1 items-center">
            {[...Array(6)].map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
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
      className="min-h-[calc(100svh-4rem)] py-16 px-6 max-w-[1200px] mx-auto flex flex-col justify-center"
      aria-labelledby="categories-title">
      <div className="flex-1 flex flex-col justify-center">
        <h2
          id="categories-title"
          className="text-3xl font-bold text-center mb-10 font-montserrat">
          Nuestras Categorías
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 flex-1 items-center">
          {categories.map((category) => (
            <Link
              href={`/productos?categoryId=${category.id}`}
              key={category.id}
              className="group"
              aria-label={`Ver productos de la categoría ${category.name}`}>
              <div className="relative rounded-2xl overflow-hidden group shadow-lg surface aspect-square transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus-visible:outline-none border border-muted/20">
                {/* Fondo con gradiente sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/15" />
                
                {/* Contenido centrado */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  {/* Icono dinámico basado en el nombre de la categoría */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <CategoryIcon categoryName={category.name} />
                  </div>
                  
                  {/* Título de la categoría */}
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {category.name}
                  </h3>
                  
                  {/* Descripción si existe */}
                  {category.description && (
                    <p className="text-sm text-muted line-clamp-3 mb-4">
                      {category.description}
                    </p>
                  )}
                  
                  {/* Indicador de navegación */}
                  <div className="flex items-center gap-2 text-primary group-hover:text-primary/80 transition-colors duration-300">
                    <span className="text-sm font-medium">Explorar</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}