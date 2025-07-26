"use client";

import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { UserForm } from "@/components/forms";
import { useUsers } from "@/hooks/useUsers";

export default function CreateUserPage() {
  const router = useRouter();
  const { loading } = useUsers();

  const handleSubmit = async (data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }) => {
    // Para crear usuarios, necesitamos password
    if (!data.password) {
      alert("La contraseña es requerida para crear un usuario");
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
        alert(result.error || "Error al crear el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el usuario");
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
    </div>
  );
}
