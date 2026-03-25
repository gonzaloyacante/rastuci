import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  correoArgentinoService,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

const VALID_PROVINCE_CODES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;

const AgenciesQuerySchema = z.object({
  provinceCode: z.enum(VALID_PROVINCE_CODES),
  postalCode: z
    .string()
    .regex(/^\d{4}([A-Z]{3})?$/, "Código postal inválido")
    .optional(),
});

type Agency = {
  location?: { address?: { postalCode?: string } };
  name?: string;
};

function filterAgenciesByPostalCode(
  agencies: Agency[],
  postalCode?: string
): Agency[] {
  if (!postalCode || agencies.length === 0) return agencies;
  const cleanSearchCP = postalCode.replace(/\D/g, "");
  const filtered = agencies.filter((agency) => {
    const rawCP = agency.location?.address?.postalCode || "";
    const cleanAgencyCP = rawCP.replace(/\D/g, "");
    return (
      cleanAgencyCP === cleanSearchCP ||
      cleanAgencyCP.startsWith(cleanSearchCP) ||
      cleanSearchCP.startsWith(cleanAgencyCP) ||
      rawCP === postalCode
    );
  });
  logger.info(`[Agencies] Filtered by postalCode ${postalCode}`, {
    filtered: filtered.length,
  });
  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      key: makeKey("GET", "/api/shipping/agencies"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiados intentos. Intentá más tarde.",
          agencies: [],
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = AgenciesQuerySchema.safeParse({
      provinceCode: searchParams.get("provinceCode") || undefined,
      postalCode: searchParams.get("postalCode") || undefined,
    });

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Parámetros inválidos";
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    const { provinceCode, postalCode } = parsed.data;
    const customerId = process.env.CORREO_ARGENTINO_CUSTOMER_ID;
    if (!customerId) {
      logger.error("[Agencies] CORREO_ARGENTINO_CUSTOMER_ID not configured");
      return NextResponse.json(
        { success: false, error: "Customer ID no configurado", agencies: [] },
        { status: 500 }
      );
    }

    logger.info("[Agencies] Fetching agencies from CA API", {
      provinceCode,
      customerId,
      postalCode: postalCode || "none",
    });

    const result = await correoArgentinoService.getAgencies({
      customerId,
      provinceCode: provinceCode as ProvinceCode,
    });
    if (!result.success) {
      logger.error("[Agencies] CA API failed", { error: result.error });
      return NextResponse.json({
        success: false,
        error: result.error?.message || "Error al obtener sucursales",
        agencies: [],
      });
    }

    const agencies = filterAgenciesByPostalCode(result.data || [], postalCode);
    return NextResponse.json({ success: true, agencies, isFallback: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    logger.error("[Agencies] Unexpected error", {
      message,
      stack:
        error instanceof Error ? error.stack?.substring(0, 500) : undefined,
    });
    return NextResponse.json({ success: false, error: message, agencies: [] });
  }
}
