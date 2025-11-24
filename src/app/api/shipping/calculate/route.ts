import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

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

    // Obtener customerId del servicio (ya debe estar configurado en env)
    const customerId = correoArgentinoService.getCustomerId();
    if (!customerId) {
      // Intentar autenticar si no hay ID (aunque el servicio lo hace internamente)
      await correoArgentinoService.authenticate();
    }

    // Si sigue sin haber ID, usar el de env directamente o fallar
    const finalCustomerId =
      customerId || process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    if (!finalCustomerId) {
      return NextResponse.json(
        { success: false, error: "Error de configuración: Falta Customer ID" },
        { status: 500 }
      );
    }

    // Dimensiones por defecto si no se envían (paquete estándar)
    const defaultDimensions = {
      weight: 1000, // 1kg
      height: 10,
      width: 20,
      length: 20,
    };

    const result = await correoArgentinoService.calculateRates({
      customerId: finalCustomerId,
      postalCodeOrigin: "1611", // Don Torcuato
      postalCodeDestination: postalCode,
      deliveredType: deliveredType || undefined, // "D" o "S" o undefined para ambos
      dimensions: dimensions || defaultDimensions,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error?.message || "Error al cotizar" },
        { status: 400 }
      );
    }

    // Mapear respuesta al formato que espera el frontend
    // La interfaz ShippingOption del frontend espera: id, name, description, price, estimatedDays
    const options = result.data?.rates.map((rate) => ({
      id: `ca-${rate.productType}-${rate.deliveredType}`,
      name: `Correo Argentino - ${rate.productName} (${
        rate.deliveredType === "D" ? "Domicilio" : "Sucursal"
      })`,
      description: `Entrega en ${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
      price: rate.price,
      estimatedDays: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
      // Datos extra útiles
      originalRate: rate,
    }));

    return NextResponse.json({
      success: true,
      options,
    });
  } catch (error) {
    logger.error("Error calculating shipping:", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error calculando envío",
      },
      { status: 500 }
    );
  }
}
