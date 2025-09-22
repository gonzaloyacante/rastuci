import { useState, useEffect } from 'react';

// Image optimization utilities
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Hook for lazy loading images
export function useLazyImage(src: string, options: ImageOptimizationOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError('Failed to load image');
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView]);

  return { isLoaded, isInView, setIsInView, error };
}

// Generate optimized image URLs
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  options: ImageOptimizationOptions = {}
): string {
  if (!src) return '';

  const { quality = 75, format = 'webp' } = options;
  
  // For Next.js Image optimization
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });

  if (height) {
    params.set('h', height.toString());
  }

  return `/_next/image?${params.toString()}`;
}

// Generate responsive image sizes
export function generateImageSizes(breakpoints: Record<string, number>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, width]) => {
      if (breakpoint === 'default') {
        return `${width}px`;
      }
      return `(max-width: ${breakpoint}) ${width}px`;
    })
    .join(', ');
}

// Common responsive breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  '640px': 640,
  '768px': 768,
  '1024px': 1024,
  '1280px': 1280,
  default: 1920,
};

// Product image sizes
export const PRODUCT_IMAGE_SIZES = generateImageSizes({
  '640px': 320,
  '768px': 400,
  '1024px': 500,
  default: 600,
});

// Thumbnail sizes
export const THUMBNAIL_SIZES = generateImageSizes({
  '640px': 80,
  '768px': 100,
  default: 120,
});

// Generate blur placeholder
export function generateBlurPlaceholder(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Image preloader utility
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch preload images
export async function preloadImages(srcs: string[]): Promise<void> {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
}
