import prisma from "@/lib/prisma";
import {
  defaultStoreSettings,
  type StoreSettings,
} from "@/lib/validation/store";
import { logger } from "@/lib/logger";

const SETTINGS_KEY = "store";

/**
 * Get store settings from database
 *
 * Use this in server-side code (API routes, webhooks) instead of process.env.STORE_*
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const [
      storeRecord,
      shippingRecord,
      stockRecord,
      stockLevels,
      contactRecord,
      legacyRecord,
    ] = await Promise.all([
      prisma.store_settings.findUnique({ where: { id: "default" } }),
      prisma.shipping_settings.findUnique({ where: { id: "default" } }),
      prisma.stock_settings.findUnique({ where: { id: "default" } }),
      prisma.stock_status_levels.findMany({
        where: { stockSettingsId: "default" },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.contact_settings.findUnique({ where: { id: "default" } }),
      prisma.settings.findUnique({ where: { key: SETTINGS_KEY } }),
    ]);

    // 1. Base Defaults
    let settings: StoreSettings = { ...defaultStoreSettings };

    // 2. Apply Legacy Overrides (if any) - Low priority
    if (legacyRecord?.value) {
      const legacy = legacyRecord.value as Partial<StoreSettings>;
      settings = {
        ...settings,
        ...legacy,
        address: { ...settings.address, ...legacy.address },
        emails: { ...settings.emails, ...legacy.emails },
        stock: { ...settings.stock, ...legacy.stock },
        shipping: { ...settings.shipping, ...legacy.shipping },
        payments: { ...settings.payments, ...legacy.payments },
      };
    }

    // 3. Apply New Table Overrides (High priority)

    // Store Settings (Identity & Address)
    if (storeRecord) {
      settings.name = storeRecord.name;
      settings.adminEmail = storeRecord.adminEmail ?? settings.adminEmail;
      settings.address = {
        ...settings.address,
        streetName: storeRecord.addressStreet ?? settings.address.streetName,
        city: storeRecord.addressCity ?? settings.address.city,
        provinceCode:
          (storeRecord.addressProvince as any) ?? settings.address.provinceCode,
        postalCode:
          storeRecord.addressPostalCode ?? settings.address.postalCode,
      };

      settings.emails = {
        ...settings.emails,
        salesEmail: storeRecord.salesEmail ?? settings.emails.salesEmail,
        supportEmail: storeRecord.supportEmail ?? settings.emails.supportEmail,
        senderName: storeRecord.senderName ?? settings.emails.senderName,
      };
    }

    // Shipping Settings
    if (shippingRecord) {
      settings.shipping = {
        ...settings.shipping,
        freeShipping: shippingRecord.enableFreeShipping,
      };
    }

    // Stock Settings
    if (stockRecord) {
      settings.stock = {
        ...settings.stock,
        enableStockAlerts: stockRecord.enableLowStockAlerts,
      };

      if (stockLevels.length > 0) {
        settings.stockStatuses = stockLevels.map((l) => ({
          id: l.id,
          min: l.min,
          max: l.max,
          label: l.label,
          color: l.color,
        }));
      }
    }

    // Contact Settings (Overrides emails if present)
    if (contactRecord) {
      // Optional: Sync sales email from contact emails if not explicitly set in store
      if (contactRecord.emails.length > 0 && !storeRecord?.salesEmail) {
        settings.emails.salesEmail = contactRecord.emails[0];
      }
    }

    return settings;
  } catch (error) {
    logger.error("[getStoreSettings] Error fetching settings, using defaults", {
      error,
    });
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
