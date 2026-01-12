"use client";

import { logger } from "@/lib/logger";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { Button } from "./Button";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Imagen",
  disabled = false,
  error,
  helpText,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset error state when value changes (new image uploaded)
  useEffect(() => {
    setImageLoadError(false);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      setUploadError("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no puede superar los 5MB");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setImageLoadError(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      onChange(data.url);
      toast.success("Imagen subida correctamente");
    } catch (err) {
      logger.error("Error uploading image:", { error: err });
      const errorMessage =
        err instanceof Error ? err.message : "Error al subir la imagen";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-content-primary">
          {label}
        </label>
      )}

      {helpText && <p className="text-xs text-muted">{helpText}</p>}

      <div className="flex items-start gap-4">
        {value && (
          <div className="relative group w-32 h-32">
            {!imageLoadError ? (
              // Use native img for SVG/Blob to ensure it displays correctly without optimization issues
              value?.includes(".svg") || value?.includes("blob:") ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg border border-border"
                  onError={(e) => {
                    console.error("ImageUploader <img/> Error:", e);
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg border border-border"
                  onError={() => setImageLoadError(true)}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )
            ) : (
              <ProductImagePlaceholder className="w-full h-full rounded-lg border border-border" />
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              aria-label="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
          >
            {uploading
              ? "Subiendo..."
              : value
                ? "Cambiar imagen"
                : "Subir imagen"}
          </Button>

          {(error || uploadError) && (
            <p className="mt-1 text-sm text-error">{error || uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
