"use client";

import { logger } from "@/lib/logger";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { Button } from "./Button";
import { toast } from "react-hot-toast";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  className?: string; // Container class
}

export function ImageUploader({
  value,
  onChange,
  label = "Imagen",
  disabled = false,
  error,
  helpText,
  aspectRatio = "square",
  className,
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
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      setUploadError("Por favor selecciona una imagen válida");
      return;
    }

    // Validate size (max 5MB)
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

  // Determine aspect ratio classes
  const aspectClasses = {
    square: "aspect-square w-32",
    video: "aspect-video w-full max-w-sm",
    wide: "aspect-[21/9] w-full",
    auto: "w-full h-auto min-h-[120px]",
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
      </div>

      <div
        className={cn(
          "relative group border-2 border-dashed border-muted-foreground/25 rounded-xl overflow-hidden bg-muted/5 transition-colors hover:bg-muted/10",
          aspectClasses[aspectRatio],
          !value && "flex items-center justify-center p-4",
          error && "border-destructive/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {value ? (
          <>
            {!imageLoadError ? (
              // Simplified rendering logic to ensure DB images are displayed
              <Image
                src={value}
                alt="Preview"
                fill
                className={cn(
                  "transition-transform duration-500 group-hover:scale-105",
                  aspectRatio === "auto" ? "object-contain" : "object-cover"
                )}
                unoptimized={
                  value?.includes(".svg") || value?.includes("blob:")
                }
                onError={() => setImageLoadError(true)}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <ProductImagePlaceholder className="w-full h-full bg-muted text-muted-foreground flex items-center justify-center" />
            )}

            {/* Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <Button
                type="button"
                onClick={handleButtonClick}
                variant="secondary"
                size="sm"
                className="h-8"
              >
                <Upload className="w-4 h-4 mr-2" />
                Cambiar
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="h-8"
              >
                <X className="w-4 h-4 mr-2" />
                Quitar
              </Button>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </>
        ) : (
          <div
            className="text-center space-y-2 w-full"
            onClick={handleButtonClick}
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer group-hover:bg-background transition-colors border border-border">
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : (
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground cursor-pointer hover:underline underline-offset-4">
                {uploading ? "Subiendo..." : "Haz clic para subir"}
              </p>
              <p className="text-xs text-muted-foreground">
                {aspectRatio === "video"
                  ? "Formato 16:9 recomendado"
                  : aspectRatio === "wide"
                    ? "Formato panorámico recomendado"
                    : "PNG, JPG o WEBP hasta 5MB"}
              </p>
            </div>
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <p className="text-xs text-destructive font-medium">
          {error || uploadError}
        </p>
      )}
      {helpText && !error && !uploadError && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
