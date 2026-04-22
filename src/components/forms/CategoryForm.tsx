"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { useScrollToError } from "@/hooks/useScrollToError";
import { SerializedCategory } from "@/types";

// ── Validation schema ─────────────────────────────────────────────────────────
const categorySchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  imageUrl: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  showImage: z.boolean(),
  showIcon: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: SerializedCategory | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const scrollToError = useScrollToError();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      imageUrl: null,
      icon: null,
      showImage: true,
      showIcon: false,
    },
  });

  const showImage = watch("showImage");
  const showIcon = watch("showIcon");
  const imageUrl = watch("imageUrl");
  const icon = watch("icon");

  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
        imageUrl: category.image ?? null,
        icon: null,
        showImage: !!category.image,
        showIcon: false,
      });
    }
  }, [category, reset]);

  const handleFormSubmit = handleSubmit(onSubmit, scrollToError);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-base-primary mb-2"
          >
            Nombre de la categoría *
          </label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ej: Camisetas"
            error={errors.name?.message}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-base-primary mb-2"
          >
            Descripción
          </label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Describe la categoría..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none ${
              errors.description
                ? "border-error"
                : "border-border focus:border-primary"
            }`}
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Switches para mostrar imagen/icono */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium text-base-primary">
                Mostrar imagen
              </label>
              <p className="text-xs text-muted">Mostrar imagen de fondo</p>
            </div>
            <button
              type="button"
              onClick={() => setValue("showImage", !showImage)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showImage ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showImage ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium text-base-primary">
                Mostrar ícono
              </label>
              <p className="text-xs text-muted">Mostrar ícono personalizado</p>
            </div>
            <button
              type="button"
              onClick={() => setValue("showIcon", !showIcon)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showIcon ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showIcon ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Imagen de categoría */}
        {showImage && (
          <ImageUploader
            value={imageUrl ?? null}
            onChange={(url) => setValue("imageUrl", url)}
            label="Imagen de la categoría"
            helpText="Imagen de fondo que se mostrará en la tarjeta de categoría (recomendado: 800x600px)"
            disabled={loading}
          />
        )}

        {/* Ícono de categoría */}
        {showIcon && (
          <ImageUploader
            value={icon ?? null}
            onChange={(url) => setValue("icon", url)}
            label="Ícono de la categoría"
            helpText="Ícono que se mostrará sobre la imagen (recomendado: 256x256px, formato PNG con transparencia)"
            disabled={loading}
          />
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : category ? "Actualizar" : "Crear"}{" "}
          Categoría
        </Button>
      </div>
    </form>
  );
};
