"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const PRODUCT_IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  lazy?: boolean;
  fill?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  /** If true, show "Imagen no disponible" text on error. Default: false (icon only) */
  showTextFallback?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 75,
  sizes = PRODUCT_IMAGE_SIZES,
  placeholder = "empty",
  blurDataURL,
  lazy = true,
  fill = false,
  onLoad,
  onError,
  showTextFallback = false,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setIsLoaded(false);
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Error state - show icon (and optionally text)
  if (imageError) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden flex flex-col items-center justify-center bg-muted/10 ${className}`}
        style={
          fill
            ? { position: "absolute", inset: 0 }
            : { width: "100%", height: "100%" }
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`text-muted/50 ${showTextFallback ? "w-12 h-12" : "w-1/3 h-1/3 max-w-8 max-h-8 min-w-4 min-h-4"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        {showTextFallback && (
          <span className="text-muted/50 text-sm mt-2">
            Imagen no disponible
          </span>
        )}
      </div>
    );
  }

  // Normal state
  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? { width: "100%", height: "100%" } : undefined}
    >
      {isInView && (
        <>
          <Image
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            sizes={sizes}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted/20" />
          )}
        </>
      )}

      {/* Lazy loading placeholder */}
      {!isInView && (
        <div
          className="bg-muted/20 animate-pulse"
          style={fill ? { position: "absolute", inset: 0 } : { width, height }}
        />
      )}
    </div>
  );
}

// Specialized components for common use cases
export function ProductImage({
  src,
  alt,
  className = "",
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
      showTextFallback={true}
    />
  );
}

export function ProductThumbnail({
  src,
  alt,
  className = "",
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
      showTextFallback={false}
    />
  );
}

export function HeroImage({
  src,
  alt,
  className = "",
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
      showTextFallback={true}
    />
  );
}
