'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

const PRODUCT_IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

// Simple lazy image hook
function useLazyImage(_src: string, _options: { quality?: number; priority?: boolean }) {
  const [isInView, setIsInView] = useState(false);
  return { isInView, setIsInView };
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = PRODUCT_IMAGE_SIZES,
  placeholder = 'blur',
  blurDataURL,
  lazy = true,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  const { isInView, setIsInView } = useLazyImage(src, { quality, priority });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, setIsInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  ).toString('base64')}`;

  if (imageError) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center surface border border-muted ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 text-muted">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs muted">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {(isInView || priority) && (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            sizes={sizes}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL || defaultBlurDataURL}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
          
          {/* Loading skeleton */}
          {!isLoaded && (
            <div 
              className="absolute inset-0 animate-pulse surface"
              style={{ width, height }}
            />
          )}
        </>
      )}
      
      {/* Lazy loading placeholder */}
      {!isInView && !priority && (
        <div 
          className="surface animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

// Specialized components for common use cases
export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={className}
      priority={priority}
      sizes={PRODUCT_IMAGE_SIZES}
    />
  );
}

export function ProductThumbnail({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={120}
      height={120}
      className={className}
      sizes="120px"
      lazy={false}
    />
  );
}

export function HeroImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={800}
      className={className}
      priority={true}
      sizes="100vw"
    />
  );
}
