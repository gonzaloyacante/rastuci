import { FormSkeleton } from "@/components/admin/skeletons";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditUserClient } from "./client-page";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditUserContent({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    },
  });

  if (!user) {
    return notFound();
  }

  // Serializar datos para el Client Component
  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return <EditUserClient user={serializedUser} />;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FormSkeleton fields={5} />}>
      <EditUserContent userId={id} />
    </Suspense>
  );
}
