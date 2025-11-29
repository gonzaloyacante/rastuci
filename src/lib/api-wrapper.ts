/**
 * API Route Handler Wrapper
 * Envuelve automáticamente todas las rutas API para loggear requests/responses
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiLogger } from "./api-logger";
import { getRequestId } from "./logger";

type RouteHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

/**
 * Envuelve un route handler para agregar logging automático
 *
 * @example
 * export const GET = withApiLogger(async (req) => {
 *   // tu lógica aquí
 *   return NextResponse.json({ message: "ok" });
 * });
 */
export function withApiLogger(handler: RouteHandler): RouteHandler {
  return async (
    req: NextRequest,
    context?: { params: Record<string, string> }
  ) => {
    const startTime = performance.now();
    const requestId = getRequestId(req.headers);
    const method = req.method;
    const url = req.url;
    const logger = createApiLogger(requestId);

    try {
      // Log request
      let requestBody;
      try {
        const clonedReq = req.clone();
        requestBody = await clonedReq.json();
      } catch {
        // No hay body o no es JSON
      }

      logger.logRequest(method, url, requestBody);

      // Ejecutar el handler
      const response = await handler(req, context);

      // Log response
      const duration = performance.now() - startTime;
      let responseBody;

      try {
        const clonedResponse = response.clone();
        responseBody = await clonedResponse.json();
      } catch {
        // No es JSON
      }

      logger.logResponse(
        method,
        url,
        response.status,
        response.statusText,
        responseBody,
        duration
      );

      return response;
    } catch (error) {
      // Log error
      const duration = performance.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.logError(method, url, errorMessage, duration);

      // Re-throw para que Next.js maneje el error
      throw error;
    }
  };
}

/**
 * Helper para crear respuestas JSON con logging automático
 */
export function createJsonResponse(
  data: unknown,
  status = 200,
  headers?: HeadersInit
) {
  return NextResponse.json(data, {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Helper para respuestas de error con logging
 */
export function createErrorResponse(
  message: string,
  status = 500,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: code || `ERROR_${status}`,
    },
    { status }
  );
}
