import { z } from "zod";

export const VacationSettingsSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().min(1, "El título es requerido"),
    message: z.string().min(1, "El mensaje es requerido"),
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
  productId: z.string(),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
});

export const VacationSubscriberSchema = z.object({
  email: z.string().email("Email inválido"),
  cartItems: z.array(CartItemSchema).optional(),
});

export type CartItemData = z.infer<typeof CartItemSchema>;
export type VacationSubscriberData = z.infer<typeof VacationSubscriberSchema>;
