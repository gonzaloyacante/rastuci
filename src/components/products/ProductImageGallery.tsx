"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Button } from "@/components/ui/Button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );

  // Hover zoom state (MercadoLibre style)
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Reset selected image when the image list changes
  const imagesKey = JSON.stringify(images);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to trigger when the unified key changes
  useEffect(() => {
    setSelectedImage(0);
    setFailedImages(new Set());
  }, [imagesKey]);

  // Sort images: valid first, failed last
  const sortedImages = [...images].sort((a, b) => {
    const isAFailed = failedImages.has(a);
    const isBFailed = failedImages.has(b);
    if (isAFailed && !isBFailed) return 1;
    if (!isAFailed && isBFailed) return -1;
    return images.indexOf(a) - images.indexOf(b);
  });

  // Prevent index out of bounds
  if (sortedImages.length > 0 && selectedImage >= sortedImages.length) {
    setSelectedImage(0);
  }

  const handleImageError = useCallback((src: string) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(src);
      return newSet;
    });
  }, []);

  const changeImage = useCallback(
    (newIndex: number, direction: "left" | "right") => {
      if (isTransitioning) return;
      setSlideDirection(direction);
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedImage(newIndex);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 150);
    },
    [isTransitioning]
  );

  // Handle mouse move for zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="w-full h-96 surface border border-muted rounded-lg flex items-center justify-center">
        <p className="muted">No hay imágenes disponibles</p>
      </div>
    );
  }

  const nextImage = () => {
    const newIndex = (selectedImage + 1) % sortedImages.length;
    changeImage(newIndex, "right");
  };

  const prevImage = () => {
    const newIndex =
      (selectedImage - 1 + sortedImages.length) % sortedImages.length;
    changeImage(newIndex, "left");
  };

  const selectImage = (index: number) => {
    if (index === selectedImage) return;
    const direction = index > selectedImage ? "right" : "left";
    changeImage(index, direction);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  // Zoom factor for the magnified view
  const zoomFactor = 2.5;

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label={`Galería de imágenes de ${productName}`}
    >
      {/* Main image container */}
      <div
        ref={imageContainerRef}
        className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full max-h-[500px] md:max-h-[60vh] lg:max-h-none mx-auto bg-neutral-100 dark:bg-neutral-800 border border-muted rounded-lg overflow-hidden group cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            isTransitioning
              ? slideDirection === "right"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          <OptimizedImage
            src={sortedImages[selectedImage]}
            alt={`${productName} - Imagen ${selectedImage + 1} de ${sortedImages.length}`}
            fill
            className="object-contain"
            priority={selectedImage === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
            showTextFallback={true}
            showSkeleton={false}
            enableFade={false}
            onError={() => handleImageError(sortedImages[selectedImage])}
          />
        </div>

        {/* Zoom lens indicator - desktop only */}
        {isZooming && (
          <div
            className="hidden lg:block absolute pointer-events-none border-2 border-primary/50 bg-white/10 rounded"
            style={{
              width: `${100 / zoomFactor}%`,
              height: `${100 / zoomFactor}%`,
              left: `${Math.min(Math.max(zoomPosition.x - 100 / zoomFactor / 2, 0), 100 - 100 / zoomFactor)}%`,
              top: `${Math.min(Math.max(zoomPosition.y - 100 / zoomFactor / 2, 0), 100 - 100 / zoomFactor)}%`,
            }}
          />
        )}

        {/* Navigation controls */}
        {sortedImages.length > 1 && (
          <>
            <Button
              onClick={prevImage}
              onKeyDown={(e) => handleKeyDown(e, prevImage)}
              variant="ghost"
              aria-label={`Imagen anterior de ${productName}`}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10 h-auto min-h-0 min-w-0"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
            <Button
              onClick={nextImage}
              onKeyDown={(e) => handleKeyDown(e, nextImage)}
              variant="ghost"
              aria-label={`Imagen siguiente de ${productName}`}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10 h-auto min-h-0 min-w-0"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </>
        )}

        {/* Current image indicator */}
        {sortedImages.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10"
            aria-live="polite"
          >
            {selectedImage + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Zoom preview - fixed overlay on right side (MercadoLibre style) */}
      {isZooming && (
        <div
          className="hidden lg:block fixed z-50 w-[500px] h-[500px] bg-white dark:bg-neutral-900 border border-muted rounded-lg shadow-2xl overflow-hidden pointer-events-none"
          style={{
            top: imageContainerRef.current?.getBoundingClientRect().top ?? 100,
            left:
              (imageContainerRef.current?.getBoundingClientRect().right ?? 0) +
              24,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${sortedImages[selectedImage]})`,
              backgroundSize: `${zoomFactor * 100}%`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      )}

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="pt-2">
          {/* Thumbnail list for accessibility: tests expect a list role with this label */}
          <div
            className="flex gap-3 overflow-x-auto pb-4 pt-3 px-2"
            role="list"
            aria-label="Miniaturas de imágenes"
          >
            {sortedImages.map((image, index) => (
              <Button
                key={`item-${index}`}
                onClick={() => selectImage(index)}
                onKeyDown={(e) => handleKeyDown(e, () => selectImage(index))}
                variant="ghost"
                aria-label={`Seleccionar imagen ${index + 1} de ${productName}`}
                aria-current={index === selectedImage ? "true" : "false"}
                className={`relative w-20 h-20 rounded-lg shrink-0 transition-all duration-200 focus:outline-none bg-neutral-100 dark:bg-neutral-800 p-0 h-auto min-h-0 min-w-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  index === selectedImage
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-theme"
                }`}
              >
                <div className="w-full h-full rounded-lg overflow-hidden pointer-events-none">
                  <OptimizedImage
                    src={image}
                    alt={`${productName} - Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    quality={60}
                    onError={() => handleImageError(image)}
                  />
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
