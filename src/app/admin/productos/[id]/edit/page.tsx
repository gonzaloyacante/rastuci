import { prisma } from "@/lib/prisma";
import ProductForm from "../../components/ProductForm";
import { Heading } from "@/components/ui/Heading";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany();

  return (
    <>
      <Heading>Editar Producto</Heading>
      <ProductForm categories={categories} initialData={product} />
    </>
  );
}
