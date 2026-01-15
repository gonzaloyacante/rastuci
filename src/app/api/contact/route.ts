import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimiter";
import {
  ContactSettingsSchema,
  defaultContactSettings,
  type ContactSettings,
} from "@/lib/validation/contact";
import { apiHandler, AppError } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

// Helper to convert DB model to API format
function dbToApiFormat(
  settings: {
    headerTitle: string;
    headerSubtitle: string;
    emails: string[];
    phones: string[];
    addressLine1: string | null;
    addressLine2: string | null;
    addressCityCountry: string | null;
    hoursTitle: string;
    hoursWeekdays: string;
    hoursSaturday: string;
    hoursSunday: string;
    formTitle: string;
    formNameLabel: string;
    formEmailLabel: string;
    formPhoneLabel: string;
    formMessageLabel: string;
    formSubmitLabel: string;
    formSuccessTitle: string;
    formSuccessMessage: string;
    formSendAnother: string;
    instagramUrl: string | null;
    instagramUsername: string | null;
    facebookUrl: string | null;
    facebookUsername: string | null;
    whatsappUrl: string | null;
    whatsappUsername: string | null;
    tiktokUrl: string | null;
    tiktokUsername: string | null;
    youtubeUrl: string | null;
    youtubeUsername: string | null;
  } | null
): ContactSettings {
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
    faqs: [], // FAQs come from faq_items table, not contact_settings
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
}

// Handler for GET
export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const rl = await checkRateLimit(req, {
      key: "contact:get",
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      throw new AppError("Too many requests", 429);
    }

    const settings = await prisma.contact_settings.findUnique({
      where: { id: "default" },
    });

    const data = dbToApiFormat(settings);

    const parsed = ContactSettingsSchema.safeParse(data);
    if (!parsed.success) {
      logger.warn("Invalid contact settings in DB, returning defaults", {
        issues: parsed.error.flatten(),
      });
      return defaultContactSettings;
    }

    return parsed.data;
  }, "GET /api/contact");
}

// Handler for PUT (ADMIN ONLY)
export const PUT = withAdminAuth(async (req: NextRequest) => {
  return apiHandler(async () => {
    const rl = await checkRateLimit(req, {
      key: "contact:put",
      limit: 20,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      throw new AppError("Too many requests", 429);
    }

    const body = await req.json();
    const parsed = ContactSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(parsed.error.message, 400);
    }

    const data = parsed.data;

    await prisma.contact_settings.upsert({
      where: { id: "default" },
      update: {
        headerTitle: data.headerTitle ?? "Contacto",
        headerSubtitle: data.headerSubtitle ?? "Estamos aquí para ayudarte",
        emails: data.emails ?? [],
        phones: data.phones ?? [],
        addressLine1: data.address?.lines?.[0] ?? null,
        addressLine2: data.address?.lines?.[1] ?? null,
        addressCityCountry: data.address?.cityCountry ?? null,
        hoursTitle: data.hours?.title ?? "Horarios de Atención",
        hoursWeekdays: data.hours?.weekdays ?? "Lunes a Viernes: 9:00 - 18:00",
        hoursSaturday: data.hours?.saturday ?? "Sábados: 9:00 - 14:00",
        hoursSunday: data.hours?.sunday ?? "Domingos: Cerrado",
        formTitle: data.form?.title ?? "Envíanos un mensaje",
        formNameLabel: data.form?.nameLabel ?? "Nombre",
        formEmailLabel: data.form?.emailLabel ?? "Email",
        formPhoneLabel: data.form?.phoneLabel ?? "Teléfono",
        formMessageLabel: data.form?.messageLabel ?? "Mensaje",
        formSubmitLabel: data.form?.submitLabel ?? "Enviar",
        formSuccessTitle: data.form?.successTitle ?? "¡Mensaje enviado!",
        formSuccessMessage:
          data.form?.successMessage ?? "Te responderemos pronto",
        formSendAnother: data.form?.sendAnotherLabel ?? "Enviar otro mensaje",
        instagramUrl: data.social?.instagram?.url ?? null,
        instagramUsername: data.social?.instagram?.username ?? null,
        facebookUrl: data.social?.facebook?.url ?? null,
        facebookUsername: data.social?.facebook?.username ?? null,
        whatsappUrl: data.social?.whatsapp?.url ?? null,
        whatsappUsername: data.social?.whatsapp?.username ?? null,
        tiktokUrl: data.social?.tiktok?.url ?? null,
        tiktokUsername: data.social?.tiktok?.username ?? null,
        youtubeUrl: data.social?.youtube?.url ?? null,
        youtubeUsername: data.social?.youtube?.username ?? null,
        updatedAt: new Date(),
      },
      create: {
        id: "default",
        headerTitle: data.headerTitle ?? "Contacto",
        headerSubtitle: data.headerSubtitle ?? "Estamos aquí para ayudarte",
        emails: data.emails ?? [],
        phones: data.phones ?? [],
        addressLine1: data.address?.lines?.[0] ?? null,
        addressLine2: data.address?.lines?.[1] ?? null,
        addressCityCountry: data.address?.cityCountry ?? null,
        hoursTitle: data.hours?.title ?? "Horarios de Atención",
        hoursWeekdays: data.hours?.weekdays ?? "Lunes a Viernes: 9:00 - 18:00",
        hoursSaturday: data.hours?.saturday ?? "Sábados: 9:00 - 14:00",
        hoursSunday: data.hours?.sunday ?? "Domingos: Cerrado",
        formTitle: data.form?.title ?? "Envíanos un mensaje",
        formNameLabel: data.form?.nameLabel ?? "Nombre",
        formEmailLabel: data.form?.emailLabel ?? "Email",
        formPhoneLabel: data.form?.phoneLabel ?? "Teléfono",
        formMessageLabel: data.form?.messageLabel ?? "Mensaje",
        formSubmitLabel: data.form?.submitLabel ?? "Enviar",
        formSuccessTitle: data.form?.successTitle ?? "¡Mensaje enviado!",
        formSuccessMessage:
          data.form?.successMessage ?? "Te responderemos pronto",
        formSendAnother: data.form?.sendAnotherLabel ?? "Enviar otro mensaje",
        instagramUrl: data.social?.instagram?.url ?? null,
        instagramUsername: data.social?.instagram?.username ?? null,
        facebookUrl: data.social?.facebook?.url ?? null,
        facebookUsername: data.social?.facebook?.username ?? null,
        whatsappUrl: data.social?.whatsapp?.url ?? null,
        whatsappUsername: data.social?.whatsapp?.username ?? null,
        tiktokUrl: data.social?.tiktok?.url ?? null,
        tiktokUsername: data.social?.tiktok?.username ?? null,
        youtubeUrl: data.social?.youtube?.url ?? null,
        youtubeUsername: data.social?.youtube?.username ?? null,
      },
    });

    return data;
  }, "PUT /api/contact");
});
