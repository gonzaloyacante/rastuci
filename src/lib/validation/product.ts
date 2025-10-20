import { z } from "zod";

export const ProductsQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional(),
  onSale: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z
    .enum(["createdAt", "price", "name", "rating", "reviewCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  price: z.number().finite().nonnegative(),
  stock: z.number().int().min(0).default(0),
  // Aceptar cadenas simples (rutas relativas) o arrays de strings.
  images: z.union([z.string(), z.array(z.string())]),
  onSale: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  categoryId: z.string().cuid(),
});

export type ProductCreate = z.infer<typeof ProductCreateSchema>;

// Schema para crear reseñas de producto
export const ProductReviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  customerName: z.string().trim().min(1).max(100),
});

export type ProductReviewCreate = z.infer<typeof ProductReviewCreateSchema>;
