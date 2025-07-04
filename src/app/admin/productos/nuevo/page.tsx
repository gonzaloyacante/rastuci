import prisma from "@/lib/prisma";
import ProductForm from "../components/ProductForm";

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} />;
}
