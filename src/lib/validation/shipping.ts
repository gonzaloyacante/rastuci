import { z } from "zod";

// Schema de validación para configuración de envío
export const ShippingSettingsSchema = z.object({
  freeShipping: z.boolean().default(true),
  freeShippingMinAmount: z.number().min(0).default(0),
  freeShippingLabel: z.string().default("Envío gratis"),
  freeShippingDescription: z.string().default("Envío gratis a todo el país"),
  shippingLabel: z.string().default("Envío"),
  shippingDescription: z.string().default("Envío a todo el país"),
  shippingCostLabel: z.string().default("Costo de envío"),
  shippingCostDescription: z
    .string()
    .default("El costo de envío se calculará en el checkout"),
  estimatedDelivery: z.string().default("3-5 días hábiles"),
});

export type ShippingSettings = z.infer<typeof ShippingSettingsSchema>;

export const defaultShippingSettings: ShippingSettings = {
  freeShipping: true,
  freeShippingMinAmount: 0,
  freeShippingLabel: "Envío gratis",
  freeShippingDescription: "Envío gratis a todo el país",
  shippingLabel: "Envío",
  shippingDescription: "Envío a todo el país",
  shippingCostLabel: "Costo de envío",
  shippingCostDescription: "El costo de envío se calculará en el checkout",
  estimatedDelivery: "3-5 días hábiles",
};
