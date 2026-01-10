import { Metadata } from "next";
import { Suspense } from "react";
import ContactPageClient from "./client-page";
import { prisma } from "@/lib/prisma";
import {
  defaultContactSettings,
  ContactSettingsSchema,
} from "@/lib/validation/contact";

export const revalidate = 3600; // Cache for 1 hour

export const metadata: Metadata = {
  title: "Contacto - Rastuci",
  description:
    "Ponte en contacto con Rastuci. Encuentra nuestros horarios, ubicación y formas de comunicarte con nosotros.",
  keywords:
    "contacto, Rastuci, atención al cliente, horarios, ubicación, teléfono, email",
  openGraph: {
    title: "Contacto - Rastuci",
    description: "Ponte en contacto con Rastuci. Estamos aquí para ayudarte.",
    type: "website",
    url: "https://rastuci.com/contacto",
  },
  alternates: {
    canonical: "/contacto",
  },
};

async function getContactSettings() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: "contact" },
    });

    if (settings?.value) {
      const parsed = ContactSettingsSchema.safeParse(settings.value);
      if (parsed.success) {
        return parsed.data;
      }
    }
    return defaultContactSettings;
  } catch (_error) {
    return defaultContactSettings;
  }
}

const ContactPageSkeleton = () => (
  <div className="min-h-screen surface">
    <main className="max-w-[1200px] mx-auto py-8 px-6">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div className="h-12 surface-secondary rounded animate-pulse w-96 mx-auto mb-4" />
        <div className="h-6 surface-secondary rounded animate-pulse w-full max-w-2xl mx-auto" />
      </div>
      {/* ... Content Skeleton omitted for brevity ... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-96 surface-secondary rounded animate-pulse w-full" />
        <div className="h-96 surface-secondary rounded animate-pulse w-full" />
      </div>
    </main>
  </div>
);

export default async function ContactPage() {
  const contactSettings = await getContactSettings();

  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageClient contact={contactSettings} />
    </Suspense>
  );
}
