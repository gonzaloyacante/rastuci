import React from "react";
import { cn } from "@/lib/utils";

export type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
  color?: "primary" | "white" | "gray";
};

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

const colorClasses = {
  primary: "text-primary",
  white: "text-white",
  gray: "text-gray-500",
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = "sm", 
  className, 
  ariaLabel = "Cargando",
  color = "primary"
}) => {
  return (
    <svg
      className={cn("animate-spin", sizeMap[size], colorClasses[color], className)}
      viewBox="0 0 24 24"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-busy="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};

// Componente de loading para páginas completas
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center surface">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

// Componente de loading para secciones
export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-2 text-muted-foreground">Cargando contenido...</p>
      </div>
    </div>
  );
}

export default Spinner;
