import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

// GET /api/cms - Obtener configuración CMS
// @deprecated — This route reads from the legacy `settings` JSON table.
// All settings have been migrated to dedicated relational tables:
//   - home_settings, contact_settings, store_settings
//   - shipping_settings, stock_settings
//   - payment_methods, shipping_options
// This route will be removed after the grace period (2026-03-12).
export async function GET() {
  try {
    // Return all remaining settings from the deprecated table
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
      message:
        "⚠️ DEPRECATED: This route reads from legacy settings table. Use specific settings endpoints instead.",
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
