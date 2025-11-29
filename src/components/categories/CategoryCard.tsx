import CategoryIcon from "@/components/ui/CategoryIcon";
import { type Category } from "@/types";
import Link from "next/link";
import { memo } from "react";

interface CategoryCardProps {
  category: Category;
  displayMode?: "image" | "icon";
  href?: string | null; // if null, render as non-clickable card (useful for admin)
}

export const CategoryCard = memo(function CategoryCard({
  category,
  displayMode = "image",
  href,
}: CategoryCardProps) {
  const img = category.image;
  const showIcon = !(displayMode === "image" && img);

  const Wrapper: React.ElementType = href === null ? "div" : Link;
  const wrapperProps: Record<string, string> =
    href === null
      ? {}
      : { href: href ?? `/productos?categoryId=${category.id}` };

  return (
    <Wrapper
      {...wrapperProps}
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl w-full aspect-[3/4] text-white transition-transform duration-200 hover:scale-[1.02] text-center bg-surface-secondary"
      aria-label={
        href === null
          ? undefined
          : `Ver productos de la categoría ${category.name}`
      }
    >
      {/* Background image (only if available) */}
      {displayMode === "image" && img ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${img}')` }}
        />
      ) : null}

      {/* overlay para mejorar legibilidad del texto (única capa) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 p-3 sm:p-3 flex flex-col min-h-[110px] items-center">
        {showIcon ? (
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
              <CategoryIcon categoryName={category.name} />
            </div>
          </div>
        ) : null}

        <h3 className="text-sm sm:text-sm font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {category.name}
        </h3>

        {category.description && (
          <p className="hidden lg:block text-[10px] text-muted line-clamp-2 mb-3">
            {category.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-primary/80 group-hover:text-primary transition-colors duration-300">
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
    </Wrapper>
  );
});
