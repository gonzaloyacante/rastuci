import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
      return NextResponse.json(
        fail(
          "BAD_REQUEST",
          parsed.error.errors[0]?.message || "Datos inválidos",
          400
        )
      );
    }

    const { name, email, phone, message, responsePreference } = parsed.data;

    // TODO: Crear modelo contact_messages en Prisma schema
    // const contactMessage = await prisma.contactMessage.create({
    //   data: {
    //     name,
    //     email,
    //     phone,
    //     message,
    //     responsePreference,
    //   },
    // });

    logger.info("New contact message received", {
      name,
      email,
      responsePreference,
    });

    return NextResponse.json(
      ok({
        id: `temp-${Date.now()}`,
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

// GET - Listar mensajes de contacto (solo admin)
export async function GET(req: NextRequest) {
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

    // TODO: Implementar cuando exista el modelo contact_messages
    // const [messages, total] = await Promise.all([
    //   prisma.contactMessage.findMany({
    //     where,
    //     orderBy: { createdAt: "desc" },
    //     skip: (page - 1) * limit,
    //     take: limit,
    //   }),
    //   prisma.contactMessage.count({ where }),
    // ]);

    return NextResponse.json(
      ok({
        messages: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
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
}
