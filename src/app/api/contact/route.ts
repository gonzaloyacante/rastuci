import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { apiHandler, AppError } from "@/lib/api-handler";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import {
  type ContactSettings,
  ContactSettingsSchema,
  defaultContactSettings,
} from "@/lib/validation/contact";

type ContactSettingsRow = {
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
};

// Helper to convert DB model to API format
function dbToApiFormat(settings: ContactSettingsRow | null): ContactSettings {
  if (!settings) return defaultContactSettings;
  return {
    headerTitle: settings.headerTitle,
    headerSubtitle: settings.headerSubtitle,
    emails: settings.emails,
    phones: settings.phones,
    address: mapAddress(settings),
    hours: mapHours(settings),
    form: mapForm(settings),
    faqs: [],
    social: mapSocial(settings),
  };
}

/** null/undefined → empty string without CCN-counting operators */
function ns(v: string | null | undefined): string {
  return v !== null && v !== undefined ? v : "";
}

function mapAddress(s: ContactSettingsRow) {
  return {
    lines: [ns(s.addressLine1), ns(s.addressLine2)],
    cityCountry: ns(s.addressCityCountry),
  };
}

function mapHours(s: ContactSettingsRow) {
  return {
    title: s.hoursTitle,
    weekdays: s.hoursWeekdays,
    saturday: s.hoursSaturday,
    sunday: s.hoursSunday,
  };
}

function mapForm(s: ContactSettingsRow) {
  return {
    title: s.formTitle,
    nameLabel: s.formNameLabel,
    emailLabel: s.formEmailLabel,
    phoneLabel: s.formPhoneLabel,
    messageLabel: s.formMessageLabel,
    submitLabel: s.formSubmitLabel,
    successTitle: s.formSuccessTitle,
    successMessage: s.formSuccessMessage,
    sendAnotherLabel: s.formSendAnother,
  };
}

function mapSocial(s: ContactSettingsRow) {
  return {
    instagram: { url: ns(s.instagramUrl), username: ns(s.instagramUsername) },
    facebook: { url: ns(s.facebookUrl), username: ns(s.facebookUsername) },
    whatsapp: { url: ns(s.whatsappUrl), username: ns(s.whatsappUsername) },
    tiktok: { url: ns(s.tiktokUrl), username: ns(s.tiktokUsername) },
    youtube: { url: ns(s.youtubeUrl), username: ns(s.youtubeUsername) },
  };
}

type SocialNetwork = keyof NonNullable<ContactSettings["social"]>;

function contactDbSocialFields(social: ContactSettings["social"]) {
  const networks: SocialNetwork[] = [
    "instagram",
    "facebook",
    "whatsapp",
    "tiktok",
    "youtube",
  ];
  const entries: Record<string, string | null> = {};
  for (const net of networks) {
    entries[`${net}Url`] =
      social?.[net]?.url !== undefined ? (social[net]!.url ?? null) : null;
    entries[`${net}Username`] =
      social?.[net]?.username !== undefined
        ? (social[net]!.username ?? null)
        : null;
  }
  return entries as {
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
  };
}

function contactDataToDbFields(data: ContactSettings) {
  return {
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
    formSuccessMessage: data.form?.successMessage ?? "Te responderemos pronto",
    formSendAnother: data.form?.sendAnotherLabel ?? "Enviar otro mensaje",
    ...contactDbSocialFields(data.social),
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

    const fields = contactDataToDbFields(data);
    await prisma.contact_settings.upsert({
      where: { id: "default" },
      update: { ...fields, updatedAt: new Date() },
      create: { id: "default", ...fields },
    });

    // Revalidate paths
    revalidatePath("/contacto");
    revalidatePath("/", "layout"); // Update footer if contact info changes

    return data;
  }, "PUT /api/contact");
});
