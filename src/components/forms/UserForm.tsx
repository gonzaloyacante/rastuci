"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

interface UserFormData {
  name: string;
  email: string;
  isAdmin: boolean;
  password?: string;
}

interface UserFormErrors {
  name?: string;
  email?: string;
  isAdmin?: string;
  password?: string;
}

interface UserFormProps {
  user?: AdminUser | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    isAdmin: false,
    password: "",
  });

  const [errors, setErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        isAdmin: user.isAdmin || false,
        password: "",
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.isAdmin && formData.isAdmin !== false) {
      newErrors.isAdmin = "Debe seleccionar un rol";
    }

    if (!isEdit && !formData.password) {
      newErrors.password = "La contraseña es requerida para crear un usuario";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData((prev: UserFormData) => ({ ...prev, [field]: value }));

    // Limpiar error específico cuando el usuario corrige el campo
    if (errors[field]) {
      setErrors((prev: UserFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const roleOptions = [
    { value: "false", label: "Usuario" },
    { value: "true", label: "Administrador" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-content-primary mb-2">
            Nombre completo *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Juan Pérez"
            error={errors.name}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-content-primary mb-2">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Ej: juan@ejemplo.com"
            error={errors.email}
            disabled={loading || isEdit} // En edición, no permitir cambiar email
          />
          {isEdit && (
            <p className="mt-1 text-xs text-content-secondary">
              El email no se puede modificar en modo edición
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="isAdmin"
            className="block text-sm font-medium text-content-primary mb-2">
            Rol *
          </label>
          <Select
            id="isAdmin"
            value={formData.isAdmin.toString()}
            onChange={(value) => handleChange("isAdmin", value === "true")}
            options={roleOptions}
            error={!!errors.isAdmin}
            disabled={loading}
          />
          {errors.isAdmin && (
            <p className="mt-1 text-sm text-error">{errors.isAdmin}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-content-primary mb-2">
            Contraseña {!isEdit && "*"}
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder={
              isEdit ? "Dejar vacío para no cambiar" : "Ingresa una contraseña"
            }
            error={errors.password}
            disabled={loading}
          />
          {isEdit && (
            <p className="mt-1 text-xs text-content-secondary">
              Deja vacío para mantener la contraseña actual
            </p>
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
          {loading ? "Guardando..." : user ? "Actualizar" : "Crear"} Usuario
        </Button>
      </div>
    </form>
  );
};
