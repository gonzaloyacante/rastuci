import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  primary: "border-primary",
  secondary: "border-muted",
  white: "border-white",
};

export default function LoadingSpinner({
  size = "md",
  color = "primary",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

// Componente de loading para páginas completas
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center surface">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 muted">Cargando...</p>
      </div>
    </div>
  );
}

// Componente de loading para secciones
export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 muted">Cargando contenido...</p>
      </div>
    </div>
  );
}

// Componente de loading para cards
export function CardLoader() {
  return (
    <div className="animate-pulse">
      <div className="surface-secondary rounded-lg h-48 mb-4" />
      <div className="space-y-2">
        <div className="h-4 surface-secondary rounded w-3/4" />
        <div className="h-4 surface-secondary rounded w-1/2" />
        <div className="h-6 surface-secondary rounded w-1/3" />
      </div>
    </div>
  );
}

// Componente de loading para listas
export function ListLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex space-x-4">
            <div className="surface-secondary rounded-lg h-16 w-16" />
            <div className="flex-1 space-y-2">
              <div className="h-4 surface-secondary rounded w-3/4" />
              <div className="h-3 surface-secondary rounded w-1/2" />
              <div className="h-3 surface-secondary rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
