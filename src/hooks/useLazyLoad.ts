import { useState, useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
  enabled?: boolean;
}

/**
 * Hook consolidado para Intersection Observer
 * Combina funcionalidad de lazy loading y detección de viewport
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    root = null,
    triggerOnce = false,
    enabled = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isCurrentlyIntersecting = entry.isIntersecting;

      setIsIntersecting(isCurrentlyIntersecting);

      if (isCurrentlyIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    },
    [hasIntersected],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled || (triggerOnce && hasIntersected)) return;

    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
      root,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    callback,
    threshold,
    rootMargin,
    root,
    enabled,
    triggerOnce,
    hasIntersected,
  ]);

  return {
    ref: elementRef,
    elementRef, // Alias para compatibilidad
    isIntersecting,
    isVisible: isIntersecting, // Alias para compatibilidad
    hasIntersected,
  };
}

// Alias para compatibilidad con código existente
export const useLazyLoad = useIntersectionObserver;

/**
 * Hook para precargar componentes cuando el usuario está cerca
 * Útil para mejorar la UX precargando antes de que sea necesario
 */
export function usePreload(options: UseIntersectionObserverOptions = {}) {
  const { threshold = 0.3, rootMargin = "200px", triggerOnce = true } = options;

  return useIntersectionObserver({ threshold, rootMargin, triggerOnce });
}

/**
 * Hook para lazy loading con delay
 * Útil para evitar cargas innecesarias en scroll rápido
 */
export function useLazyLoadWithDelay(
  delay: number = 150,
  options: UseIntersectionObserverOptions = {},
) {
  const { elementRef, isVisible } = useIntersectionObserver(options);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, shouldLoad, delay]);

  return {
    elementRef,
    shouldLoad,
  };
}
