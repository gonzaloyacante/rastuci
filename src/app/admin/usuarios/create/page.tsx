"use client";

import { AdminPageHeader } from "@/components/admin";
import { UserForm } from "@/components/forms";
import { useAlert } from "@/components/ui/Alert";
import { useUsers } from "@/hooks/useUsers";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();
  const { loading } = useUsers();
  const { showAlert, Alert: AlertComponent } = useAlert();

  const handleSubmit = async (data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }) => {
    // Para crear usuarios, necesitamos password
    if (!data.password) {
      showAlert({
        title: "Campo requerido",
        message: "La contraseña es requerida para crear un usuario",
        variant: "warning",
      });
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el usuario");
      }

      const result = await response.json();

      if (result.success) {
        router.push("/admin/usuarios");
      } else {
        showAlert({
          title: "Error",
          message: result.error || "Error al crear el usuario",
          variant: "error",
        });
      }
    } catch (error) {
      logger.error("Error creating user", { error });
      showAlert({
        title: "Error",
        message: "Error al crear el usuario",
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    router.push("/admin/usuarios");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Crear Nuevo Usuario"
        subtitle="Añade un nuevo usuario al sistema"
      />

      <div className="card">
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
      {AlertComponent}
    </div>
  );
}
