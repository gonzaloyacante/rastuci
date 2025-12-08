import { ORDER_STATUS } from "@/lib/constants";
import { z } from "zod";

export const OrderStatusSchema = z.enum(
  Object.values(ORDER_STATUS) as [string, ...string[]]
);

export const OrdersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  status: OrderStatusSchema.optional(),
  search: z.string().optional(),
});

export const OrderCreateSchema = z.object({
  customerName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  customerPhone: z.string().min(8, "Teléfono inválido"),
  customerAddress: z.string().min(5, "Dirección inválida"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  status: OrderStatusSchema.optional(),
});

export type OrdersQuery = z.infer<typeof OrdersQuerySchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusSchema,
});
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
