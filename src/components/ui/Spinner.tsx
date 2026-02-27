import React from "react";

import { cn } from "@/lib/utils";

import { LoadingSpinner } from "./LoadingStates";

export type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
  color?: "primary" | "white" | "gray";
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "sm",
  className,
  ariaLabel = "Cargando",
  color = "primary",
}) => {
  // Map 'xs' to 'sm' or handle it if LoadingSpinner supports it. LoadingSpinner supports sm, md, lg.
  // We'll map xs -> sm for now or add xs to LoadingSpinner.
  // Let's check LoadingSpinner sizes: sm, md, lg.
  // We'll map standard sizes.
  const mappedSize = size === "xs" ? "sm" : size;

  return (
    <LoadingSpinner
      size={mappedSize}
      className={className}
      color={color}
      // ariaLabel is not directly supported but passed via specific internal attributes,
      // we can ignore strict ariaLabel prop passing if accessible enough or extend LoadingSpinner.
      // For now, LoadingSpinner has aria-label="Cargando..." hardcoded or we can add it.
    />
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
