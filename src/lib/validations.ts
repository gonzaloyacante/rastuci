import { z } from "zod";

// Esquemas de validación base
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  categoryId: z.string().min(1, "La categoría es requerida"),
  images: z
    .array(z.string().url("URL de imagen inválida"))
    .min(1, "Al menos una imagen es requerida"),
  onSale: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre es demasiado largo"),
  description: z.string().optional(),
});

export const userSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
  email: z.string().email("Email inválido"),
  role: z.enum(["ADMIN", "USER"]).optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
});

export const orderSchema = z.object({
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(1, "La dirección de envío es requerida"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "ID de producto requerido"),
        quantity: z.number().min(1, "Cantidad mínima es 1"),
        price: z.number().min(0, "Precio debe ser mayor a 0"),
      })
    )
    .min(1, "Al menos un producto es requerido"),
  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  total: z.number().min(0, "Total debe ser mayor a 0"),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating mínimo es 1").max(5, "Rating máximo es 5"),
  comment: z
    .string()
    .min(1, "El comentario es requerido")
    .max(500, "El comentario es demasiado largo"),
  customerName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es demasiado largo"),
});

// Esquemas para formularios
export const productFormSchema = productSchema.partial({
  description: true,
  onSale: true,
  sizes: true,
  colors: true,
  features: true,
  rating: true,
  reviewCount: true,
});

export const categoryFormSchema = categorySchema.partial({
  description: true,
});

export const userFormSchema = userSchema.partial({
  password: true,
  role: true,
});

export const orderFormSchema = orderSchema.partial({
  status: true,
});

// Tipos TypeScript derivados de los esquemas
export type ProductFormData = z.infer<typeof productFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;

// Funciones de validación
export const validateProduct = (data: unknown) => {
  return productSchema.safeParse(data);
};

export const validateCategory = (data: unknown) => {
  return categorySchema.safeParse(data);
};

export const validateUser = (data: unknown) => {
  return userSchema.safeParse(data);
};

export const validateOrder = (data: unknown) => {
  return orderSchema.safeParse(data);
};

export const validateReview = (data: unknown) => {
  return reviewSchema.safeParse(data);
};

// Función helper para extraer errores de validación
export const getValidationErrors = (
  result: z.SafeParseReturnType<any, any>
) => {
  if (result.success) return {};

  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join(".");
    errors[path] = error.message;
  });

  return errors;
};
