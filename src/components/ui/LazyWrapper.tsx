"use client";

import React, { Suspense, ComponentType } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  fallback,
  className = "",
  children,
}) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

// HOC para crear componentes lazy con fallback personalizado - versión simplificada
export function withLazyLoading(
  Component: ComponentType<Record<string, unknown>>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component }),
  );

  const WrappedComponent = (props: Record<string, unknown>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Utilidad para crear lazy imports con mejor UX - versión simplificada
export function createLazyComponent(
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent = (props: Record<string, unknown>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = "LazyComponent";
  return WrappedComponent;
}

// Utilidad específica para componentes que no tienen default export
export function createLazyComponentFromNamed(
  importFn: () => Promise<Record<string, unknown>>,
  componentName: string,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(async () => {
    const moduleImport = await importFn();
    return { default: moduleImport[componentName] as ComponentType<Record<string, unknown>> };
  });

  const WrappedComponent = (props: Record<string, unknown>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `Lazy${componentName}`;
  return WrappedComponent;
}

export default LazyWrapper;
