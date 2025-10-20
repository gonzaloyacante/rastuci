"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 surface border border-muted rounded-lg flex items-center justify-center">
        <p className="muted">No hay imágenes disponibles</p>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
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
      aria-label={`Galería de imágenes de ${productName}`}>
      {/* Imagen principal */}
      <div className="relative w-full aspect-square md:h-96 surface border border-muted rounded-lg overflow-hidden group" style={{ position: 'relative' }}>
        <Image
          src={images[selectedImage]}
          alt={`${productName} - Imagen ${selectedImage + 1} de ${
            images.length
          }`}
          fill
          className="object-cover"
          priority={selectedImage === 0} // Prioridad para la primera imagen
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90}
        />

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              onKeyDown={(e) => handleKeyDown(e, prevImage)}
              aria-label={`Imagen anterior de ${productName}`}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={nextImage}
              onKeyDown={(e) => handleKeyDown(e, nextImage)}
              aria-label={`Imagen siguiente de ${productName}`}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 surface rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm"
            aria-live="polite">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div>
          {/* Thumbnail list for accessibility: tests expect a list role with this label */}
          <div className="flex gap-2 overflow-x-auto" role="list" aria-label="Miniaturas de imágenes">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                onKeyDown={(e) => handleKeyDown(e, () => setSelectedImage(index))}
                aria-label={`Seleccionar imagen ${index + 1} de ${productName}`}
                aria-current={index === selectedImage ? 'true' : 'false'}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === selectedImage
                    ? "border-primary ring-2"
                    : "border-muted hover:border-muted"
                }`} style={{ position: 'relative' }}>
                <Image
                  src={image}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={75}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
