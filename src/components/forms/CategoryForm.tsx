"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SerializedCategory } from "@/types";

interface CategoryFormData {
  name: string;
  description: string;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
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
  });

  const [errors, setErrors] = useState<CategoryFormErrors>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
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
    if (errors[field]) {
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
            className="block text-sm font-medium text-content-primary mb-2">
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
            className="block text-sm font-medium text-content-primary mb-2">
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
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}>
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
