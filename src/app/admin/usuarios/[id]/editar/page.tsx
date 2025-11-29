import { AdminPageHeader } from "@/components/admin";
import { FormSkeleton } from "@/components/admin/skeletons";
import { UserForm } from "@/components/forms";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { logger } from "../../../../../lib/logger";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditUserContent({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return notFound();
  }

  const handleSubmit = async (data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      window.location.href = "/admin/usuarios";
    } catch (error) {
      logger.error("Error updating user:", { error });
      throw error;
    }
  };

  const handleCancel = () => {
    window.location.href = "/admin/usuarios";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Usuario"
        subtitle={`Modificar ${user.name}`}
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <UserForm user={user} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FormSkeleton fields={5} />}>
      <EditUserContent userId={id} />
    </Suspense>
  );
}
