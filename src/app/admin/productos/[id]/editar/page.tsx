"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
// import { Product } from "@/types"; // TODO: Implement when needed
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import { useProduct, useCategories } from "@/hooks";
import { ProductForm } from "@/components/forms";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { product, isLoading, error } = useProduct(productId);
  const { categories } = useCategories();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  }) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }

      router.push("/admin/productos");
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
