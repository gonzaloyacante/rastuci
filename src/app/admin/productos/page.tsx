"use client";

import { useDocumentTitle } from "@/hooks";
import ProductList from "../../../components/products/ProductList";

export default function AdminProductsPage() {
  useDocumentTitle({ title: "Productos" });
  return <ProductList />;
}
