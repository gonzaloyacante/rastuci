"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Product, Category } from "@/hooks";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
}

interface ProductFormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  categoryId?: string;
  images?: string;
}

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    images: [],
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        categoryId: product.categoryId || "",
        images: product.images || [],
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    if (formData.stock < 0) {
      newErrors.stock = "El stock no puede ser negativo";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Debe seleccionar una categoría";
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

  const handleChange = (
    field: keyof ProductFormData,
    value: string | number
  ) => {
    setFormData((prev: ProductFormData) => ({ ...prev, [field]: value }));

    // Limpiar error específico cuando el usuario corrige el campo
    if (errors[field as keyof ProductFormErrors]) {
      setErrors((prev: ProductFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-content-primary mb-2">
              Nombre del producto *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Camiseta estampada"
              error={errors.name}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-content-primary mb-2">
              Precio *
            </label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleChange("price", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
              step="0.01"
              error={errors.price}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-content-primary mb-2">
              Stock
            </label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                handleChange("stock", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
              error={errors.stock}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-content-primary mb-2">
              Categoría *
            </label>
            <Select
              id="categoryId"
              value={formData.categoryId}
              onChange={(value) => handleChange("categoryId", value)}
              options={[
                { value: "", label: "Seleccionar categoría" },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
              error={!!errors.categoryId}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-4">
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
              placeholder="Describe el producto..."
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

          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Imágenes
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <svg
                className="mx-auto h-12 w-12 text-content-tertiary"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-content-secondary">
                Arrastra imágenes aquí o{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80">
                  selecciona archivos
                </button>
              </p>
              <p className="text-xs text-content-tertiary">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </div>
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
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear"} Producto
        </Button>
      </div>
    </form>
  );
};
