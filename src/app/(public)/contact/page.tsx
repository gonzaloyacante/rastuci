import { Metadata } from "next";
import { Suspense } from "react";

import { ContactPageSkeleton } from "@/components/public/skeletons";
import { prisma } from "@/lib/prisma";
import { defaultContactSettings } from "@/lib/validation/contact";

import ContactPageClient from "./client-page";

export const revalidate = 5; // Cache for 5 seconds (dev)

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
    const settings = await prisma.contact_settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return defaultContactSettings;
    }

    return {
      headerTitle: settings.headerTitle,
      headerSubtitle: settings.headerSubtitle,
      emails: settings.emails,
      phones: settings.phones,
      address: {
        lines: [settings.addressLine1 ?? "", settings.addressLine2 ?? ""],
        cityCountry: settings.addressCityCountry ?? "",
      },
      hours: {
        title: settings.hoursTitle,
        weekdays: settings.hoursWeekdays,
        saturday: settings.hoursSaturday,
        sunday: settings.hoursSunday,
      },
      form: {
        title: settings.formTitle,
        nameLabel: settings.formNameLabel,
        emailLabel: settings.formEmailLabel,
        phoneLabel: settings.formPhoneLabel,
        messageLabel: settings.formMessageLabel,
        submitLabel: settings.formSubmitLabel,
        successTitle: settings.formSuccessTitle,
        successMessage: settings.formSuccessMessage,
        sendAnotherLabel: settings.formSendAnother,
      },
      faqs: [], // FAQs come from faq_items table
      social: {
        instagram: {
          url: settings.instagramUrl ?? "",
          username: settings.instagramUsername ?? "",
        },
        facebook: {
          url: settings.facebookUrl ?? "",
          username: settings.facebookUsername ?? "",
        },
        whatsapp: {
          url: settings.whatsappUrl ?? "",
          username: settings.whatsappUsername ?? "",
        },
        tiktok: {
          url: settings.tiktokUrl ?? "",
          username: settings.tiktokUsername ?? "",
        },
        youtube: {
          url: settings.youtubeUrl ?? "",
          username: settings.youtubeUsername ?? "",
        },
      },
    };
  } catch (_error) {
    return defaultContactSettings;
  }
}

export default async function ContactPage() {
  const contactSettings = await getContactSettings();

  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageClient contact={contactSettings} />
    </Suspense>
  );
}
