"use client";

import { Suspense } from "react";

import { FormSkeleton } from "@/components/admin/skeletons";
import ProductForm from "@/components/products/forms/ProductForm";
import { useCategories } from "@/hooks";

function CreateProductContent() {
  const { categories } = useCategories();

  return (
    <div className="min-h-screen">
      <ProductForm categories={categories} />
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={10} />}>
      <CreateProductContent />
    </Suspense>
  );
}
