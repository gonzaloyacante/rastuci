import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = "md",
}) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse surface-secondary",
        roundedClasses[rounded],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Skeleton específicos para diferentes componentes
export const ProductCardSkeleton = () => (
  <div className="surface rounded-xl shadow-sm border border-muted overflow-hidden">
    <div className="relative aspect-square surface-secondary">
      <Skeleton className="w-full h-full" rounded="none" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Breadcrumb */}
    <div className="mb-6">
      <Skeleton className="h-4 w-48" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Imágenes */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full" rounded="lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map(() => (
            <Skeleton
              key={`image-thumb-${Math.random()}`}
              className="aspect-square"
              rounded="md"
            />
          ))}
        </div>
      </div>

      {/* Información del producto */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Tallas */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <div className="flex space-x-2">
            {[...Array(4)].map(() => (
              <Skeleton
                key={`size-option-${Math.random()}`}
                className="h-10 w-16"
                rounded="md"
              />
            ))}
          </div>
        </div>

        {/* Colores */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <div className="flex space-x-2">
            {[...Array(4)].map(() => (
              <Skeleton
                key={`color-option-${Math.random()}`}
                className="h-10 w-10"
                rounded="full"
              />
            ))}
          </div>
        </div>

        {/* Cantidad */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-12 w-32" rounded="md" />
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" rounded="md" />
          <Skeleton className="h-12 w-full" rounded="md" />
        </div>
      </div>
    </div>

    {/* Detalles del producto */}
    <div className="mt-12 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Características */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map(() => (
            <div
              key={`feature-${Math.random()}`}
              className="flex items-center space-x-2"
            >
              <Skeleton className="h-4 w-4" rounded="full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Reseñas */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map(() => (
            <div
              key={`review-${Math.random()}`}
              className="border-b border-muted pb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-1">
                  {[...Array(5)].map(() => (
                    <Skeleton
                      key={`star-${Math.random()}`}
                      className="h-3 w-3"
                      rounded="full"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-3 w-20 mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map(() => (
            <ProductCardSkeleton key={`related-product-${Math.random()}`} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ProductListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map(() => (
      <ProductCardSkeleton key={`product-list-${Math.random()}`} />
    ))}
  </div>
);

export const CategorySkeleton = () => (
  <div className="surface rounded-xl shadow-sm border border-muted overflow-hidden">
    <div className="relative aspect-3/4 surface-secondary">
      <Skeleton className="w-full h-full" rounded="none" />
    </div>
    <div className="p-4 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(5)].map(() => (
      <td key={`table-cell-${Math.random()}`} className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
    ))}
  </tr>
);

export const DashboardCardSkeleton = () => (
  <div className="surface rounded-lg shadow-sm border border-muted p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-12 w-12" rounded="full" />
    </div>
  </div>
);
