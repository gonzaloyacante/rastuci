"use client";

import { UserForm } from "@/components/forms";
import { AdminPageHeader } from "@/components/admin";

export default function CreateUserPage() {
  const handleSubmit = async (data: {
    name: string;
    email: string;
    role: string;
    password?: string;
  }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Redirigir a la lista de usuarios
        window.location.href = "/admin/usuarios";
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error al crear usuario:", error);
      // El error será manejado por el sistema de notificaciones
    }
  };

  const handleCancel = () => {
    window.location.href = "/admin/usuarios";
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
        />
      </div>
    </div>
  );
}
