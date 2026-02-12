"use client";

import { useToast } from "@/components/ui/Toast";
import { AdminPageHeader } from "@/components/admin";
import { CategoryForm } from "@/components/forms";
import { logger } from "@/lib/logger";

export default function CreateCategoryPage() {
  const { show } = useToast();
  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string | null;
    icon?: string | null;
    showImage?: boolean;
    showIcon?: boolean;
  }) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          imageUrl: data.showImage ? data.imageUrl : null,
          icon: data.showIcon ? data.icon : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la categoría");
      }

      window.location.href = "/admin/categorias";
      show({ type: "success", message: "Categoría creada exitosamente" });
    } catch (error) {
      logger.error("Error:", { error: error });
      show({ type: "error", message: "Error al crear categoría" });
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
