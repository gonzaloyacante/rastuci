"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductForm from "../components/ProductForm";
import { AdminLoading, AdminError } from "@/components/admin";
import { useProduct, useCategories } from "@/hooks";

function EditProductPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const { product, isLoading, error } = useProduct(productId || "");
  const { categories } = useCategories();

  if (isLoading) return <AdminLoading />;
  if (error) return <AdminError message={error || "Error desconocido"} />;
  if (!product) return <AdminError message="Producto no encontrado" />;

  return (
    <div className="min-h-screen">
      <ProductForm
        initialData={product}
        categories={categories}
      />
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
