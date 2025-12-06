import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { defaultShippingSettings } from "@/lib/validation/shipping";
import type { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// Valores por defecto para keys específicas
const DEFAULT_VALUES: Record<string, unknown> = {
  shipping: defaultShippingSettings,
};

// GET /api/cms - Obtener configuración CMS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Obtener un setting específico
      const setting = await prisma.settings.findUnique({
        where: { key },
      });

      // Si no existe, devolver valores por defecto si los hay
      if (!setting) {
        if (DEFAULT_VALUES[key]) {
          return NextResponse.json<ApiResponse<unknown>>({
            success: true,
            message: "Configuración por defecto",
            data: DEFAULT_VALUES[key],
          });
        }
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Configuración no encontrada",
            data: null,
          },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse<Record<string, unknown>>>({
        success: true,
        message: "Configuración obtenida",
        data: setting.value as Record<string, unknown>,
      });
    }

    // Obtener todos los settings
    const settings = await prisma.settings.findMany({
      orderBy: { key: "asc" },
    });

    type SettingType = (typeof settings)[0];
    const settingsMap = settings.reduce(
      (acc: Record<string, unknown>, setting: SettingType) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, unknown>
    );

    return NextResponse.json<ApiResponse<Record<string, unknown>>>({
      success: true,
      message: "Configuraciones obtenidas",
      data: settingsMap,
    });
  } catch (error) {
    logger.error("Error al obtener configuración CMS", { error });
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error al obtener configuración",
        data: null,
      },
      { status: 500 }
    );
  }
}

// PUT /api/cms - Actualizar configuración CMS (solo admin)
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "La clave es requerida",
          data: null,
        },
        { status: 400 }
      );
    }

    if (value === undefined) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "El valor es requerido",
          data: null,
        },
        { status: 400 }
      );
    }

    // Upsert: crear o actualizar
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value, updatedAt: new Date() },
    });

    return NextResponse.json<ApiResponse<Record<string, unknown>>>({
      success: true,
      message: "Configuración actualizada",
      data: setting.value as Record<string, unknown>,
    });
  } catch (error) {
    logger.error("Error al actualizar configuración CMS", { error });
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error al actualizar configuración",
        data: null,
      },
      { status: 500 }
    );
  }
});
