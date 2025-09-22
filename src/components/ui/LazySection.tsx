"use client";

import React from "react";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import { LoadingSpinner } from "./LoadingComponents";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Componente que carga su contenido solo cuando entra en viewport
 * Útil para secciones pesadas que no son críticas inicialmente
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  className = "",
  threshold = 0.1,
  rootMargin = "50px",
}) => {
  const { elementRef, isVisible } = useLazyLoad({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="md" />
    </div>
  );

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
    >
      {isVisible ? children : fallback || defaultFallback}
    </div>
  );
};

export default LazySection;
