"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Eye, EyeOff } from "lucide-react";

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
  confirmPassword?: string;
}

interface UserFormErrors {
  name?: string;
  email?: string;
  isAdmin?: string;
  password?: string;
  confirmPassword?: string;
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
    isAdmin: true, // Todos los usuarios del panel admin son administradores
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<UserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        isAdmin: true, // Todos son administradores
        password: "",
        confirmPassword: "",
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

    if (!isEdit && !formData.password) {
      newErrors.password = "La contraseña es requerida para crear un usuario";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!isEdit && formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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
            htmlFor="password"
            className="block text-sm font-medium text-content-primary mb-2">
            Contraseña {!isEdit && "*"}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={
                isEdit ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"
              }
              error={errors.password}
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {isEdit && (
            <p className="mt-1 text-xs text-content-secondary">
              Deja vacío para mantener la contraseña actual
            </p>
          )}
        </div>

        {!isEdit && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-content-primary mb-2">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword || ""}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Repite la contraseña"
                error={errors.confirmPassword}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
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
