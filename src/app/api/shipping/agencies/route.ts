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

    if (!customerId) {
      // Intentar autenticar si no hay ID
      await correoArgentinoService.authenticate();
    }

    const finalCustomerId =
      customerId ||
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    if (!finalCustomerId) {
      return NextResponse.json(
        { success: false, error: "Error de configuración: Falta Customer ID" },
        { status: 500 }
      );
    }

    const result = await correoArgentinoService.getAgencies({
      customerId: finalCustomerId,
      provinceCode: provinceCode as ProvinceCode,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Error al obtener sucursales",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      agencies: result.data,
    });
  } catch (error) {
    logger.error("Error getting agencies:", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error obteniendo sucursales",
      },
      { status: 500 }
    );
  }
}
