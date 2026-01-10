import { z } from "zod";

/**
 * Store Settings Schema
 *
 * Configuration for business operations - used by shipping, checkout, and admin notifications.
 * This data is stored in the database and editable from the admin panel.
 */
export const StoreSettingsSchema = z.object({
  // Business Identity
  name: z.string().min(1).max(100).default("Rastuci"),

  // Admin notifications
  adminEmail: z.string().email().default("gyacante9@gmail.com"),

  // Contact for shipping (remitente) - Now fetched from Global Contact Settings
  // phone: removed
  // email: removed (sales email)

  // Origin address for shipping calculations and CA imports
  address: z.object({
    streetName: z.string().min(1).max(100).default("Av. San Martín"),
    streetNumber: z.string().min(1).max(20).default("1234"),
    floor: z.string().max(10).optional(),
    apartment: z.string().max(10).optional(),
    city: z.string().min(1).max(100).default("Buenos Aires"),
    provinceCode: z.string().length(1).default("B"), // CA province code
    postalCode: z.string().min(1).max(10).default("1611"),
  }),
  // Shipping global settings
  shipping: z
    .object({
      freeShipping: z.boolean().default(false),
    })
    .default({ freeShipping: false }),

  // Email Configuration
  emails: z
    .object({
      salesEmail: z.string().email().default("pedidos@rastuci.com"),
      supportEmail: z.string().email().default("soporte@rastuci.com"),
      senderName: z.string().min(1).default("Rastuci"),
      footerText: z.string().optional(),
    })
    .default({
      salesEmail: "pedidos@rastuci.com",
      supportEmail: "soporte@rastuci.com",
      senderName: "Rastuci",
    }),

  // Stock Alerts
  stock: z
    .object({
      lowStockThreshold: z.number().min(0).default(5),
      enableStockAlerts: z.boolean().default(true),
    })
    .default({
      lowStockThreshold: 5,
      enableStockAlerts: true,
    }),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const defaultStoreSettings: StoreSettings = {
  name: "Rastuci",
  adminEmail: "gyacante9@gmail.com",
  address: {
    streetName: "Av. San Martín",
    streetNumber: "1234",
    floor: "",
    apartment: "",
    city: "Buenos Aires",
    provinceCode: "B",
    postalCode: "1611",
  },
  shipping: {
    freeShipping: false,
  },
  emails: {
    salesEmail: "pedidos@rastuci.com",
    supportEmail: "soporte@rastuci.com",
    senderName: "Rastuci",
    footerText: "",
  },
  stock: {
    lowStockThreshold: 5,
    enableStockAlerts: true,
  },
};

/**
 * Province code mapping for Correo Argentino
 */
// provinceCodeMap moved to @/lib/constants as PROVINCE_CODE_MAP
