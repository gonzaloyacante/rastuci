import { NextResponse } from "next/server";
import { z } from "zod";

import {
  correoArgentinoService,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = AgenciesQuerySchema.safeParse({
      provinceCode: searchParams.get("provinceCode") ?? undefined,
      postalCode: searchParams.get("postalCode") ?? undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "Parámetros inválidos",
        },
        { status: 400 }
      );
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
      logger.error("[Agencies] CA API failed", {
        error: result.error,
      });
      return NextResponse.json({
        success: false,
        error: result.error?.message || "Error al obtener sucursales",
        agencies: [],
      });
    }

    let agencies = result.data || [];

    logger.info("[Agencies] CA API returned", {
      count: agencies.length,
      firstAgency: agencies[0]?.name || "none",
    });

    // Filtrar por código postal si se proporciona
    if (postalCode && agencies.length > 0) {
      const cleanSearchCP = postalCode.replace(/\D/g, "");

      agencies = agencies.filter((agency) => {
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
        filtered: agencies.length,
      });
    }

    return NextResponse.json({
      success: true,
      agencies,
      isFallback: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    const stack = error instanceof Error ? error.stack : undefined;

    logger.error("[Agencies] Unexpected error", {
      message,
      stack: stack?.substring(0, 500),
    });

    return NextResponse.json({
      success: false,
      error: message,
      agencies: [],
    });
  }
}
