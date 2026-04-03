"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useScrollToError } from "@/hooks/useScrollToError";

// ── Validation schemas ────────────────────────────────────────────────────────
const baseSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string()
    .email("El email no es válido")
    .max(254, "El email no puede exceder 254 caracteres"),
  isAdmin: z.boolean(),
  password: z
    .string()
    .max(128, "La contraseña no puede exceder 128 caracteres")
    .optional(),
  confirmPassword: z.string().optional(),
});

const createSchema = baseSchema
  .extend({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

const editSchema = baseSchema
  .refine(
    (data) =>
      !data.password ||
      !data.confirmPassword ||
      data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Las contraseñas no coinciden",
    }
  )
  .refine((data) => !data.password || data.password.length >= 8, {
    path: ["password"],
    message: "La contraseña debe tener al menos 8 caracteres",
  });

type UserFormData = {
  name: string;
  email: string;
  isAdmin: boolean;
  password?: string;
  confirmPassword?: string;
};

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const scrollToError = useScrollToError();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      isAdmin: true,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        isAdmin: true,
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, reset]);

  const handleFormSubmit = handleSubmit(onSubmit, scrollToError);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-content-primary mb-2"
          >
            Nombre completo *
          </label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ej: Juan Pérez"
            error={errors.name?.message}
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-content-primary mb-2"
          >
            Email *
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Ej: juan@ejemplo.com"
            error={errors.email?.message}
            disabled={loading || isEdit}
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
            className="block text-sm font-medium text-content-primary mb-2"
          >
            Contraseña {!isEdit && "*"}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder={
                isEdit ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"
              }
              error={errors.password?.message}
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
              className="block text-sm font-medium text-content-primary mb-2"
            >
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Repite la contraseña"
                error={errors.confirmPassword?.message}
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
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : user ? "Actualizar" : "Crear"} Usuario
        </Button>
      </div>
    </form>
  );
};
