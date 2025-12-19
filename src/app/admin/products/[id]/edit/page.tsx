"use client";

import { AdminError } from "@/components/admin";
import { FormSkeleton } from "@/components/admin/skeletons";
import ProductForm from "@/components/products/ProductForm";
import { useCategories, useProduct } from "@/hooks";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { product, isLoading, error } = useProduct(productId);
  const { categories } = useCategories();

  if (isLoading) {
    return <FormSkeleton fields={10} />;
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
