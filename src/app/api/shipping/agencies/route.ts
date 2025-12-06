import {
  correoArgentinoService,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Sucursales de ejemplo para fallback
const FALLBACK_AGENCIES = [
  {
    code: "FALLBACK-001",
    name: "Sucursal Centro",
    manager: "N/A",
    email: "centro@correoargentino.com.ar",
    phone: "0810-999-0000",
    services: {
      packageReception: true,
      pickupAvailability: true,
    },
    location: {
      address: {
        streetName: "Av. Corrientes",
        streetNumber: "1234",
        locality: "Centro",
        city: "Capital Federal",
        province: "Ciudad Autónoma de Buenos Aires",
        provinceCode: "C",
        postalCode: "1043",
      },
      latitude: "-34.604",
      longitude: "-58.381",
    },
    hours: {
      sunday: null,
      monday: { start: "0900", end: "1800" },
      tuesday: { start: "0900", end: "1800" },
      wednesday: { start: "0900", end: "1800" },
      thursday: { start: "0900", end: "1800" },
      friday: { start: "0900", end: "1800" },
      saturday: { start: "0900", end: "1300" },
      holidays: null,
    },
    status: "ACTIVE",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get("provinceCode");
    const postalCode = searchParams.get("postalCode"); // Filtro opcional

    if (!provinceCode) {
      return NextResponse.json(
        { success: false, error: "Código de provincia requerido" },
        { status: 400 }
      );
    }

    // Obtener customerId del servicio o env
    const customerId =
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    // Si no hay customerId, devolver fallback
    if (!customerId) {
      logger.warn("[Agencies] No customerId configured, using fallback");
      return NextResponse.json({
        success: true,
        agencies: FALLBACK_AGENCIES,
        isFallback: true,
      });
    }

    try {
      const result = await correoArgentinoService.getAgencies({
        customerId,
        provinceCode: provinceCode as ProvinceCode,
      });

      if (result.success && result.data && result.data.length > 0) {
        let filteredAgencies = result.data;

        // Filtrar por código postal si se proporciona
        if (postalCode) {
          filteredAgencies = result.data.filter((agency) => {
            const agencyPostalCode = agency.location?.address?.postalCode;
            // Match exacto o parcial (primeros 4 dígitos)
            return (
              agencyPostalCode === postalCode ||
              agencyPostalCode?.startsWith(postalCode) ||
              postalCode.startsWith(agencyPostalCode || "")
            );
          });

          logger.info(`[Agencies] Filtered by postalCode ${postalCode}`, {
            total: result.data.length,
            filtered: filteredAgencies.length,
          });
        }

        return NextResponse.json({
          success: true,
          agencies: filteredAgencies,
          isFallback: false,
        });
      }

      // Si no hay sucursales, devolver fallback
      logger.warn("[Agencies] CA API returned no agencies, using fallback");
      return NextResponse.json({
        success: true,
        agencies: FALLBACK_AGENCIES,
        isFallback: true,
      });
    } catch (apiError) {
      logger.error("[Agencies] CA API error, using fallback:", { apiError });
      return NextResponse.json({
        success: true,
        agencies: FALLBACK_AGENCIES,
        isFallback: true,
      });
    }
  } catch (error) {
    logger.error("Error getting agencies:", { error });
    return NextResponse.json({
      success: true,
      agencies: FALLBACK_AGENCIES,
      isFallback: true,
    });
  }
}
