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

    // Contact for shipping (remitente)
    phone: z.string().min(6).max(30).default("+54 11 1234-5678"),
    email: z.string().email().default("ventas@rastuci.com"),

    // Origin address for shipping calculations and CA imports
    address: z.object({
        streetName: z.string().min(1).max(100).default("Av. San Martín"),
        streetNumber: z.string().min(1).max(20).default("1234"),
        floor: z.string().max(10).optional(),
        apartment: z.string().max(10).optional(),
        city: z.string().min(1).max(100).default("Buenos Aires"),
        provinceCode: z.string().length(1).default("B"), // CA province code
        postalCode: z.string().regex(/^\d{4}$/).default("1611"),
    }),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const defaultStoreSettings: StoreSettings = {
    name: "Rastuci",
    adminEmail: "gyacante9@gmail.com",
    phone: "+54 11 1234-5678",
    email: "ventas@rastuci.com",
    address: {
        streetName: "Av. San Martín",
        streetNumber: "1234",
        floor: "",
        apartment: "",
        city: "Buenos Aires",
        provinceCode: "B",
        postalCode: "1611",
    },
};

/**
 * Province code mapping for Correo Argentino
 */
export const provinceCodeMap: Record<string, string> = {
    A: "Salta",
    B: "Buenos Aires",
    C: "Ciudad Autónoma de Buenos Aires",
    D: "San Luis",
    E: "Entre Ríos",
    F: "La Rioja",
    G: "Santiago del Estero",
    H: "Chaco",
    J: "San Juan",
    K: "Catamarca",
    L: "La Pampa",
    M: "Mendoza",
    N: "Misiones",
    P: "Formosa",
    Q: "Neuquén",
    R: "Río Negro",
    S: "Santa Fe",
    T: "Tucumán",
    U: "Chubut",
    V: "Tierra del Fuego",
    W: "Corrientes",
    X: "Córdoba",
    Y: "Jujuy",
    Z: "Santa Cruz",
};
