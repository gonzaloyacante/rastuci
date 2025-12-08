import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
    StoreSettingsSchema,
    defaultStoreSettings,
    type StoreSettings,
} from "@/lib/validation/store";

const SETTINGS_KEY = "store";

/**
 * GET /api/settings/store
 *
 * Returns store settings from database, or defaults if not set.
 */
export async function GET() {
    try {
        const record = await prisma.settings.findUnique({
            where: { key: SETTINGS_KEY },
        });

        if (!record) {
            return NextResponse.json({
                success: true,
                data: defaultStoreSettings,
            });
        }

        // Merge with defaults to ensure all fields exist
        const settings = {
            ...defaultStoreSettings,
            ...(record.value as Partial<StoreSettings>),
            address: {
                ...defaultStoreSettings.address,
                ...((record.value as Partial<StoreSettings>)?.address || {}),
            },
        };

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        logger.error("[StoreSettings] Error fetching settings", { error });
        return NextResponse.json(
            { success: false, error: "Error al obtener configuración" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/settings/store
 *
 * Updates store settings in database.
 */
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const parsed = StoreSettingsSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Datos inválidos",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const jsonValue = JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue;

        await prisma.settings.upsert({
            where: { key: SETTINGS_KEY },
            update: {
                value: jsonValue,
                updatedAt: new Date(),
            },
            create: {
                key: SETTINGS_KEY,
                value: jsonValue,
                updatedAt: new Date(),
            },
        });

        logger.info("[StoreSettings] Settings updated", {
            adminEmail: parsed.data.adminEmail,
            postalCode: parsed.data.address.postalCode,
        });

        return NextResponse.json({
            success: true,
            data: parsed.data,
        });
    } catch (error) {
        logger.error("[StoreSettings] Error updating settings", { error });
        return NextResponse.json(
            { success: false, error: "Error al guardar configuración" },
            { status: 500 }
        );
    }
}
