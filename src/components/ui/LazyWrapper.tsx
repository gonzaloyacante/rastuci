"use client";

import React, { Suspense, ComponentType } from "react";
import { LoadingSpinner } from "./LoadingComponents";

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

// HOC para crear componentes lazy con fallback personalizado
export function withLazyLoading<P extends React.JSX.IntrinsicAttributes = Record<string, unknown>>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component }),
  );

  const WrappedComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Utilidad para crear lazy imports con mejor UX - versión simplificada y robusta
export function createLazyComponent<P extends React.JSX.IntrinsicAttributes = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = "LazyComponent";
  return WrappedComponent;
}

// Utilidad específica para componentes que no tienen default export
export function createLazyComponentFromNamed<P extends React.JSX.IntrinsicAttributes = Record<string, unknown>>(
  importFn: () => Promise<Record<string, unknown>>,
  componentName: string,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(async () => {
    const moduleImport = await importFn();
    return { default: moduleImport[componentName] as ComponentType<P> };
  });

  const WrappedComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `Lazy${componentName}`;
  return WrappedComponent;
}

export default LazyWrapper;
