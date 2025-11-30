import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Opciones de envío de fallback cuando la API de CA no está disponible
const FALLBACK_SHIPPING_OPTIONS = {
  home: [
    {
      id: "standard-home",
      name: "Envío Estándar a Domicilio",
      description: "Correo Argentino - Entrega en tu domicilio",
      price: 4500,
      estimatedDays: "5-7 días hábiles",
    },
    {
      id: "express-home",
      name: "Envío Express a Domicilio",
      description: "Correo Argentino - Entrega rápida",
      price: 7000,
      estimatedDays: "2-3 días hábiles",
    },
  ],
  agency: [
    {
      id: "standard-agency",
      name: "Envío a Sucursal",
      description: "Retirá en la sucursal de Correo Argentino más cercana",
      price: 3500,
      estimatedDays: "5-7 días hábiles",
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

    // Código postal de origen (tienda en Don Torcuato)
    const STORE_POSTAL_CODE = process.env.STORE_POSTAL_CODE || "1611";

    try {
      const result = await correoArgentinoService.calculateRates({
        customerId,
        postalCodeOrigin: STORE_POSTAL_CODE,
        postalCodeDestination: postalCode,
        deliveredType: deliveredType || undefined,
        dimensions: dimensions || defaultDimensions,
      });

      if (
        result.success &&
        result.data?.rates &&
        result.data.rates.length > 0
      ) {
        // Mapear respuesta al formato que espera el frontend
        const options = result.data.rates.map((rate) => ({
          id: `ca-${rate.productType}-${rate.deliveredType}`,
          name: `${rate.productName} (${
            rate.deliveredType === "D" ? "Domicilio" : "Sucursal"
          })`,
          description: `Entrega en ${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`,
          price: rate.price,
          estimatedDays: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
          originalRate: rate,
        }));

        return NextResponse.json({
          success: true,
          options,
          isFallback: false,
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
