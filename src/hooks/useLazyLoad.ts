import { useState, useEffect, useRef } from "react";

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook para lazy loading basado en Intersection Observer
 * Útil para cargar componentes cuando entran en viewport
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const { threshold = 0.1, rootMargin = "50px", triggerOnce = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return {
    elementRef,
    isVisible: isVisible || hasTriggered,
  };
}

/**
 * Hook para precargar componentes cuando el usuario está cerca
 * Útil para mejorar la UX precargando antes de que sea necesario
 */
export function usePreload(options: UseLazyLoadOptions = {}) {
  const { threshold = 0.3, rootMargin = "200px", triggerOnce = true } = options;

  return useLazyLoad({ threshold, rootMargin, triggerOnce });
}

/**
 * Hook para lazy loading con delay
 * Útil para evitar cargas innecesarias en scroll rápido
 */
export function useLazyLoadWithDelay(
  delay: number = 150,
  options: UseLazyLoadOptions = {},
) {
  const { elementRef, isVisible } = useLazyLoad(options);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldLoad, delay]);

  return {
    elementRef,
    shouldLoad,
  };
}
