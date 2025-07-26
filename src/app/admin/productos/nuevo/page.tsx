import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading } from "@/components/admin";

async function CreateProductContent() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const handleSubmit = async (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  }) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      window.location.href = "/admin/productos";
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    window.location.href = "/admin/productos";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Crear Producto"
        subtitle="Agrega un nuevo producto al catálogo"
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <CreateProductContent />
    </Suspense>
  );
}
