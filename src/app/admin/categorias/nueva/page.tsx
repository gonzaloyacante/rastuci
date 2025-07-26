"use client";

import { CategoryForm } from "@/components/forms";
import { AdminPageHeader } from "@/components/admin";

export default function CreateCategoryPage() {
  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear la categoría");
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
        title="Crear Categoría"
        subtitle="Agrega una nueva categoría de productos"
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
