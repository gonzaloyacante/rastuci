"use client";

import { useToast } from "@/components/ui/Toast";
import { AdminPageHeader } from "@/components/admin";
import { UserForm } from "@/components/forms";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

interface EditUserClientProps {
  user: User;
}

export function EditUserClient({ user }: EditUserClientProps) {
  const { show } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: {
      name: string;
      email: string;
      isAdmin: boolean;
      password?: string;
    }) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Error al actualizar el usuario");
        }

        show({ type: "success", message: "Usuario actualizado correctamente" });
        router.push("/admin/usuarios");
        router.refresh();
      } catch (error) {
        logger.error("Error updating user:", { error });
        show({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Error al actualizar el usuario",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user.id, router]
  );

  const handleCancel = useCallback(() => {
    router.push("/admin/usuarios");
  }, [router]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Usuario"
        subtitle={`Modificar ${user.name || "usuario"}`}
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
          loading={loading}
          isEdit
        />
      </div>
    </div>
  );
}
