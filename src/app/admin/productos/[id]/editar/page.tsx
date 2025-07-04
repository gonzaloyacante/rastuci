import prisma from "@/lib/prisma";
import ProductForm from "../../components/ProductForm";
import { notFound } from "next/navigation";

interface ProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return <ProductForm initialData={product} categories={categories} />;
}
