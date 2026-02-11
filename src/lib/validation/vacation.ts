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
      // If enabled, start date must be present and not in the past (ignoring time)
      if (data.enabled && data.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // We allow starting today
        if (data.startDate < today) {
          return false;
        }
      }
      return true;
    },
    {
      message: "La fecha de inicio no puede ser en el pasado",
      path: ["startDate"],
    }
  )
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

export const VacationSubscriberSchema = z.object({
  email: z.string().email("Email inválido"),
  cartSnapshot: z.any().optional(), // We accept any JSON for the cart snapshot
});

export type VacationSubscriberData = z.infer<typeof VacationSubscriberSchema>;
