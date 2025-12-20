"use client";

import { AdminPageHeader } from "@/components/admin";
import { FormSkeleton } from "@/components/admin/skeletons";
import { CategoryForm } from "@/components/forms";
import { logger } from "@/lib/logger";
import { SerializedCategory } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryEditPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<SerializedCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) {
          throw new Error("Error al cargar la categoría");
        }
        const data = await response.json();
        setCategory(data.data);
      } catch (error) {
        logger.error("Error:", { error });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string | null;
    icon?: string | null;
    showImage?: boolean;
    showIcon?: boolean;
  }) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
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
        throw new Error("Error al actualizar la categoría");
      }

      router.push("/admin/categorias");
    } catch (error) {
      logger.error("Error:", { error });
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/categorias");
  };

  if (loading) {
    return <FormSkeleton fields={6} />;
  }

  if (!category) {
    return <div>Categoría no encontrada</div>;
  }

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
          category={category}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
