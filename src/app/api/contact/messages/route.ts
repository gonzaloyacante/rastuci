import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { emailService } from "@/lib/resend";

// Schema de validación para mensajes de contacto
const PHONE_REGEX = /^[+\d][\d\s\-().]{5,19}$/;

const ContactMessageSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z
      .string()
      .regex(PHONE_REGEX, "Ingresa un número de teléfono válido")
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .min(10, "El mensaje debe tener al menos 10 caracteres")
      .max(2000),
    responsePreference: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).default("EMAIL"),
  })
  .superRefine((data, ctx) => {
    if (data.responsePreference === "EMAIL" && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El email es obligatorio para esta preferencia de contacto",
        path: ["email"],
      });
    }
    if (
      (data.responsePreference === "PHONE" ||
        data.responsePreference === "WHATSAPP") &&
      !data.phone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El teléfono es obligatorio para esta preferencia de contacto",
        path: ["phone"],
      });
    }
  });

function mapContactError(err: unknown, endpoint: string) {
  const e = normalizeApiError(err);
  logger.error(`${endpoint} failed`, e);
  const code: ApiErrorCode =
    e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
  return NextResponse.json(fail(code, e.message, e.status ?? 500));
}

async function saveContactMessage(data: z.infer<typeof ContactMessageSchema>) {
  const { name, email, phone, message, responsePreference } = data;
  const email_val = email || null;
  const phone_val = phone || null;
  const contactMessage = await prisma.contact_messages.create({
    data: {
      name,
      email: email_val,
      phone: phone_val,
      message,
      responsePreference,
    },
  });
  logger.info("New contact message saved", {
    id: contactMessage.id,
    email: email_val,
    responsePreference,
  });
  emailService
    .sendContactNotification({
      name,
      email: email_val ?? undefined,
      phone: phone_val ?? undefined,
      message,
      responsePreference,
    })
    .catch((emailErr) =>
      logger.warn("Failed to send contact notification email", { emailErr })
    );
  return contactMessage;
}

// POST - Crear nuevo mensaje de contacto
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const rl = await checkRateLimit(req, {
      key: `contact:message:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        fail(
          "RATE_LIMITED",
          "Demasiadas solicitudes. Intenta de nuevo en un minuto.",
          429,
          { retryAfterMs: rl.retryAfterMs }
        )
      );
    }
    const body = await req.json();
    const parsed = ContactMessageSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json(fail("BAD_REQUEST", msg, 400));
    }
    const contactMessage = await saveContactMessage(parsed.data);
    return NextResponse.json(
      ok({ id: contactMessage.id, message: "Mensaje enviado exitosamente" }),
      { status: 201 }
    );
  } catch (err) {
    return mapContactError(err, "POST /api/contact/messages");
  }
}

// GET - Listar mensajes de contacto (ADMIN ONLY)
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const rl = await checkRateLimit(req, {
      key: "contact:messages:get",
      limit: 30,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        fail("RATE_LIMITED", "Too many requests", 429, {
          retryAfterMs: rl.retryAfterMs,
        })
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const isRead = searchParams.get("isRead");
    const isArchived = searchParams.get("isArchived") === "true";

    const where = {
      isArchived,
      ...(isRead !== null &&
        isRead !== undefined && { isRead: isRead === "true" }),
    };

    const [messages, total] = await Promise.all([
      prisma.contact_messages.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact_messages.count({ where }),
    ]);

    return NextResponse.json(
      ok({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (err) {
    return mapContactError(err, "GET /api/contact/messages");
  }
});
