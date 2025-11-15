import { ZodError } from "zod";

export type NormalizedError = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

export function normalizeApiError(
  err: unknown,
  fallbackCode = "INTERNAL_ERROR",
  fallbackMessage = "Error interno del servidor",
  fallbackStatus = 500
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
  const errWithCode = err as { code?: string };
  const prismaCode: string | undefined = errWithCode?.code;
  if (typeof prismaCode === "string" && prismaCode.startsWith("P")) {
    switch (prismaCode) {
      case "P2002": // Unique constraint failed
        return {
          code: "CONFLICT",
          message: "Conflicto con datos únicos",
          status: 409,
          details: safePick(errWithCode, ["meta", "target"]),
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

function safePick(obj: unknown, keys: string[]) {
  const out: Record<string, unknown> = {};
  if (obj && typeof obj === "object") {
    const objRecord = obj as Record<string, unknown>;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(objRecord, k)) {
        out[k] = objRecord[k];
      }
    }
  }
  return out;
}
