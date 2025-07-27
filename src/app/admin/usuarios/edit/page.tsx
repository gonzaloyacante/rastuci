"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import { useUsers, User } from "@/hooks/useUsers";

function EditUserPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");
  const { getUserById, updateUser } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("ID de usuario no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, getUserById]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }) => {
    if (!userId) return;

    const success = await updateUser(userId, data);
    if (success) {
      router.push("/admin/usuarios");
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
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.role === "ADMIN",
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function EditUserPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditUserPageContent />
    </Suspense>
  );
}
