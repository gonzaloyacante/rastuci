"use client";

import { AdminError, AdminLoading } from "@/components/admin";
import { useCategories, useProduct } from "@/hooks";
import { useParams } from "next/navigation";
import ProductForm from "../../components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { product, isLoading, error } = useProduct(productId);
  const { categories } = useCategories();

  if (isLoading) {
    return <AdminLoading />;
  }
  if (error) {
    return <AdminError message={error || "Error desconocido"} />;
  }
  if (!product) {
    return <AdminError message="Producto no encontrado" />;
  }

  return (
    <div className="min-h-screen">
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}
