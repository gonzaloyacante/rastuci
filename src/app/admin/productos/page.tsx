"use client";

import ProductList from "@/components/products/ProductList";
import { useDocumentTitle } from "@/hooks";

export default function AdminProductsPage() {
  useDocumentTitle({ title: "Productos" });
  return <ProductList />;
}
