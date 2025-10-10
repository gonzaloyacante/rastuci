"use client";

import { Suspense } from "react";
import ProductForm from "../components/ProductForm";
import { AdminLoading } from "@/components/admin";
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
    <Suspense fallback={<AdminLoading />}>
      <CreateProductContent />
    </Suspense>
  );
}
