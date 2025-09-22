"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// import { Product } from "@/types"; // TODO: Implement when needed
import { ProductForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import { useProduct, useCategories } from "@/hooks";

function EditProductPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");
  const { product, isLoading, error } = useProduct(productId || "");
  const { categories } = useCategories();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  }) => {
    if (!productId) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/productos");
      } else {
        throw new Error("Error al actualizar el producto");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/productos");
  };

  if (isLoading) return <AdminLoading />;
  if (error) return <AdminError message={error || "Error desconocido"} />;
  if (!product) return <AdminError message="Producto no encontrado" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Producto"
        subtitle={`Modifica los datos del producto: ${product.name}`}
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
          product={product}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditProductPageContent />
    </Suspense>
  );
}
