import { showToast } from "@/components/ui/Toast";

// Tipos de errores
export enum ErrorType {
  VALIDATION = "VALIDATION",
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

// Interfaz para errores personalizados
export interface IAppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Clase para errores de la aplicación
export class AppError extends Error {
  public type: ErrorType;
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.type = type;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

// Función para crear errores específicos
export const createError = (
  type: ErrorType,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): AppError => {
  return new AppError(type, message, code, details);
};

// Type guards
function isErrorWithName(
  error: unknown
): error is { name: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    "message" in error
  );
}

function isErrorWithStatus(
  error: unknown
): error is { status: number; message?: string } {
  return typeof error === "object" && error !== null && "status" in error;
}

// Función para manejar errores de API
export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Error de red
  if (
    isErrorWithName(error) &&
    error.name === "TypeError" &&
    error.message.includes("fetch")
  ) {
    return createError(
      ErrorType.NETWORK,
      "Error de conexión. Verifica tu conexión a internet.",
      "NETWORK_ERROR"
    );
  }

  // Error de respuesta HTTP
  if (isErrorWithStatus(error)) {
    switch (error.status) {
      case 400:
        return createError(
          ErrorType.VALIDATION,
          "Datos inválidos. Verifica la información ingresada.",
          "BAD_REQUEST"
        );
      case 401:
        return createError(
          ErrorType.AUTHENTICATION,
          "No tienes autorización para realizar esta acción.",
          "UNAUTHORIZED"
        );
      case 403:
        return createError(
          ErrorType.AUTHORIZATION,
          "No tienes permisos para acceder a este recurso.",
          "FORBIDDEN"
        );
      case 404:
        return createError(
          ErrorType.NOT_FOUND,
          "El recurso solicitado no fue encontrado.",
          "NOT_FOUND"
        );
      case 500:
        return createError(
          ErrorType.SERVER,
          "Error interno del servidor. Intenta más tarde.",
          "INTERNAL_SERVER_ERROR"
        );
      default:
        return createError(
          ErrorType.SERVER,
          "Error del servidor. Intenta más tarde.",
          "SERVER_ERROR"
        );
    }
  }

  // Error desconocido
  return createError(
    ErrorType.UNKNOWN,
    "Ocurrió un error inesperado. Intenta más tarde.",
    "UNKNOWN_ERROR",
    { originalError: String(error) }
  );
};

// Función para mostrar errores al usuario
export const showError = (error: AppError | string) => {
  const message = typeof error === "string" ? error : error.message;

  showToast({
    type: "error",
    message,
    duration: 5000,
  });
};

// Función para mostrar éxito
export const showSuccess = (message: string) => {
  showToast({
    type: "success",
    message,
    duration: 3000,
  });
};

// Función para mostrar información
export const showInfo = (message: string) => {
  showToast({
    type: "info",
    message,
    duration: 4000,
  });
};

// Hook para manejo de errores en componentes
export const useErrorHandler = () => {
  const handleError = (error: unknown) => {
    const appError = handleApiError(error);
    showError(appError);
    return appError;
  };

  const handleSuccess = (message: string) => {
    showSuccess(message);
  };

  const handleInfo = (message: string) => {
    showInfo(message);
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
  };
};

// Función para logging de errores (para desarrollo)
export const logError = (_error: AppError, _context?: string) => {
  // Error logging handled by logger in production
};

// Función para validar respuestas de API
export const validateApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "Error desconocido" };
    }

    throw createError(
      ErrorType.SERVER,
      errorData.message || `Error ${response.status}`,
      `HTTP_${response.status}`,
      errorData
    );
  }

  return response.json();
};

// Función para hacer requests seguros
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    const appError = handleApiError(error);
    logError(appError, context);
    showError(appError);
    return null;
  }
};
