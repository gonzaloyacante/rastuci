"use client";

import { AlertCircle, Check, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";

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

// ============================================================================
// Module-level helpers (no component-state dependency)
// ============================================================================
interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

function parseUploadResponse(data: UploadResponse): string {
  if (!data.success || !data.url) {
    throw new Error(data.error ?? "Error al subir imagen");
  }
  return data.url;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    // NO incluir Content-Type header - el browser lo configura automáticamente con boundary
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return parseUploadResponse((await response.json()) as UploadResponse);
}

function validateFile(file: File, maxSizeMB: number): string | null {
  if (!file.type.startsWith("image/")) {
    return "El archivo debe ser una imagen";
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `El archivo supera el tamaño máximo de ${maxSizeMB}MB`;
  }
  return null;
}

type SetImages = React.Dispatch<React.SetStateAction<ImageState[]>>;
type ShowFn = ReturnType<typeof useToast>["show"];

function buildImageList(
  files: File[],
  maxSizeMB: number,
  show: ShowFn
): ImageState[] {
  const newImages: ImageState[] = [];
  for (const file of files) {
    const error = validateFile(file, maxSizeMB);
    if (error) {
      show({ type: "error", message: `${file.name}: ${error}` });
      continue;
    }
    newImages.push({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
    });
  }
  return newImages;
}

async function uploadNewImages(
  newImages: ImageState[],
  currentCount: number,
  setImages: SetImages,
  show: ShowFn
): Promise<void> {
  for (let i = 0; i < newImages.length; i++) {
    const imageIndex = currentCount + i;
    setImages((prev) =>
      prev.map((img, idx) =>
        idx === imageIndex ? { ...img, uploading: true } : img
      )
    );
    try {
      const url = await uploadToCloudinary(newImages[i].file!);
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === imageIndex ? { url, uploaded: true, uploading: false } : img
        )
      );
      show({
        type: "success",
        message: `Imagen ${i + 1}/${newImages.length} subida`,
      });
    } catch (err) {
      logger.error("Error uploading image:", { error: err });
      const errorMsg = err instanceof Error ? err.message : "Error al subir";
      setImages((prev) =>
        prev.map((img, idx) =>
          idx === imageIndex
            ? { ...img, uploading: false, error: errorMsg }
            : img
        )
      );
      show({
        type: "error",
        message: `Error al subir ${newImages[i].file!.name}`,
      });
    }
  }
}

async function processFiles(
  files: File[],
  images: ImageState[],
  maxImages: number,
  maxSizeMB: number,
  setImages: SetImages,
  show: ShowFn
): Promise<void> {
  const currentCount = images.length;
  const remainingSlots = maxImages - currentCount;

  if (remainingSlots <= 0) {
    show({ type: "error", message: `Máximo ${maxImages} imágenes permitidas` });
    return;
  }

  const newImages = buildImageList(
    files.slice(0, remainingSlots),
    maxSizeMB,
    show
  );
  if (newImages.length === 0) return;
  setImages((prev) => [...prev, ...newImages]);
  await uploadNewImages(newImages, currentCount, setImages, show);
}

async function retryImageUpload(
  index: number,
  image: ImageState,
  images: ImageState[],
  onImagesChange: (urls: string[]) => void,
  setImages: SetImages,
  show: ShowFn
): Promise<void> {
  if (!image.file) return;
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
    show({ type: "success", message: "Imagen subida correctamente" });
  } catch (err) {
    logger.error("Error retrying upload:", { error: err });
    const errorMsg = err instanceof Error ? err.message : "Error al subir";
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, uploading: false, error: errorMsg } : img
      )
    );
    show({ type: "error", message: "Error al reintentar subida" });
  }
}

// ============================================================================
// ImageThumbnail sub-component (reduces main component JSX complexity)
// ============================================================================
interface ImageThumbnailProps {
  image: ImageState;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
}

function ImageThumbnail({
  image,
  index,
  onRemove,
  onRetry,
}: ImageThumbnailProps) {
  return (
    <div
      key={`image-${index}-${image.url ?? image.preview}`}
      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-colors"
    >
      <div className="w-full h-full bg-surface relative">
        {(image.url ?? image.preview) && (
          <Image
            src={image.url ?? image.preview!}
            alt={`Producto ${index + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        )}
      </div>

      {image.uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Spinner size="lg" color="white" className="mx-auto mb-2" />
            <p className="text-xs">Subiendo...</p>
          </div>
        </div>
      )}

      {image.uploaded && !image.uploading && (
        <div className="absolute top-2 left-2 bg-success text-white p-1 rounded-full">
          <Check className="h-4 w-4" />
        </div>
      )}

      {image.error && (
        <div className="absolute inset-0 bg-error/90 flex items-center justify-center p-2">
          <div className="text-center text-white">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs mb-2">{image.error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="text-xs"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        disabled={image.uploading}
        className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-error/90"
        title="Eliminar imagen"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
        #{index + 1}
      </div>
    </div>
  );
}

export default function ImageUploadZone({
  existingImages,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
}: ImageUploadZoneProps) {
  const { show } = useToast();
  const [images, setImages] = useState<ImageState[]>(
    existingImages.map((url) => ({ url, uploaded: true }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const onImagesChangeRef = useRef(onImagesChange);

  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  useEffect(() => {
    const updatedUrls = images
      .map((img) => img.url)
      .filter(Boolean) as string[];
    onImagesChangeRef.current(updatedUrls);
  }, [images]);

  const addFiles = useCallback(
    (files: File[]) =>
      processFiles(files, images, maxImages, maxSizeMB, setImages, show),
    [images, maxImages, maxSizeMB, show]
  );

  const removeImage = (index: number) => {
    const image = images[index];
    if (image.preview) URL.revokeObjectURL(image.preview);
    const remaining = images.filter((_, i) => i !== index);
    setImages(remaining);
    onImagesChange(remaining.map((img) => img.url).filter(Boolean) as string[]);
    show({ type: "success", message: "Imagen eliminada" });
  };

  const retryUpload = (index: number) =>
    retryImageUpload(
      index,
      images[index],
      images,
      onImagesChange,
      setImages,
      show
    );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) void addFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) void addFiles(files);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <ImageThumbnail
              key={`image-${index}-${image.url ?? image.preview}`}
              image={image}
              index={index}
              onRemove={() => removeImage(index)}
              onRetry={() => void retryUpload(index)}
            />
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
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

      {!canAddMore && (
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
