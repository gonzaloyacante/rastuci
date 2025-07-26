"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditUserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("id");

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID de usuario no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error("Error al cargar el usuario");
        }

        const result = await response.json();

        if (result.success) {
          setUser(result.data);
        } else {
          throw new Error(result.error || "Error al cargar el usuario");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      const result = await response.json();

      if (result.success) {
        router.push("/admin/usuarios");
      } else {
        alert(result.error || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el usuario");
    }
  };

  const handleCancel = () => {
    router.push("/admin/usuarios");
  };

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;
  if (!user) return <AdminError message="Usuario no encontrado" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Usuario"
        subtitle={`Modifica los datos del usuario: ${user.name}`}
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      </div>
    </div>
  );
}
