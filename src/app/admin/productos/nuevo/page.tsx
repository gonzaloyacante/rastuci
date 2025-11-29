"use client";

import { FormSkeleton } from "@/components/admin/skeletons";
import { useCategories } from "@/hooks";
import { Suspense } from "react";
import ProductForm from "../../../../components/products/ProductForm";

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
