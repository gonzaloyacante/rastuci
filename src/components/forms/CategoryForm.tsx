"use client";

import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/Input";
import { SerializedCategory } from "@/types";
import React, { useEffect, useState } from "react";

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string | null;
  icon: string | null;
  showImage: boolean;
  showIcon: boolean;
}

interface CategoryFormErrors {
  [key: string]: string | undefined;
}

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
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    imageUrl: null,
    icon: null,
    showImage: true,
    showIcon: false,
  });

  const [errors, setErrors] = useState<CategoryFormErrors>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        imageUrl: category.image ?? null,
        icon: null,
        showImage: !!category.image,
        showIcon: false,
      });
    }
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: CategoryFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev: CategoryFormData) => ({ ...prev, [field]: value }));

    // Limpiar error específico cuando el usuario corrige el campo
    if (errors[field as string]) {
      setErrors((prev: CategoryFormErrors) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-content-primary mb-2"
          >
            Nombre de la categoría *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Camisetas"
            error={errors.name}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-content-primary mb-2"
          >
            Descripción *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
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
            <p className="mt-1 text-sm text-error">{errors.description}</p>
          )}
        </div>

        {/* Switches para mostrar imagen/icono */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium text-content-primary">
                Mostrar imagen
              </label>
              <p className="text-xs text-muted">Mostrar imagen de fondo</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, showImage: !prev.showImage }))
              }
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.showImage ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.showImage ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <label className="text-sm font-medium text-content-primary">
                Mostrar ícono
              </label>
              <p className="text-xs text-muted">Mostrar ícono personalizado</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, showIcon: !prev.showIcon }))
              }
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.showIcon ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.showIcon ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Imagen de categoría */}
        {formData.showImage && (
          <ImageUploader
            value={formData.imageUrl}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, imageUrl: url }))
            }
            label="Imagen de la categoría"
            helpText="Imagen de fondo que se mostrará en la tarjeta de categoría (recomendado: 800x600px)"
            disabled={loading}
          />
        )}

        {/* Ícono de categoría */}
        {formData.showIcon && (
          <ImageUploader
            value={formData.icon}
            onChange={(url) => setFormData((prev) => ({ ...prev, icon: url }))}
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
