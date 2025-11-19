"use client";

import { logger } from "@/lib/logger";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./Button";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
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
    } catch (err) {
      logger.error("Error uploading image:", { error: err });
      setUploadError(
        err instanceof Error ? err.message : "Error al subir la imagen"
      );
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
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              aria-label="Eliminar imagen"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
            {uploading ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
          </Button>

          {(error || uploadError) && (
            <p className="mt-1 text-sm text-error">{error || uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
