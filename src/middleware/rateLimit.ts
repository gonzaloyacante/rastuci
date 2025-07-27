import rateLimit from "express-rate-limit";

// Rate limiter general para todas las APIs
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error:
      "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter más estricto para autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: {
    error:
      "Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para creación de contenido
export const createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 creaciones por hora
  message: {
    error: "Demasiadas creaciones de contenido, intenta de nuevo en 1 hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para búsquedas
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 búsquedas por minuto
  message: {
    error: "Demasiadas búsquedas, intenta de nuevo en 1 minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para reseñas
export const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // máximo 3 reseñas por día por IP
  message: {
    error: "Demasiadas reseñas, intenta de nuevo mañana.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
