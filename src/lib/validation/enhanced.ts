import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Enhanced validation schemas
export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_,.()]+$/, 'El nombre contiene caracteres no válidos'),

  description: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),

  price: z
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(999999.99, 'El precio no puede exceder 999,999.99'),

  stock: z
    .number({
      required_error: 'El stock es requerido',
      invalid_type_error: 'El stock debe ser un número',
    })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(999999, 'El stock no puede exceder 999,999'),

  categoryId: z
    .string()
    .min(1, 'Debe seleccionar una categoría')
    .max(100, 'ID de categoría inválido'),

  images: z
    .array(z.string().url('Las URLs de imágenes deben ser válidas'))
    .min(1, 'Debe tener al menos una imagen')
    .max(10, 'No puede tener más de 10 imágenes'),

  onSale: z.boolean().default(false),

  sizes: z
    .array(z.string().min(1, 'Los talles no pueden estar vacíos'))
    .optional()
    .default([]),

  colors: z
    .array(z.string().min(1, 'Los colores no pueden estar vacíos'))
    .optional()
    .default([]),

  features: z
    .array(z.string().min(1, 'Las características no pueden estar vacías'))
    .optional()
    .default([]),
});

// Validation middleware
export const validateProductData = async (data: unknown) => {
  try {
    const validatedData = productSchema.parse(data);

    // Additional business logic validation
    if (validatedData.onSale && validatedData.price <= 0) {
      throw new Error('No se puede marcar como oferta un producto sin precio');
    }

    if (validatedData.stock === 0 && validatedData.onSale) {
      throw new Error('No se puede marcar como oferta un producto sin stock');
    }

    // Validate image URLs are accessible
    for (const imageUrl of validatedData.images) {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Imagen no accesible: ${imageUrl}`);
        }
      } catch {
        throw new Error(`URL de imagen inválida: ${imageUrl}`);
      }
    }

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }

    return {
      success: false,
      errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Error de validación' }],
    };
  }
};

// Form field validation helpers
export const validateField = (schema: z.ZodSchema, value: unknown) => {
  try {
    schema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Campo inválido',
      };
    }
    return { isValid: false, error: 'Error de validación' };
  }
};

// Real-time validation hook
export const useFormValidation = (schema: z.ZodSchema) => {
  const validateForm = (data: unknown) => {
    try {
      return { success: true, data: schema.parse(data) };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const field = err.path.join('.');
          errors[field] = err.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Error de validación' } };
    }
  };

  return { validateForm };
};

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
  );

// Email validation schema
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(254, 'Email demasiado largo');

// Phone validation schema
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/,
    'Número de teléfono inválido'
  );

// URL validation schema
export const urlSchema = z
  .string()
  .url('URL inválida');

// Date validation schema
export const dateSchema = z
  .date({
    required_error: 'La fecha es requerida',
    invalid_type_error: 'Fecha inválida',
  })
  .refine(date => date <= new Date(), 'La fecha no puede ser en el futuro');

// File validation schemas
export const imageFileSchema = z
  .instanceof(File)
  .refine(file => file.size <= 5 * 1024 * 1024, 'La imagen no puede exceder 5MB')
  .refine(
    file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Solo se permiten archivos JPG, PNG o WebP'
  );

export const documentFileSchema = z
  .instanceof(File)
  .refine(file => file.size <= 10 * 1024 * 1024, 'El archivo no puede exceder 10MB')
  .refine(
    file => [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(file.type),
    'Solo se permiten archivos PDF o Word'
  );

// Validation error handler
export const handleValidationError = (error: unknown, showToast = true) => {
  if (error instanceof z.ZodError) {
    const firstError = error.errors[0];
    if (showToast) {
      toast.error(firstError.message);
    }
    return firstError.message;
  }

  if (error instanceof Error) {
    if (showToast) {
      toast.error(error.message);
    }
    return error.message;
  }

  const message = 'Error de validación desconocido';
  if (showToast) {
    toast.error(message);
  }
  return message;
};

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .substring(0, 10000); // Limit length
};

// Rate limiting simulation
export const rateLimitSchema = z.object({
  action: z.string(),
  userId: z.string().optional(),
});

export const checkRateLimit = async (action: string, userId?: string) => {
  // In a real app, this would check against a rate limiting service
  // For now, just return success (action and userId would be used in real implementation)
  const limit = 10; // 10 requests per minute
  
  // Avoid unused parameter warnings
  void action;
  void userId;

  return { success: true, remaining: limit };
};

// Export all schemas
export const schemas = {
  product: productSchema,
  password: passwordSchema,
  email: emailSchema,
  phone: phoneSchema,
  url: urlSchema,
  date: dateSchema,
  imageFile: imageFileSchema,
  documentFile: documentFileSchema,
  rateLimit: rateLimitSchema,
};
