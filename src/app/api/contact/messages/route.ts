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
const ContactMessageSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(2000),
  responsePreference: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).default("EMAIL"),
});

// POST - Crear nuevo mensaje de contacto
export async function POST(req: NextRequest) {
  try {
    // Rate limit más estricto para evitar spam
    const rl = await checkRateLimit(req, {
      key: "contact:message",
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
      const errorDetails = parsed.error.issues[0]?.message || "Datos inválidos";
      return NextResponse.json(fail("BAD_REQUEST", errorDetails, 400));
    }

    const { name, email, phone, message, responsePreference } = parsed.data;

    // Persist contact message to DB (#28 fix)
    const contactMessage = await prisma.contact_messages.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        message,
        responsePreference,
      },
    });

    logger.info("New contact message saved", {
      id: contactMessage.id,
      email,
      responsePreference,
    });

    // Notificar al admin por email (no bloquea la respuesta si falla)
    emailService
      .sendContactNotification({
        name,
        email,
        phone,
        message,
        responsePreference,
      })
      .catch((emailErr) =>
        logger.warn("Failed to send contact notification email", { emailErr })
      );

    return NextResponse.json(
      ok({
        id: contactMessage.id,
        message: "Mensaje enviado exitosamente",
      }),
      { status: 201 }
    );
  } catch (err) {
    const e = normalizeApiError(err);
    logger.error("POST /api/contact/messages failed", e);
    const code: ApiErrorCode =
      e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
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
    const e = normalizeApiError(err);
    logger.error("GET /api/contact/messages failed", e);
    const code: ApiErrorCode =
      e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
    return NextResponse.json(fail(code, e.message, e.status ?? 500));
  }
});
