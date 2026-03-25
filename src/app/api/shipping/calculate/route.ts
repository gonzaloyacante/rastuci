import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getStorePostalCode } from "@/lib/store-settings";

const ShippingCalculateSchema = z.object({
  postalCode: z
    .string()
    .min(4)
    .max(8)
    .regex(/^\d{4}([A-Z]{3})?$/, "Código postal inválido"),
  deliveredType: z.enum(["D", "S"]).optional(),
  dimensions: z
    .object({
      weight: z.number().positive().max(30000).optional(),
      height: z.number().positive().max(200).optional(),
      width: z.number().positive().max(200).optional(),
      length: z.number().positive().max(200).optional(),
    })
    .optional(),
});

type DeliveredType = "D" | "S";

function fallbackResponse(deliveredType?: DeliveredType) {
  const type = deliveredType === "S" ? "agency" : "home";
  return NextResponse.json({
    success: true,
    options: FALLBACK_SHIPPING_OPTIONS[type],
    isFallback: true,
  });
}

function mapRate(rate: {
  productType: string;
  deliveredType: string;
  productName: string;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
  price: number;
}) {
  return {
    id: `ca-${rate.productType}-${rate.deliveredType}`,
    name: `${rate.productName} (${rate.deliveredType === "D" ? "Domicilio" : "Sucursal"})`,
    description: `Entrega en ${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`,
    price: rate.price,
    estimatedDays: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
    originalRate: rate,
    isFallback: false,
  };
}

// Opciones de envío de fallback cuando la API de CA no está disponible
const FALLBACK_SHIPPING_OPTIONS = {
  home: [
    {
      id: "standard-home",
      name: "Envío Estándar a Domicilio",
      description:
        "Correo Argentino - Entrega en tu domicilio (precio estimado)",
      price: 4500,
      estimatedDays: "5-7 días hábiles",
      isFallback: true,
    },
    {
      id: "express-home",
      name: "Envío Express a Domicilio",
      description: "Correo Argentino - Entrega rápida (precio estimado)",
      price: 7000,
      estimatedDays: "2-3 días hábiles",
      isFallback: true,
    },
  ],
  agency: [
    {
      id: "standard-agency",
      name: "Envío a Sucursal",
      description:
        "Retirá en la sucursal de Correo Argentino (precio estimado)",
      price: 3500,
      estimatedDays: "5-7 días hábiles",
      isFallback: true,
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    // [C-03] Rate limit: max 20 shipping calculations per IP per minute
    const rateLimit = await checkRateLimit(request, {
      key: "shipping-calculate",
      limit: 20,
      windowMs: 60_000,
    });
    if (!rateLimit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Demasiados intentos. Intenta nuevamente en un momento.",
        },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const parseResult = ShippingCalculateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "Parámetros inválidos",
        },
        { status: 400 }
      );
    }

    const { postalCode, dimensions, deliveredType } = parseResult.data;

    // Obtener customerId - usar env directamente si el servicio no tiene
    const customerId =
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    // Si no hay customerId configurado, usar fallbacks
    if (!customerId) {
      logger.warn(
        "[Shipping] No customerId configured, using fallback options"
      );
      const type = deliveredType === "S" ? "agency" : "home";
      return NextResponse.json({
        success: true,
        options: FALLBACK_SHIPPING_OPTIONS[type],
        isFallback: true,
      });
    }

    // Dimensiones por defecto si no se envían (paquete estándar de ropa)
    const defaultDimensions = {
      weight: 500, // 500g - típico para ropa
      height: 5,
      width: 30,
      length: 40,
    };

    // Código postal de origen desde configuración de la tienda (DB)
    const storePostalCode = await getStorePostalCode();

    try {
      const {
        width = defaultDimensions.width,
        height = defaultDimensions.height,
        length = defaultDimensions.length,
        weight = defaultDimensions.weight,
      } = dimensions || {};

      const result = await correoArgentinoService.getRates({
        customerId: customerId || "",
        postalCodeOrigin: storePostalCode,
        postalCodeDestination: postalCode,
        dimensions: {
          width: Math.round(width),
          height: Math.round(height),
          length: Math.round(length),
          weight: Math.round(weight),
        },
      });

      if (
        result.success &&
        result.data?.rates &&
        result.data.rates.length > 0
      ) {
        let filteredRates = result.data.rates;
        if (deliveredType) {
          filteredRates = result.data.rates.filter(
            (rate) => rate.deliveredType === deliveredType
          );
          logger.info("[Shipping] Filtered rates by deliveredType", {
            requested: deliveredType,
            total: result.data.rates.length,
            filtered: filteredRates.length,
          });
        }

        if (filteredRates.length === 0) return fallbackResponse(deliveredType);

        const options = filteredRates.map(mapRate);
        return NextResponse.json({
          success: true,
          options,
          isFallback: false,
          source: "correo-argentino-api",
          validTo: result.data.validTo,
        });
      }

      logger.warn("[Shipping] CA API returned no rates, using fallback");
      return fallbackResponse(deliveredType);
    } catch (apiError) {
      logger.error("[Shipping] CA API error, using fallback:", { apiError });
      return fallbackResponse(deliveredType);
    }
  } catch (error) {
    logger.error("Error calculating shipping:", { error });
    return NextResponse.json({
      success: true,
      options: FALLBACK_SHIPPING_OPTIONS.home,
      isFallback: true,
    });
  }
}
