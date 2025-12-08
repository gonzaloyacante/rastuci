import prisma from "@/lib/prisma";
import { defaultStoreSettings, type StoreSettings } from "@/lib/validation/store";
import { logger } from "@/lib/logger";

const SETTINGS_KEY = "store";

/**
 * Get store settings from database
 *
 * Use this in server-side code (API routes, webhooks) instead of process.env.STORE_*
 */
export async function getStoreSettings(): Promise<StoreSettings> {
    try {
        const record = await prisma.settings.findUnique({
            where: { key: SETTINGS_KEY },
        });

        if (!record) {
            return defaultStoreSettings;
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

        return settings as StoreSettings;
    } catch (error) {
        logger.error("[getStoreSettings] Error fetching settings, using defaults", { error });
        return defaultStoreSettings;
    }
}

/**
 * Get admin email for notifications
 */
export async function getAdminEmail(): Promise<string> {
    const settings = await getStoreSettings();
    return settings.adminEmail;
}

/**
 * Get store postal code for shipping calculations
 */
export async function getStorePostalCode(): Promise<string> {
    const settings = await getStoreSettings();
    return settings.address.postalCode;
}
