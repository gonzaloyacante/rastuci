import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { getStorePostalCode } from "@/lib/store-settings";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postalCode, dimensions, deliveredType } = body;

    if (!postalCode) {
      return NextResponse.json(
        { success: false, error: "Código postal requerido" },
        { status: 400 }
      );
    }

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
        customerId: process.env.CORREO_ARGENTINO_CUSTOMER_ID || "",
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
        // Filtrar por tipo de entrega si se especificó (D=Domicilio, S=Sucursal)
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

        // Si no hay rates después del filtro, usar fallback
        if (filteredRates.length === 0) {
          const type = deliveredType === "S" ? "agency" : "home";
          return NextResponse.json({
            success: true,
            options: FALLBACK_SHIPPING_OPTIONS[type],
            isFallback: true,
          });
        }

        // Mapear respuesta al formato que espera el frontend
        const options = filteredRates.map((rate) => ({
          id: `ca-${rate.productType}-${rate.deliveredType}`,
          name: `${rate.productName} (${
            rate.deliveredType === "D" ? "Domicilio" : "Sucursal"
          })`,
          description: `Entrega en ${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`,
          price: rate.price,
          estimatedDays: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
          originalRate: rate,
          isFallback: false, // Datos reales de la API
        }));

        return NextResponse.json({
          success: true,
          options,
          isFallback: false,
          source: "correo-argentino-api",
          validTo: result.data.validTo,
        });
      }

      // Si la API no devolvió rates, usar fallback
      logger.warn("[Shipping] CA API returned no rates, using fallback");
      const type = deliveredType === "S" ? "agency" : "home";
      return NextResponse.json({
        success: true,
        options: FALLBACK_SHIPPING_OPTIONS[type],
        isFallback: true,
      });
    } catch (apiError) {
      // Error al comunicarse con CA, usar fallback
      logger.error("[Shipping] CA API error, using fallback:", { apiError });
      const type = deliveredType === "S" ? "agency" : "home";
      return NextResponse.json({
        success: true,
        options: FALLBACK_SHIPPING_OPTIONS[type],
        isFallback: true,
      });
    }
  } catch (error) {
    logger.error("Error calculating shipping:", { error });
    // En caso de error general, devolver fallback de domicilio
    return NextResponse.json({
      success: true,
      options: FALLBACK_SHIPPING_OPTIONS.home,
      isFallback: true,
    });
  }
}
