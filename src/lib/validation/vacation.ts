import { z } from "zod";

export const VacationSettingsSchema = z.object({
  enabled: z.boolean(),
  title: z.string().min(1, "El título es requerido"),
  message: z.string().min(1, "El mensaje es requerido"),
  startDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  showEmailCollection: z.boolean().default(true),
});

export type VacationSettingsFormData = z.infer<typeof VacationSettingsSchema>;

export const VacationSubscriberSchema = z.object({
  email: z.string().email("Email inválido"),
  cartSnapshot: z.any().optional(), // We accept any JSON for the cart snapshot
});

export type VacationSubscriberData = z.infer<typeof VacationSubscriberSchema>;
