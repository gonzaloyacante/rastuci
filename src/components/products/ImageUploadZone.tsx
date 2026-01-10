"use client";

import { Button } from "@/components/ui/Button";
import { logger } from "@/lib/logger";
import { AlertCircle, Check, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface ImageUploadZoneProps {
  existingImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

interface ImageState {
  url?: string;
  file?: File;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
}

export default function ImageUploadZone({
  existingImages,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
}: ImageUploadZoneProps) {
  const [images, setImages] = useState<ImageState[]>(
    existingImages.map((url) => ({ url, uploaded: true }))
  );
  const [isDragging, setIsDragging] = useState(false);

  // Use ref to avoid infinite loop when onImagesChange reference changes on every render
  const onImagesChangeRef = useRef(onImagesChange);

  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  // Notificar cambios de imágenes cuando el estado cambia
  useEffect(() => {
    const updatedUrls = images
      .map((img) => img.url)
      .filter(Boolean) as string[];
    onImagesChangeRef.current(updatedUrls);
  }, [images]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      // NO incluir Content-Type header - el browser lo configura automáticamente con boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data: { success: boolean; url?: string; error?: string } =
      await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || "Error al subir imagen");
    }

    return data.url;
  };

  const addFiles = useCallback(
    async (files: File[]) => {
      const validateFile = (file: File): string | null => {
        // Validar tipo
        if (!file.type.startsWith("image/")) {
          return "El archivo debe ser una imagen";
        }

        // Validar tamaño
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
          return `El archivo supera el tamaño máximo de ${maxSizeMB}MB`;
        }

        return null;
      };
      const currentCount = images.length;
      const remainingSlots = maxImages - currentCount;

      if (remainingSlots <= 0) {
        toast.error(`Máximo ${maxImages} imágenes permitidas`);
        return;
      }

      const filesToAdd = files.slice(0, remainingSlots);
      const newImages: ImageState[] = [];

      // Validar y crear previews
      for (const file of filesToAdd) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview, uploading: false, uploaded: false });
      }

      if (newImages.length === 0) {
        return;
      }

      setImages((prev) => [...prev, ...newImages]);

      // Subir automáticamente
      for (let i = 0; i < newImages.length; i++) {
        const imageIndex = currentCount + i;
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === imageIndex ? { ...img, uploading: true } : img
          )
        );

        try {
          const url = await uploadToCloudinary(newImages[i].file!);

          setImages((prev) => {
            return prev.map((img, idx) =>
              idx === imageIndex
                ? { url, uploaded: true, uploading: false }
                : img
            );
          });

          toast.success(`Imagen ${i + 1}/${newImages.length} subida`);
        } catch (error) {
          logger.error("Error uploading image:", { error });
          const errorMsg =
            error instanceof Error ? error.message : "Error al subir";

          setImages((prev) =>
            prev.map((img, idx) =>
              idx === imageIndex
                ? { ...img, uploading: false, error: errorMsg }
                : img
            )
          );

          toast.error(`Error al subir ${newImages[i].file!.name}`);
        }
      }
    },
    [images, maxImages, maxSizeMB]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
    e.target.value = ""; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const image = images[index];

    // Revocar preview URL
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));

    // Actualizar URLs
    const updatedUrls = images
      .filter((_, i) => i !== index)
      .map((img) => img.url)
      .filter(Boolean) as string[];
    onImagesChange(updatedUrls);
    toast.success("Imagen eliminada");
  };

  const retryUpload = async (index: number) => {
    const image = images[index];
    if (!image.file) {
      return;
    }

    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, uploading: true, error: undefined } : img
      )
    );

    try {
      const url = await uploadToCloudinary(image.file);

      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { url, uploaded: true, uploading: false } : img
        )
      );

      const updatedUrls = images
        .map((img) => img.url)
        .filter(Boolean) as string[];
      updatedUrls[index] = url;
      onImagesChange(updatedUrls);

      toast.success("Imagen subida correctamente");
    } catch (error) {
      logger.error("Error retrying upload:", { error });
      const errorMsg =
        error instanceof Error ? error.message : "Error al subir";

      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, uploading: false, error: errorMsg } : img
        )
      );

      toast.error("Error al reintentar subida");
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={`image-${index}-${image.url || image.preview}`}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-colors"
            >
              {/* Imagen */}
              <div className="w-full h-full bg-surface relative">
                {(image.url || image.preview) && (
                  <Image
                    src={image.url || image.preview!}
                    alt={`Producto ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Estado: Subiendo */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-xs">Subiendo...</p>
                  </div>
                </div>
              )}

              {/* Estado: Subido */}
              {image.uploaded && !image.uploading && (
                <div className="absolute top-2 left-2 bg-success text-white p-1 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Estado: Error */}
              {image.error && (
                <div className="absolute inset-0 bg-error/90 flex items-center justify-center p-2">
                  <div className="text-center text-white">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs mb-2">{image.error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryUpload(index)}
                      className="text-xs"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              )}

              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={image.uploading}
                className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-error/90"
                title="Eliminar imagen"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Número de imagen */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zona de drop */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : "border-muted hover:border-primary"
          }`}
        >
          <Upload
            className={`mx-auto h-12 w-12 mb-4 transition-colors ${
              isDragging ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <div className="text-lg font-medium mb-2">
            {isDragging ? "Suelta las imágenes aquí" : "Subir Imágenes"}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
            <label
              htmlFor="image-upload"
              className="relative cursor-pointer bg-primary text-white rounded-md px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
            >
              <span>Seleccionar archivos</span>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
            <span>o arrastra y suelta aquí</span>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP hasta {maxSizeMB}MB cada una
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {images.length}/{maxImages} imágenes • {maxImages - images.length}{" "}
            restantes
          </p>
        </div>
      )}

      {images.length >= maxImages && (
        <div className="text-center p-4 bg-warning/10 border border-warning rounded-lg">
          <p className="text-sm text-warning font-medium">
            Has alcanzado el límite de {maxImages} imágenes
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Elimina algunas imágenes para agregar nuevas
          </p>
        </div>
      )}
    </div>
  );
}
