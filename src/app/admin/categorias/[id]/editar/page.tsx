import prisma from "@/lib/prisma";
import CategoryForm from "../../components/CategoryForm";
import { notFound } from "next/navigation";

interface CategoryEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CategoryEditPage({
  params,
}: CategoryEditPageProps) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return notFound();
  }

  return <CategoryForm initialData={category} />;
}
