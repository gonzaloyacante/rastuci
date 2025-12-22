import {
  correoArgentinoService,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get("provinceCode");
    const postalCode = searchParams.get("postalCode");

    if (!provinceCode) {
      return NextResponse.json(
        { success: false, error: "Código de provincia requerido" },
        { status: 400 }
      );
    }

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
  } catch (error: any) {
    logger.error("[Agencies] Unexpected error", {
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    return NextResponse.json({
      success: false,
      error: error.message || "Error inesperado",
      agencies: [],
    });
  }
}
