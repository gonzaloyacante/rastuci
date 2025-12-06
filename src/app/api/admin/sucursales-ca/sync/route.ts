import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

interface AgencyData {
  code: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  schedule?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { agencies }: { agencies: AgencyData[] } = await request.json();

    if (!agencies || !Array.isArray(agencies) || agencies.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "No se proporcionaron sucursales para sincronizar",
          data: null,
        },
        { status: 400 }
      );
    }

    let syncedCount = 0;

    for (const agency of agencies) {
      try {
        // Extract street data from address if possible
        const addressParts = agency.address?.split(/\s+/) || [];
        const streetName = addressParts.slice(0, -1).join(' ') || agency.address;
        const streetNumber = addressParts[addressParts.length - 1] || null;

        await prisma.ca_agencies.upsert({
          where: { code: agency.code },
          update: {
            name: agency.name,
            streetName: streetName || null,
            streetNumber: streetNumber || null,
            locality: agency.city || null,
            city: agency.city || null,
            province: agency.province || null,
            provinceCode: agency.code.charAt(0), // First letter of code is province
            postalCode: agency.postalCode || null,
            phone: agency.phone || null,
            email: agency.email || null,
            latitude: agency.latitude || null,
            longitude: agency.longitude || null,
            updatedAt: new Date(),
          },
          create: {
            code: agency.code,
            name: agency.name,
            streetName: streetName || null,
            streetNumber: streetNumber || null,
            locality: agency.city || null,
            city: agency.city || null,
            province: agency.province || null,
            provinceCode: agency.code.charAt(0),
            postalCode: agency.postalCode || null,
            phone: agency.phone || null,
            email: agency.email || null,
            latitude: agency.latitude || null,
            longitude: agency.longitude || null,
            updatedAt: new Date(),
          },
        });

        syncedCount++;
      } catch (error) {
        logger.error("[CA Agencies Sync] Error syncing agency", {
          code: agency.code,
          error,
        });
      }
    }

    logger.info("[CA Agencies Sync] Sync completed", { syncedCount });

    return NextResponse.json<ApiResponse<{ syncedCount: number }>>({
      success: true,
      message: `${syncedCount} sucursales sincronizadas correctamente`,
      data: { syncedCount },
    });
  } catch (error) {
    logger.error("[CA Agencies Sync] Error", { error });

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error al sincronizar sucursales",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const agencies = await prisma.ca_agencies.findMany({
      orderBy: [{ province: "asc" }, { city: "asc" }, { name: "asc" }],
    });

    return NextResponse.json<ApiResponse<typeof agencies>>({
      success: true,
      message: "Sucursales obtenidas correctamente",
      data: agencies,
    });
  } catch (error) {
    logger.error("[CA Agencies] Error fetching agencies", { error });

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error al obtener sucursales",
        data: null,
      },
      { status: 500 }
    );
  }
}
