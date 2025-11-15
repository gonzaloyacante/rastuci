import { cn } from "@/lib/utils";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "gray";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    primary: "text-blue-600",
    white: "text-white",
    gray: "text-gray-500",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Cargando..."
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width,
  height,
  rounded = "md",
  lines = 1,
}) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <div
            key={`skeleton-line-${i}`}
            className={cn(
              "animate-pulse surface-secondary",
              roundedClasses[rounded],
              "h-4 w-full"
            )}
            style={{
              width: i === lines - 1 ? "75%" : width,
              height: height,
            }}
          />
        ))}
      </div>
    );
  }

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

// Alias para compatibilidad con Skeleton
export const Skeleton = LoadingSkeleton;

// Componente para múltiples skeletons en grid
interface LoadingGridProps {
  count?: number;
  columns?: number;
  className?: string;
  itemClassName?: string;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  count = 8,
  columns = 4,
  className,
  itemClassName,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-6",
        gridCols[columns as keyof typeof gridCols],
        className
      )}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={`loading-grid-${count}-${i}`}
          className={cn("space-y-3", itemClassName)}
        >
          <LoadingSkeleton className="aspect-square w-full" rounded="lg" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/2" />
          <LoadingSkeleton className="h-6 w-2/3" />
        </div>
      ))}
    </div>
  );
};

// Estados de carga específicos para diferentes contextos
export const LoadingCard = () => (
  <div className="surface rounded-lg shadow-sm border border-muted p-6 space-y-4">
    <LoadingSkeleton className="h-6 w-1/3" />
    <LoadingSkeleton lines={3} />
    <div className="flex justify-between items-center">
      <LoadingSkeleton className="h-4 w-1/4" />
      <LoadingSkeleton className="h-8 w-20" rounded="md" />
    </div>
  </div>
);

export const LoadingButton = () => (
  <div className="flex items-center justify-center space-x-2">
    <LoadingSpinner size="sm" />
    <span>Cargando...</span>
  </div>
);

export const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted">Cargando contenido...</p>
    </div>
  </div>
);
