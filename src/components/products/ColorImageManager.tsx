"use client";

import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

interface ColorImageManagerProps {
  colors: string[];
  colorImages: Record<string, string[]>;
  onColorImagesChange: (images: Record<string, string[]>) => void;
}

/**
 * Manages image uploads for each product color.
 * Shows an expandable section for each color where admin can upload images.
 */
export default function ColorImageManager({
  colors,
  colorImages,
  onColorImagesChange,
}: ColorImageManagerProps) {
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const toggleColor = (color: string) => {
    setExpandedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  };

  const handleFileSelect = useCallback(
    async (color: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      setUploading((prev) => ({ ...prev, [color]: true }));

      const currentImages = colorImages[color] || [];
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          if (data.success && data.url) {
            newUrls.push(data.url);
          }
        } catch (error) {
          toast.error(`Error subiendo ${file.name}`);
        }
      }

      if (newUrls.length > 0) {
        onColorImagesChange({
          ...colorImages,
          [color]: [...currentImages, ...newUrls],
        });
        toast.success(`${newUrls.length} imagen(es) agregada(s) a ${color}`);
      }

      setUploading((prev) => ({ ...prev, [color]: false }));
    },
    [colorImages, onColorImagesChange]
  );

  const removeImage = useCallback(
    (color: string, imageUrl: string) => {
      const current = colorImages[color] || [];
      const updated = current.filter((url) => url !== imageUrl);
      onColorImagesChange({
        ...colorImages,
        [color]: updated,
      });
    },
    [colorImages, onColorImagesChange]
  );

  if (colors.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-4 border rounded-lg bg-muted/20">
        Agrega colores primero para asignar imágenes específicas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Asigna imágenes específicas a cada color. Al seleccionar un color en la
        tienda, se mostrarán estas imágenes.
      </p>

      {colors.map((color) => {
        const isExpanded = expandedColors.has(color);
        const images = colorImages[color] || [];
        const isUploading = uploading[color] || false;

        return (
          <div
            key={color}
            className="border rounded-lg overflow-hidden bg-surface"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleColor(color)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                <span className="font-medium">{color}</span>
                <span className="text-xs text-muted-foreground">
                  ({images.length} {images.length === 1 ? "imagen" : "imágenes"}
                  )
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Content */}
            {isExpanded && (
              <div className="p-3 border-t bg-muted/10 space-y-3">
                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((url, idx) => (
                      <div
                        key={`${color}-${idx}`}
                        className="relative group aspect-square rounded-md overflow-hidden border"
                      >
                        <Image
                          src={url}
                          alt={`${color} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(color, url)}
                          className="absolute top-1 right-1 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  {isUploading ? (
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Subiendo...
                    </span>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Agregar imágenes para {color}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => handleFileSelect(color, e.target.files)}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
