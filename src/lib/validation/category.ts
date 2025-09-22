import { z } from "zod";

export const CategoriesQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  includeProductCount: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

export type CategoriesQuery = z.infer<typeof CategoriesQuerySchema>;

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
