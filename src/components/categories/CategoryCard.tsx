import CategoryIcon from "@/components/ui/CategoryIcon";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
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
      : { href: href ?? `/productos?categoria=${category.id}` };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative flex flex-col overflow-hidden rounded-xl w-full transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl
        ${
          displayMode === "image" && category.image
            ? "aspect-[3/4] justify-end text-white bg-surface-secondary"
            : "h-48 justify-center text-foreground bg-surface"
        }`}
      aria-label={
        href === null
          ? undefined
          : `Ver productos de la categoría ${category.name}`
      }
    >
      {/* Background image and overlay (only if available) */}
      {displayMode === "image" && img ? (
        <>
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <OptimizedImage
              src={img}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              showTextFallback={true}
            />
          </div>
          {/* Shadow overlay ONLY for image cards */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </>
      ) : null}

      <div className="relative z-10 p-3 sm:p-3 flex flex-col min-h-[110px] items-center">
        {showIcon ? (
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center shadow-sm text-white dark:text-black">
              <CategoryIcon categoryName={category.name} />
            </div>
          </div>
        ) : null}

        <h3 className="text-sm sm:text-sm font-semibold mb-1 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {category.name}
        </h3>

        {category.description && (
          <p className="text-xs text-muted line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Wrapper>
  );
});
