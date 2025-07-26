import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { CategoryForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading } from "@/components/admin";
import { notFound } from "next/navigation";

interface CategoryEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditCategoryContent({ categoryId }: { categoryId: string }) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return notFound();
  }

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la categoría");
      }

      window.location.href = "/admin/categorias";
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    window.location.href = "/admin/categorias";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Categoría"
        subtitle={`Modificar ${category.name}`}
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <CategoryForm
          category={{
            ...category,
            createdAt: category.createdAt.toISOString(),
            updatedAt: category.updatedAt.toISOString(),
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default async function CategoryEditPage({
  params,
}: CategoryEditPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<AdminLoading />}>
      <EditCategoryContent categoryId={id} />
    </Suspense>
  );
}
