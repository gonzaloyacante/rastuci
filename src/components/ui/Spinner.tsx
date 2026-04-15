import React from "react";

import { cn } from "@/lib/utils";

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
  const sizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  const colorClasses = {
    primary: "text-primary",
    white: "text-white",
    gray: "text-gray-500",
  };
  return (
    <svg
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Cargando..."
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
};

export type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
  color?: "primary" | "white" | "gray";
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "sm",
  className,
  ariaLabel: _ariaLabel = "Cargando",
  color = "primary",
}) => {
  const mappedSize = size === "xs" ? "sm" : size;

  return (
    <LoadingSpinner size={mappedSize} className={className} color={color} />
  );
};

// Componente de loading para páginas completas
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center surface",
        className
      )}
    >
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

// Componente de loading para secciones
export function SectionLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-2 text-muted-foreground">Cargando contenido...</p>
      </div>
    </div>
  );
}

export default Spinner;
