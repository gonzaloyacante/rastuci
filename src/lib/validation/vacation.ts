import { z } from "zod";

export const VacationSettingsSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().min(1, "El título es requerido").max(200),
    message: z.string().min(1, "El mensaje es requerido").max(2000),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    showEmailCollection: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If both present, end must be >= start
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la de inicio",
      path: ["endDate"],
    }
  );

export type VacationSettingsFormData = z.infer<typeof VacationSettingsSchema>;

export const CartItemSchema = z.object({
  productId: z.string().max(36),
  quantity: z.number().int().positive(),
  color: z.string().max(50).optional(),
  size: z.string().max(20).optional(),
});

export const VacationSubscriberSchema = z.object({
  email: z.string().email("Email inválido").max(254),
  cartItems: z.array(CartItemSchema).max(50).optional(),
});

export type CartItemData = z.infer<typeof CartItemSchema>;
export type VacationSubscriberData = z.infer<typeof VacationSubscriberSchema>;
