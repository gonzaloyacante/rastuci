import { z } from "zod";

export const ProductsQuerySchema = z.object({
  categoryId: z
    .string()
    .min(20)
    .max(32)
    .regex(/^[a-z0-9]+$/)
    .optional(),
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
    .enum(["createdAt", "price", "name", "rating", "reviewCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.number().finite().nonnegative(),
  salePrice: z.number().finite().nonnegative().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  // Aceptar cadenas simples (rutas relativas) o arrays de strings.
  images: z.union([z.string(), z.array(z.string().min(1))]).refine(
    (val) => {
      if (typeof val === "string") return val.length > 0;
      return Array.isArray(val) && val.length > 0;
    },
    { message: "Debe haber al menos una imagen" }
  ),
  onSale: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  weight: z.number().int().min(1).max(30000).optional().nullable(),
  height: z.number().int().min(1).max(150).optional().nullable(),
  width: z.number().int().min(1).max(150).optional().nullable(),
  length: z.number().int().min(1).max(150).optional().nullable(),
  // CUID2 tiene formato diferente a CUID v1, validar longitud y caracteres
  categoryId: z
    .string()
    .min(20)
    .max(32)
    .regex(/^[a-z0-9]+$/, "ID de categoría inválido"),
  variants: z
    .array(
      z.object({
        color: z.string(),
        size: z.string(),
        stock: z.number().int().min(0),
        sku: z.string().optional(),
      })
    )
    .optional(),
});

export type ProductCreate = z.infer<typeof ProductCreateSchema>;

// Schema para crear reseñas de producto
export const ProductReviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  customerName: z.string().trim().min(1).max(100),
});

export type ProductReviewCreate = z.infer<typeof ProductReviewCreateSchema>;
