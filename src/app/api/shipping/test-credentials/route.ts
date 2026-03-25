// import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { correoArgentinoService } from "@/lib/correo-argentino-service";

type StepResult = {
  step: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
};

function checkEnvStep(): StepResult {
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
  return {
    step: "1. Variables de entorno",
    success: !!(
      process.env.CORREO_ARGENTINO_API_URL &&
      process.env.CORREO_ARGENTINO_USERNAME &&
      process.env.CORREO_ARGENTINO_PASSWORD
    ),
    data: envCheck,
  };
}

const TEST_CASES = [
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

async function runRatesSteps(): Promise<StepResult[]> {
  const steps: StepResult[] = [];
  for (const tc of TEST_CASES) {
    const start = Date.now();
    const result = await correoArgentinoService.getRates({
      customerId: "0000000000",
      postalCodeOrigin: "1000",
      postalCodeDestination: "2000",
      deliveredType: tc.deliveredType,
      dimensions: { weight: 1000, height: 10, width: 10, length: 10 },
    });
    steps.push({
      step: `3. Cotización ${tc.desc}`,
      success: result.success && (result.data?.rates?.length ?? 0) > 0,
      data: {
        request: {
          origin: tc.origin,
          dest: tc.dest,
          deliveredType: tc.deliveredType || "(ambas)",
        },
        response: {
          validTo: result.data?.validTo,
          ratesCount: result.data?.rates?.length,
          rates: result.data?.rates?.map((r) => ({
            deliveredType: r.deliveredType,
            productType: r.productType,
            productName: r.productName,
            price: r.price,
            deliveryTime: `${r.deliveryTimeMin}-${r.deliveryTimeMax} días`,
          })),
        },
        rawError: result.error,
      },
      error: result.error?.message,
      duration: Date.now() - start,
    });
  }
  return steps;
}

async function runAllSteps(): Promise<StepResult[]> {
  const results: StepResult[] = [checkEnvStep()];
  const authStart = Date.now();
  try {
    const authResult = await correoArgentinoService.authenticate({
      username: process.env.CORREO_ARGENTINO_USERNAME || "",
      password: process.env.CORREO_ARGENTINO_PASSWORD || "",
    });
    if (!authResult.success || !authResult.data)
      throw new Error(authResult.error?.message || "Auth failed");
    results.push({
      step: "2. Autenticación API",
      success: true,
      data: { tokenPrefix: authResult.data.substring(0, 20) + "..." },
      duration: Date.now() - authStart,
    });
    try {
      const ratesSteps = await runRatesSteps();
      results.push(...ratesSteps);
    } catch (ratesError) {
      results.push({
        step: "3. Cotización de prueba",
        success: false,
        error:
          ratesError instanceof Error ? ratesError.message : String(ratesError),
      });
    }
  } catch (authError) {
    results.push({
      step: "2. Autenticación API",
      success: false,
      error: authError instanceof Error ? authError.message : String(authError),
      duration: Date.now() - authStart,
    });
  }
  return results;
}

/**
 * GET /api/shipping/test-credentials
 * SOLO PARA DESARROLLO - eliminar o proteger en producción
 */
export const GET = withAdminAuth(async (_req: NextRequest) => {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error: "Este endpoint solo está disponible en desarrollo",
      },
      { status: 403 }
    );
  }
  const results = await runAllSteps();
  const allSuccessful = results.every((r) => r.success);
  return NextResponse.json({
    success: allSuccessful,
    timestamp: new Date().toISOString(),
    summary: allSuccessful
      ? "✅ Todas las credenciales y la API funcionan correctamente"
      : "❌ Algunos pasos fallaron - revisar detalles",
    results,
  });
});
