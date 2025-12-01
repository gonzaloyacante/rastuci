import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * GET /api/shipping/diagnose
 *
 * Endpoint de diagnóstico completo para Correo Argentino API
 * - Valida credenciales y obtiene el customerId real
 * - Prueba todos los endpoints de la API
 * - Detecta problemas de configuración
 *
 * SOLO PARA DESARROLLO
 */

interface DiagnosticResult {
  step: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
  recommendation?: string;
}

// Helper para hacer requests a la API de CA
async function makeCARequest<T>(
  baseUrl: string,
  endpoint: string,
  method: "GET" | "POST",
  token: string | null,
  body?: unknown
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
      success: response.ok,
      data,
      status: response.status,
      error: !response.ok
        ? data.message || `HTTP ${response.status}`
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Solo disponible en desarrollo" },
      { status: 403 }
    );
  }

  const results: DiagnosticResult[] = [];
  const baseUrl =
    process.env.CORREO_ARGENTINO_API_URL ||
    "https://apitest.correoargentino.com.ar/micorreo/v1";
  const username = process.env.CORREO_ARGENTINO_USERNAME || "";
  const password = process.env.CORREO_ARGENTINO_PASSWORD || "";
  const configuredCustomerId = process.env.CORREO_ARGENTINO_CUSTOMER_ID || "";

  let authToken: string | null = null;
  let realCustomerId: string | null = null;

  // =========================================================================
  // PASO 1: Verificar variables de entorno
  // =========================================================================
  results.push({
    step: "1️⃣ Variables de entorno",
    success: !!(baseUrl && username && password),
    data: {
      CORREO_ARGENTINO_API_URL: baseUrl,
      CORREO_ARGENTINO_USERNAME: username
        ? `${username.substring(0, 3)}***`
        : "(vacío)",
      CORREO_ARGENTINO_PASSWORD: password ? "****" : "(vacío)",
      CORREO_ARGENTINO_CUSTOMER_ID: configuredCustomerId || "(vacío)",
    },
    recommendation:
      !username || !password
        ? "Configurar CORREO_ARGENTINO_USERNAME y CORREO_ARGENTINO_PASSWORD en .env"
        : undefined,
  });

  // =========================================================================
  // PASO 2: Autenticación - Obtener JWT Token
  // =========================================================================
  const authStart = Date.now();
  try {
    const auth = btoa(`${username}:${password}`);
    const authResponse = await fetch(`${baseUrl}/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const authData = await authResponse.json();

    if (authResponse.ok && authData.token) {
      authToken = authData.token;
      results.push({
        step: "2️⃣ Autenticación (POST /token)",
        success: true,
        data: {
          tokenPrefix: authData.token.substring(0, 30) + "...",
          expires: authData.expires,
        },
        duration: Date.now() - authStart,
      });
    } else {
      results.push({
        step: "2️⃣ Autenticación (POST /token)",
        success: false,
        error: authData.message || `HTTP ${authResponse.status}`,
        duration: Date.now() - authStart,
        recommendation: "Verificar usuario y contraseña con Correo Argentino",
      });
    }
  } catch (error) {
    results.push({
      step: "2️⃣ Autenticación (POST /token)",
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - authStart,
      recommendation: "Verificar conectividad con la API de CA",
    });
  }

  // Si no hay token, no continuar
  if (!authToken) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      summary: "❌ Fallo en autenticación - No se puede continuar",
      results,
    });
  }

  // =========================================================================
  // PASO 3: Validar usuario y obtener customerId REAL
  // =========================================================================
  const validateStart = Date.now();
  const validateResult = await makeCARequest<{
    customerId: string;
    createdAt: string;
  }>(baseUrl, "/users/validate", "POST", authToken, {
    email: username,
    password: password,
  });

  if (validateResult.success && validateResult.data?.customerId) {
    realCustomerId = validateResult.data.customerId;
    results.push({
      step: "3️⃣ Validar usuario (POST /users/validate)",
      success: true,
      data: {
        customerId: realCustomerId,
        createdAt: validateResult.data.createdAt,
        isConfigured: configuredCustomerId === realCustomerId,
        configuredId: configuredCustomerId,
      },
      duration: Date.now() - validateStart,
      recommendation:
        configuredCustomerId !== realCustomerId
          ? `⚠️ ACTUALIZAR .env: CORREO_ARGENTINO_CUSTOMER_ID="${realCustomerId}"`
          : undefined,
    });
  } else {
    // Si /users/validate falla, puede que el usuario no esté registrado en MiCorreo
    // Probar con el ID configurado
    results.push({
      step: "3️⃣ Validar usuario (POST /users/validate)",
      success: false,
      data: {
        response: validateResult.data,
        status: validateResult.status,
      },
      error: validateResult.error,
      duration: Date.now() - validateStart,
      recommendation:
        "El usuario puede no estar registrado en MiCorreo. Usar /register para crear cuenta o contactar a CA.",
    });

    // Usar el ID configurado como fallback
    realCustomerId = configuredCustomerId;
  }

  // =========================================================================
  // PASO 4: Obtener agencias de Buenos Aires (prueba de lectura)
  // =========================================================================
  if (realCustomerId) {
    const agenciesStart = Date.now();
    const agenciesResult = await makeCARequest<unknown[]>(
      baseUrl,
      `/agencies?customerId=${realCustomerId}&provinceCode=B`,
      "GET",
      authToken
    );

    results.push({
      step: "4️⃣ Obtener agencias (GET /agencies?provinceCode=B)",
      success: agenciesResult.success && Array.isArray(agenciesResult.data),
      data: {
        customerId: realCustomerId,
        provinceCode: "B",
        agenciesCount: Array.isArray(agenciesResult.data)
          ? agenciesResult.data.length
          : 0,
        firstAgencies: Array.isArray(agenciesResult.data)
          ? (agenciesResult.data as Record<string, unknown>[])
              .slice(0, 3)
              .map((a) => ({
                code: a.code,
                name: a.name,
                status: a.status,
              }))
          : null,
        rawError: agenciesResult.error,
      },
      duration: Date.now() - agenciesStart,
      recommendation: !agenciesResult.success
        ? "El customerId puede no tener permisos para obtener agencias"
        : undefined,
    });
  }

  // =========================================================================
  // PASO 5: Probar cotización con diferentes customerIds
  // =========================================================================
  const testCustomerIds = [
    realCustomerId,
    configuredCustomerId,
    "0000550137", // ID de ejemplo en la documentación
    "0000550997", // Otro ID de ejemplo
  ].filter((id, index, arr) => id && arr.indexOf(id) === index); // Eliminar duplicados y vacíos

  for (const testId of testCustomerIds) {
    const ratesStart = Date.now();
    const ratesResult = await makeCARequest<{
      customerId: string;
      validTo: string;
      rates: unknown[];
    }>(baseUrl, "/rates", "POST", authToken, {
      customerId: testId,
      postalCodeOrigin: "1757",
      postalCodeDestination: "1704",
      dimensions: {
        weight: 2500,
        height: 10,
        width: 20,
        length: 30,
      },
    });

    const hasRates = Boolean(
      ratesResult.success &&
        ratesResult.data?.rates &&
        Array.isArray(ratesResult.data.rates) &&
        ratesResult.data.rates.length > 0
    );

    results.push({
      step: `5️⃣ Cotización con customerId="${testId}"`,
      success: hasRates,
      data: {
        customerId: testId,
        request: {
          origin: "1757",
          destination: "1704",
          weight: "2500g",
          dimensions: "10x20x30 cm",
        },
        response: {
          validTo: ratesResult.data?.validTo,
          ratesCount: ratesResult.data?.rates?.length ?? 0,
          rates: ratesResult.data?.rates,
        },
        rawError: ratesResult.error,
        status: ratesResult.status,
      },
      duration: Date.now() - ratesStart,
      recommendation: hasRates
        ? `✅ USAR ESTE ID: CORREO_ARGENTINO_CUSTOMER_ID="${testId}"`
        : undefined,
    });

    // Si encontramos uno que funciona, destacarlo
    if (hasRates && testId !== configuredCustomerId) {
      logger.warn(`[CA Diagnose] Found working customerId: ${testId}`);
    }
  }

  // =========================================================================
  // RESUMEN Y RECOMENDACIONES
  // =========================================================================
  const successfulRates = results.filter(
    (r) => r.step.startsWith("5️⃣") && r.success
  );

  const recommendations: string[] = [];

  if (successfulRates.length > 0) {
    const workingId = (successfulRates[0].data as Record<string, unknown>)
      ?.customerId;
    if (workingId && workingId !== configuredCustomerId) {
      recommendations.push(
        `📝 Actualizar CORREO_ARGENTINO_CUSTOMER_ID="${workingId}" en .env`
      );
    }
  } else {
    recommendations.push("❌ Ningún customerId devolvió cotizaciones");
    recommendations.push(
      "📞 Contactar a Correo Argentino para verificar el estado de la cuenta"
    );
    recommendations.push(
      "🔍 Verificar que la cuenta MiCorreo tenga el servicio de cotización habilitado"
    );
  }

  if (realCustomerId && realCustomerId !== configuredCustomerId) {
    recommendations.push(
      `🔄 El customerId real del usuario es: ${realCustomerId}`
    );
  }

  return NextResponse.json({
    success: successfulRates.length > 0,
    timestamp: new Date().toISOString(),
    summary:
      successfulRates.length > 0
        ? `✅ Encontrado ${successfulRates.length} customerId(s) funcional(es)`
        : "❌ No se encontraron customerIds funcionales para cotización",
    recommendations,
    envSuggestions: {
      CORREO_ARGENTINO_API_URL: baseUrl,
      CORREO_ARGENTINO_USERNAME: username,
      CORREO_ARGENTINO_CUSTOMER_ID:
        successfulRates.length > 0
          ? (successfulRates[0].data as Record<string, unknown>)?.customerId
          : realCustomerId || configuredCustomerId,
    },
    results,
  });
}
