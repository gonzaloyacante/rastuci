import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  StoreSettingsSchema,
  defaultStoreSettings,
  type StoreSettings,
} from "@/lib/validation/store";
import { StockStatusColor, store_settings } from "@prisma/client";

// Helper to convert DB models to API format
function dbToApiFormat(
  store: store_settings | null,
  shipping: {
    enableFreeShipping: boolean;
  } | null,
  stock: {
    enableLowStockAlerts: boolean;
    statuses: {
      id: string;
      min: number;
      max: number | null;
      label: string;
      color: StockStatusColor;
    }[];
  } | null
): StoreSettings {
  // Use defaults where data is missing
  const s = store;
  const sh = shipping;
  const st = stock;

  return {
    name: s?.name ?? defaultStoreSettings.name,
    adminEmail: s?.adminEmail ?? defaultStoreSettings.adminEmail,
    address: {
      streetName: s?.addressStreet ?? defaultStoreSettings.address.streetName,
      streetNumber: defaultStoreSettings.address.streetNumber,
      city: s?.addressCity ?? defaultStoreSettings.address.city,
      provinceCode:
        s?.addressProvince ?? defaultStoreSettings.address.provinceCode,
      postalCode:
        s?.addressPostalCode ?? defaultStoreSettings.address.postalCode,
    },
    shipping: {
      freeShipping:
        sh?.enableFreeShipping ?? defaultStoreSettings.shipping.freeShipping,
    },
    emails: {
      salesEmail: s?.salesEmail ?? defaultStoreSettings.emails.salesEmail,
      supportEmail: s?.supportEmail ?? defaultStoreSettings.emails.supportEmail,
      senderName: s?.senderName ?? defaultStoreSettings.emails.senderName,
      footerText: defaultStoreSettings.emails.footerText, // Missing in DB schema yet? Using default.
    },
    stock: {
      enableStockAlerts:
        st?.enableLowStockAlerts ??
        defaultStoreSettings.stock.enableStockAlerts,
    },
    stockStatuses:
      st?.statuses.map((status) => ({
        id: status.id,
        min: status.min,
        max: status.max,
        label: status.label,
        color: status.color as string as
          | "success"
          | "warning"
          | "error"
          | "info"
          | "muted"
          | "primary"
          | "secondary"
          | "accent",
      })) ?? defaultStoreSettings.stockStatuses,
    payments: {
      cashDiscount:
        (s as any)?.cashDiscount ?? defaultStoreSettings.payments.cashDiscount,
      transferDiscount:
        (s as any)?.transferDiscount ??
        defaultStoreSettings.payments.transferDiscount,
      mpDiscount:
        (s as any)?.mpDiscount ?? defaultStoreSettings.payments.mpDiscount,
      cashExpirationHours:
        (s as any)?.cashExpirationHours ??
        defaultStoreSettings.payments.cashExpirationHours,
      transferExpirationHours:
        (s as any)?.transferExpirationHours ??
        defaultStoreSettings.payments.transferExpirationHours,
      mpExpirationMinutes:
        (s as any)?.mpExpirationMinutes ??
        defaultStoreSettings.payments.mpExpirationMinutes,
      bankName: (s as any)?.bankName ?? defaultStoreSettings.payments.bankName,
      bankCbu: (s as any)?.bankCbu ?? defaultStoreSettings.payments.bankCbu,
      bankAlias:
        (s as any)?.bankAlias ?? defaultStoreSettings.payments.bankAlias,
      bankHolder:
        (s as any)?.bankHolder ?? defaultStoreSettings.payments.bankHolder,
      bankCuit: (s as any)?.bankCuit ?? defaultStoreSettings.payments.bankCuit,
      couponsEnabled:
        (s as any)?.couponsEnabled ??
        defaultStoreSettings.payments.couponsEnabled,
    },
  };
}

/**
 * GET /api/settings/store
 */
export const GET = withAdminAuth(async (_request: NextRequest) => {
  try {
    const [store, shipping, stock] = await Promise.all([
      prisma.store_settings.findUnique({ where: { id: "default" } }),
      prisma.shipping_settings.findUnique({ where: { id: "default" } }),
      prisma.stock_settings.findUnique({
        where: { id: "default" },
        include: { statuses: { orderBy: { sortOrder: "asc" } } },
      }),
    ]);

    const data = dbToApiFormat(store, shipping, stock);

    // Validate (optional, but good for debugging)
    const parsed = StoreSettingsSchema.safeParse(data);
    if (!parsed.success) {
      logger.warn("Store settings API validation warning", {
        issues: parsed.error.flatten(),
      });
      // Return best effort data
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({
      success: true,
      data: parsed.data,
    });
  } catch (error) {
    logger.error("[StoreSettings] Error fetching settings", { error });
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/settings/store
 */
export const PUT = withAdminAuth(async (request: NextRequest) => {
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

    const data = parsed.data;

    // Transaction to update all tables
    await prisma.$transaction(async (tx) => {
      // 1. Store Settings
      await tx.store_settings.upsert({
        where: { id: "default" },
        update: {
          name: data.name,
          adminEmail: data.adminEmail || null,
          salesEmail: data.emails?.salesEmail || null,
          supportEmail: data.emails?.supportEmail || null,
          senderName: data.emails?.senderName || null,
          addressStreet: data.address?.streetName || null,
          addressCity: data.address?.city || null,
          addressProvince: data.address?.provinceCode || null,
          addressPostalCode: data.address?.postalCode || null,
          updatedAt: new Date(),
        },
        create: {
          id: "default",
          name: data.name,
          adminEmail: data.adminEmail || null,
          salesEmail: data.emails?.salesEmail || null,
          supportEmail: data.emails?.supportEmail || null,
          senderName: data.emails?.senderName || null,
          addressStreet: data.address?.streetName || null,
          addressCity: data.address?.city || null,
          addressProvince: data.address?.provinceCode || null,
          addressPostalCode: data.address?.postalCode || null,
        },
      });

      // 2. Shipping Settings
      await tx.shipping_settings.upsert({
        where: { id: "default" },
        update: {
          enableFreeShipping: data.shipping?.freeShipping ?? false,
          updatedAt: new Date(),
        },
        create: {
          id: "default",
          enableFreeShipping: data.shipping?.freeShipping ?? false,
        },
      });

      // 3. Stock Settings
      await tx.stock_settings.upsert({
        where: { id: "default" },
        update: {
          enableLowStockAlerts: data.stock?.enableStockAlerts ?? true,
          updatedAt: new Date(),
        },
        create: {
          id: "default",
          enableLowStockAlerts: data.stock?.enableStockAlerts ?? true,
        },
      });

      // 4. Stock Statuses (Replace all)
      await tx.stock_status_levels.deleteMany({
        where: { stockSettingsId: "default" },
      });

      if (data.stockStatuses && data.stockStatuses.length > 0) {
        await tx.stock_status_levels.createMany({
          data: data.stockStatuses.map((status, index) => ({
            id: status.id, // Use frontend ID
            stockSettingsId: "default",
            min: status.min,
            max: status.max,
            label: status.label,
            color: status.color as StockStatusColor,
            sortOrder: index,
          })),
        });
      }
    });

    logger.info("[StoreSettings] Settings updated", {
      adminEmail: data.adminEmail,
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    logger.error("[StoreSettings] Error updating settings", { error });
    return NextResponse.json(
      { success: false, error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
});
