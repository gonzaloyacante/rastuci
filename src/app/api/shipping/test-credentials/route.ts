import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * GET /api/shipping/test-credentials
 * Endpoint de prueba para verificar las credenciales de Correo Argentino
 *
 * SOLO PARA DESARROLLO - eliminar o proteger en producción
 */
export async function GET() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error: "Este endpoint solo está disponible en desarrollo",
      },
      { status: 403 }
    );
  }

  const results: {
    step: string;
    success: boolean;
    data?: unknown;
    error?: string;
    duration?: number;
  }[] = [];

  // Paso 1: Verificar variables de entorno
  const envCheck = {
    CORREO_ARGENTINO_API_URL:
      process.env.CORREO_ARGENTINO_API_URL || "(no definida)",
    CORREO_ARGENTINO_USERNAME: process.env.CORREO_ARGENTINO_USERNAME
      ? `${process.env.CORREO_ARGENTINO_USERNAME.substring(0, 3)}***`
      : "(no definida)",
    CORREO_ARGENTINO_PASSWORD: process.env.CORREO_ARGENTINO_PASSWORD
      ? "****"
      : "(no definida)",
    CORREO_ARGENTINO_CUSTOMER_ID:
      process.env.CORREO_ARGENTINO_CUSTOMER_ID || "(no definida)",
  };

  results.push({
    step: "1. Variables de entorno",
    success: !!(
      process.env.CORREO_ARGENTINO_API_URL &&
      process.env.CORREO_ARGENTINO_USERNAME &&
      process.env.CORREO_ARGENTINO_PASSWORD
    ),
    data: envCheck,
  });

  // Paso 2: Probar autenticación
  const authStart = Date.now();
  try {
    // 2. Probar autenticación
    const authResult = await correoArgentinoService.authenticate({
      username: process.env.CORREO_ARGENTINO_USERNAME || "",
      password: process.env.CORREO_ARGENTINO_PASSWORD || "",
    });

    if (!authResult.success || !authResult.data) {
      throw new Error(authResult.error?.message || "Auth failed");
    }

    results.push({
      step: "2. Autenticación API",
      success: true,
      data: { tokenPrefix: authResult.data.substring(0, 20) + "..." },
      duration: Date.now() - authStart,
    });

    // Paso 3: Probar cotización (solo si la autenticación fue exitosa)
    if (authResult.success) {
      const ratesStart = Date.now();
      try {
        const customerId =
          correoArgentinoService.getCustomerId() ||
          process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
          "";

        // Probar con los códigos postales EXACTOS de la documentación oficial
        // La documentación usa 1757 (origen) y 1704 (destino)
        const testCases = [
          {
            origin: "1757",
            dest: "1704",
            deliveredType: undefined,
            desc: "Doc oficial (ambas cotizaciones)",
          },
          {
            origin: "1757",
            dest: "1704",
            deliveredType: "D" as const,
            desc: "Doc oficial (domicilio)",
          },
          {
            origin: "1757",
            dest: "1704",
            deliveredType: "S" as const,
            desc: "Doc oficial (sucursal)",
          },
          {
            origin: "1611",
            dest: "1001",
            deliveredType: undefined,
            desc: "Don Torcuato → CABA (ambas)",
          },
        ];

        for (const testCase of testCases) {
          const caseStart = Date.now();
          const ratesResult = await correoArgentinoService.getRates({
            customerId: "0000000000", // Dummy
            postalCodeOrigin: "1000",
            postalCodeDestination: "2000",
            deliveredType: testCase.deliveredType,
            dimensions: {
              weight: 1000,
              height: 10,
              width: 10,
              length: 10,
            },
          });

          results.push({
            step: `3. Cotización ${testCase.desc}`,
            success:
              ratesResult.success && (ratesResult.data?.rates?.length ?? 0) > 0,
            data: {
              request: {
                customerId,
                origin: testCase.origin,
                dest: testCase.dest,
                deliveredType: testCase.deliveredType || "(ambas)",
              },
              response: {
                customerId: ratesResult.data?.customerId,
                validTo: ratesResult.data?.validTo,
                ratesCount: ratesResult.data?.rates?.length,
                rates: ratesResult.data?.rates?.map((r) => ({
                  deliveredType: r.deliveredType,
                  productType: r.productType,
                  productName: r.productName,
                  price: r.price,
                  deliveryTime: `${r.deliveryTimeMin}-${r.deliveryTimeMax} días`,
                })),
              },
              rawError: ratesResult.error,
            },
            error: ratesResult.error?.message,
            duration: Date.now() - caseStart,
          });
        }
      } catch (ratesError) {
        results.push({
          step: "3. Cotización de prueba",
          success: false,
          error:
            ratesError instanceof Error
              ? ratesError.message
              : String(ratesError),
          duration: Date.now() - ratesStart,
        });
      }
    }
  } catch (authError) {
    results.push({
      step: "2. Autenticación API",
      success: false,
      error: authError instanceof Error ? authError.message : String(authError),
      duration: Date.now() - authStart,
    });
  }

  // Resumen
  const allSuccessful = results.every((r) => r.success);

  return NextResponse.json({
    success: allSuccessful,
    timestamp: new Date().toISOString(),
    summary: allSuccessful
      ? "✅ Todas las credenciales y la API funcionan correctamente"
      : "❌ Algunos pasos fallaron - revisar detalles",
    results,
  });
}
