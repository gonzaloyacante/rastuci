import { z } from "zod";

export const OrdersQuerySchema = z.object({
  page: z
    .preprocess((v) => (v === null || v === undefined ? undefined : Number(v)), z.number().int().min(1).optional())
    .default(1),
  limit: z
    .preprocess((v) => (v === null || v === undefined ? undefined : Number(v)), z.number().int().min(1).max(50).optional())
    .default(10),
  status: z.enum(["PENDING", "PROCESSED", "DELIVERED"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1),
});

export const OrderCreateSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerPhone: z.string().trim().min(1).max(40),
  customerAddress: z.string().trim().min(1).max(300).optional(),
  items: z.array(OrderItemSchema).min(1),
});

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSED", "DELIVERED"]),
});

export type OrdersQuery = z.infer<typeof OrdersQuerySchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
