"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

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

  // Reset selected image when the image list changes
  // We use a deep comparison or length check to avoid unnecessary resets if the array reference changes but content is same
  // But for simple URL arrays, checking the first item or length usually suffices, or just stringifying
  const imagesKey = JSON.stringify(images);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to trigger when the unified key changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to trigger when the unified key changes
  useEffect(() => {
    setSelectedImage(0);
  }, [imagesKey]);

  // Using useEffect or a key pattern. Since we are inside the component:
  if (images.length > 0 && selectedImage >= images.length) {
    setSelectedImage(0);
  }

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

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 surface border border-muted rounded-lg flex items-center justify-center">
        <p className="muted">No hay imágenes disponibles</p>
      </div>
    );
  }

  const nextImage = () => {
    const newIndex = (selectedImage + 1) % images.length;
    changeImage(newIndex, "right");
  };

  const prevImage = () => {
    const newIndex = (selectedImage - 1 + images.length) % images.length;
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

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label={`Galería de imágenes de ${productName}`}
    >
      {/* Imagen principal */}
      <div
        className="relative w-full aspect-square surface border border-muted rounded-lg overflow-hidden group"
        style={{ position: "relative" }}
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
          <Image
            src={images[selectedImage]}
            alt={`${productName} - Imagen ${selectedImage + 1} de ${
              images.length
            }`}
            fill
            className="object-cover"
            priority={selectedImage === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
          />
        </div>

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              onKeyDown={(e) => handleKeyDown(e, prevImage)}
              aria-label={`Imagen anterior de ${productName}`}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={nextImage}
              onKeyDown={(e) => handleKeyDown(e, nextImage)}
              aria-label={`Imagen siguiente de ${productName}`}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
            aria-live="polite"
          >
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="pt-2">
          {/* Thumbnail list for accessibility: tests expect a list role with this label */}
          <div
            className="flex gap-3 overflow-x-auto pb-4 pt-3 px-2"
            role="list"
            aria-label="Miniaturas de imágenes"
          >
            {images.map((image, index) => (
              <button
                key={`item-${index}`}
                onClick={() => selectImage(index)}
                onKeyDown={(e) => handleKeyDown(e, () => selectImage(index))}
                aria-label={`Seleccionar imagen ${index + 1} de ${productName}`}
                aria-current={index === selectedImage ? "true" : "false"}
                className={`relative w-20 h-20 rounded-lg shrink-0 transition-all duration-200 focus:outline-none ${
                  index === selectedImage
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                    : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-theme"
                }`}
              >
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${productName} - Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    quality={75}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
