import { ZodError } from "zod";

export type NormalizedError = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

export function normalizeApiError(
  err: unknown,
  fallbackCode: string = "INTERNAL_ERROR",
  fallbackMessage: string = "Error interno del servidor",
  fallbackStatus: number = 500
): NormalizedError {
  // Zod validation errors
  if (err instanceof ZodError) {
    return {
      code: "BAD_REQUEST",
      message: "Datos inválidos",
      status: 400,
      details: err.issues,
    };
  }

  // Prisma errors (best-effort)
  const anyErr = err as any;
  const prismaCode: string | undefined = anyErr?.code;
  if (typeof prismaCode === "string" && prismaCode.startsWith("P")) {
    switch (prismaCode) {
      case "P2002": // Unique constraint failed
        return {
          code: "CONFLICT",
          message: "Conflicto con datos únicos",
          status: 409,
          details: safePick(anyErr, ["meta", "target"]),
        };
      case "P2025": // Record not found
        return {
          code: "NOT_FOUND",
          message: "Recurso no encontrado",
          status: 404,
        };
      default:
        return {
          code: "DB_ERROR",
          message: "Error de base de datos",
          status: 500,
          details: { code: prismaCode },
        };
    }
  }

  // Fallback
  return {
    code: fallbackCode,
    message: fallbackMessage,
    status: fallbackStatus,
  };
}

function safePick(obj: any, keys: string[]) {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}
