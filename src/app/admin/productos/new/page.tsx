import ProductForm from "../components/ProductForm";
import { prisma } from "@/lib/prisma";
import { Heading } from "@/components/ui/Heading";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <>
      <Heading>Nuevo Producto</Heading>
      <ProductForm categories={categories} initialData={null} />
    </>
  );
}
