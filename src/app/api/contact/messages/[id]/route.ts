import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

const PatchSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
    try {
      const { id } = await params;
      const body = await req.json();
      const parsed = PatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(fail("BAD_REQUEST", "Datos inválidos", 400));
      }

      const existing = await prisma.contact_messages.findUnique({
        where: { id },
      });
      if (!existing) {
        return NextResponse.json(
          fail("NOT_FOUND", "Mensaje no encontrado", 404)
        );
      }

      const updated = await prisma.contact_messages.update({
        where: { id },
        data: parsed.data,
      });

      logger.info(`Contact message ${id} updated`, parsed.data);
      return NextResponse.json(ok(updated));
    } catch (err) {
      const e = normalizeApiError(err);
      logger.error("PATCH /api/contact/messages/[id] failed", e);
      const code: ApiErrorCode =
        e.code === "INTERNAL" ? "INTERNAL_ERROR" : (e.code as ApiErrorCode);
      return NextResponse.json(fail(code, e.message, e.status ?? 500));
    }
  }
);
