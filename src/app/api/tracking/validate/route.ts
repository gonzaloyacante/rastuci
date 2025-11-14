import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { logger, getRequestId } from "@/lib/logger";
import { ocaService } from "@/lib/oca-service";
import { z } from "zod";

const TrackingValidationSchema = z.object({
  trackingNumber: z.string().min(1, "Número de tracking requerido").max(50, "Número de tracking muy largo")
});

interface TrackingValidationResponse {
  isValid: boolean;
  exists: boolean;
  trackingNumber: string;
  status?: string;
  description?: string;
  lastUpdate?: string;
  error?: string;
}

// POST /api/tracking/validate - Validar código de tracking en OCA
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TrackingValidationResponse>>> {
  try {
    const requestId = getRequestId(request.headers);
    
    // Rate limiting
    const rl = checkRateLimit(request, {
      key: makeKey("POST", "/api/tracking/validate"),
      ...getPreset("mutatingMedium"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Demasiadas solicitudes", 429);
    }

    // Validar input
    const json = await request.json();
    const parsed = TrackingValidationSchema.safeParse(json);
    if (!parsed.success) {
      return fail("BAD_REQUEST", "Número de tracking inválido", 400, { 
        issues: parsed.error.issues 
      });
    }

    const { trackingNumber } = parsed.data;

    try {
      // Intentar obtener información del tracking desde OCA
      const trackingInfo = await ocaService.obtenerEstadoEnvio(trackingNumber);
      
      const response: TrackingValidationResponse = {
        isValid: true,
        exists: true,
        trackingNumber,
        status: trackingInfo.estado,
        description: trackingInfo.descripcionEstado,
        lastUpdate: trackingInfo.fecha
      };

      logger.info("Tracking validation successful", { 
        requestId, 
        trackingNumber,
        status: trackingInfo.estado
      });

      return ok(response, "Tracking validado exitosamente");

    } catch (ocaError) {
      // Si OCA falla, intentar con el tracking completo
      try {
        const fullTracking = await ocaService.obtenerTracking(trackingNumber);
        
        const response: TrackingValidationResponse = {
          isValid: true,
          exists: true,
          trackingNumber,
          status: fullTracking.estadoActual?.estado,
          description: fullTracking.estadoActual?.descripcionEstado,
          lastUpdate: fullTracking.estadoActual?.fecha
        };

        logger.info("Tracking validation successful (full tracking)", { 
          requestId, 
          trackingNumber,
          status: fullTracking.estadoActual?.estado
        });

        return ok(response, "Tracking validado exitosamente");

      } catch (fullTrackingError) {
        // Si ambos fallan, el tracking no existe o hay error en OCA
        logger.warn("Tracking validation failed", { 
          requestId, 
          trackingNumber,
          ocaError: String(ocaError),
          fullTrackingError: String(fullTrackingError)
        });

        const response: TrackingValidationResponse = {
          isValid: false,
          exists: false,
          trackingNumber,
          error: "El número de tracking no existe o no se puede validar en este momento"
        };

        return ok(response, "Tracking no encontrado");
      }
    }

  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error in tracking validation", { 
      requestId, 
      error: String(error) 
    });
    
    const e = normalizeApiError(
      error, 
      "INTERNAL_ERROR", 
      "Error interno al validar tracking", 
      500
    );
    
    return fail(e.code as ApiErrorCode, e.message, e.status, { 
      requestId, 
      ...(e.details as Record<string, unknown>) 
    });
  }
}

// GET /api/tracking/validate?number=XXXX - Validar por query parameter
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TrackingValidationResponse>>> {
  try {
    const requestId = getRequestId(request.headers);
    
    // Rate limiting
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/tracking/validate"),
      ...getPreset("publicReadHeavy"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Demasiadas solicitudes", 429);
    }

    // Obtener número de tracking de query parameters
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('number');

    if (!trackingNumber || trackingNumber.length === 0) {
      return fail("BAD_REQUEST", "Parámetro 'number' requerido", 400);
    }

    if (trackingNumber.length > 50) {
      return fail("BAD_REQUEST", "Número de tracking muy largo", 400);
    }

    try {
      // Intentar obtener información del tracking desde OCA
      const trackingInfo = await ocaService.obtenerEstadoEnvio(trackingNumber);
      
      const response: TrackingValidationResponse = {
        isValid: true,
        exists: true,
        trackingNumber,
        status: trackingInfo.estado,
        description: trackingInfo.descripcionEstado,
        lastUpdate: trackingInfo.fecha
      };

      logger.info("Tracking validation successful (GET)", { 
        requestId, 
        trackingNumber,
        status: trackingInfo.estado
      });

      return ok(response, "Tracking validado exitosamente");

    } catch (ocaError) {
      // Si OCA falla, intentar con el tracking completo
      try {
        const fullTracking = await ocaService.obtenerTracking(trackingNumber);
        
        const response: TrackingValidationResponse = {
          isValid: true,
          exists: true,
          trackingNumber,
          status: fullTracking.estadoActual?.estado,
          description: fullTracking.estadoActual?.descripcionEstado,
          lastUpdate: fullTracking.estadoActual?.fecha
        };

        logger.info("Tracking validation successful (GET full tracking)", { 
          requestId, 
          trackingNumber,
          status: fullTracking.estadoActual?.estado
        });

        return ok(response, "Tracking validado exitosamente");

      } catch (fullTrackingError) {
        // Si ambos fallan, el tracking no existe o hay error en OCA
        logger.warn("Tracking validation failed (GET)", { 
          requestId, 
          trackingNumber,
          ocaError: String(ocaError),
          fullTrackingError: String(fullTrackingError)
        });

        const response: TrackingValidationResponse = {
          isValid: false,
          exists: false,
          trackingNumber,
          error: "El número de tracking no existe o no se puede validar en este momento"
        };

        return ok(response, "Tracking no encontrado");
      }
    }

  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error in tracking validation (GET)", { 
      requestId, 
      error: String(error) 
    });
    
    const e = normalizeApiError(
      error, 
      "INTERNAL_ERROR", 
      "Error interno al validar tracking", 
      500
    );
    
    return fail(e.code as ApiErrorCode, e.message, e.status, { 
      requestId, 
      ...(e.details as Record<string, unknown>) 
    });
  }
}