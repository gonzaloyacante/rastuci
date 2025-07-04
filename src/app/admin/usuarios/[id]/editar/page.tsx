import prisma from "@/lib/prisma";
import UserEditForm from "../../components/UserEditForm";
import { notFound } from "next/navigation";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return notFound();
  }

  return <UserEditForm initialData={user} />;
}
