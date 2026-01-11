"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

const PRODUCT_IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

// Simple lazy image hook
function useLazyImage(
  _src: string,
  _options: { quality?: number; priority?: boolean }
) {
  const [isInView, setIsInView] = useState(false);
  return { isInView, setIsInView };
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number; // Optional if fill is true
  height?: number; // Optional if fill is true
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  lazy?: boolean;
  fill?: boolean; // New prop
  onLoad?: () => void;
  onError?: () => void;
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
  placeholder = "blur",
  blurDataURL,
  lazy = true,
  fill = false,
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
      { threshold: 0.1, rootMargin: "50px" }
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
    `<svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>`
  ).toString("base64")}`;

  if (imageError) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <Image
          src={PLACEHOLDER_IMAGE}
          alt={alt || "Imagen no disponible"}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          quality={60}
          className="object-cover opacity-80 grayscale"
          unoptimized // Placehold.co might not work well with Next.js optimization sometimes
        />
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? { width: "100%", height: "100%" } : undefined}
    >
      {(isInView || priority) && (
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
            blurDataURL={blurDataURL || defaultBlurDataURL}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Loading skeleton */}
          {!isLoaded && (
            <div
              className="absolute inset-0 animate-pulse surface"
              style={fill ? undefined : { width, height }}
            />
          )}
        </>
      )}

      {/* Lazy loading placeholder */}
      {!isInView && !priority && (
        <div
          className="surface animate-pulse"
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
    />
  );
}
