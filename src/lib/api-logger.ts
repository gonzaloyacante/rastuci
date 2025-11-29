/**
 * API Logger - Sistema centralizado de logging para todas las llamadas API
 * Muestra en consola de forma linda y descriptiva todas las requests/responses
 */

import { logger } from "./logger";

// Colores ANSI para la terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Colores de texto
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Colores de fondo
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

interface ApiLogEntry {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
  headers?: Record<string, string>;
  timestamp: Date;
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.cyan;
  if (status >= 400 && status < 500) return colors.yellow;
  if (status >= 500) return colors.red;
  return colors.white;
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return colors.blue;
    case "POST":
      return colors.green;
    case "PUT":
    case "PATCH":
      return colors.yellow;
    case "DELETE":
      return colors.red;
    default:
      return colors.white;
  }
}

function formatDuration(ms: number): string {
  if (ms < 100) return `${colors.green}${ms.toFixed(0)}ms${colors.reset}`;
  if (ms < 500) return `${colors.yellow}${ms.toFixed(0)}ms${colors.reset}`;
  return `${colors.red}${ms.toFixed(0)}ms${colors.reset}`;
}

export function logApiCall(entry: ApiLogEntry) {
  const timeStr = entry.timestamp.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const ms = entry.timestamp.getMilliseconds().toString().padStart(3, "0");
  const timestamp = `${timeStr}.${ms}`;

  const methodColor = getMethodColor(entry.method);
  const statusColor = entry.status
    ? getStatusColor(entry.status)
    : colors.white;

  console.log("\n" + "━".repeat(50));
  console.log(
    `${colors.bright}${colors.cyan}🌐 API CALL${colors.reset} ${colors.dim}[${timestamp}]${colors.reset}`
  );
  console.log("━".repeat(50));

  // 1. Method & URL
  console.log(
    `${colors.dim}► METHOD:${colors.reset} ${methodColor}${colors.bright}${entry.method.toUpperCase()}${colors.reset}`
  );
  console.log(
    `${colors.dim}► URL:${colors.reset}    ${colors.white}${entry.url}${colors.reset}`
  );

  // 2. Status
  if (entry.status) {
    console.log(
      `${colors.dim}► STATUS:${colors.reset} ${statusColor}${colors.bright}${entry.status} ${entry.statusText || ""}${colors.reset}`
    );
  }

  // 3. Duration
  if (entry.duration !== undefined) {
    console.log(
      `${colors.dim}► TIME:${colors.reset}   ${formatDuration(entry.duration)}`
    );
  }

  // 4. Headers
  if (entry.headers) {
    const importantHeaders = ["content-type", "authorization", "x-request-id"];
    const headersToPrint = Object.entries(entry.headers).filter(([key]) =>
      importantHeaders.includes(key.toLowerCase())
    );

    if (headersToPrint.length > 0) {
      console.log(`${colors.dim}► HEADERS:${colors.reset}`);
      headersToPrint.forEach(([key, value]) => {
        const displayValue =
          key.toLowerCase() === "authorization"
            ? value.substring(0, 20) + "..."
            : value;
        console.log(
          `   - ${colors.cyan}${key}:${colors.reset} ${displayValue}`
        );
      });
    }
  }

  // 5. Request Body (FULL)
  if (entry.requestBody) {
    console.log(`${colors.dim}► REQUEST BODY:${colors.reset}`);
    try {
      console.log(JSON.stringify(entry.requestBody, null, 2));
    } catch {
      console.log(String(entry.requestBody));
    }
  }

  // 6. Response Body (FULL)
  if (entry.responseBody) {
    console.log(`${colors.dim}► RESPONSE BODY:${colors.reset}`);
    try {
      console.log(JSON.stringify(entry.responseBody, null, 2));
    } catch {
      console.log(String(entry.responseBody));
    }
  }

  // 7. Error
  if (entry.error) {
    console.log(
      `${colors.red}${colors.bright}► ERROR:${colors.reset} ${colors.red}${entry.error}${colors.reset}`
    );
  }

  console.log("━".repeat(50) + "\n");

  // También log estructurado para el logger
  logger.info("API Call", {
    method: entry.method,
    url: entry.url,
    status: entry.status,
    duration: entry.duration,
    hasError: !!entry.error,
  });
}

// Wrapper para fetch que automáticamente loggea
export async function loggedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  const method = init?.method || "GET";
  const url = typeof input === "string" ? input : input.toString();

  const entry: ApiLogEntry = {
    method,
    url,
    timestamp: new Date(),
    requestBody: init?.body,
  };

  try {
    const response = await fetch(input, init);
    const duration = performance.now() - startTime;

    entry.status = response.status;
    entry.statusText = response.statusText;
    entry.duration = duration;

    // Extraer headers importantes
    entry.headers = {
      "content-type": response.headers.get("content-type") || "",
      "x-request-id": response.headers.get("x-request-id") || "",
    };

    // Intentar parsear response body (solo si es JSON)
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const clonedResponse = response.clone();
      try {
        entry.responseBody = await clonedResponse.json();
      } catch {
        // No se pudo parsear como JSON
      }
    }

    logApiCall(entry);
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    entry.duration = duration;
    entry.error = error instanceof Error ? error.message : String(error);
    logApiCall(entry);
    throw error;
  }
}

// Helper para loggear llamadas desde route handlers
export function createApiLogger(requestId?: string) {
  return {
    logRequest: (method: string, url: string, body?: unknown) => {
      logApiCall({
        method,
        url,
        timestamp: new Date(),
        requestBody: body,
        headers: requestId ? { "x-request-id": requestId } : undefined,
      });
    },
    logResponse: (
      method: string,
      url: string,
      status: number,
      statusText: string,
      body?: unknown,
      duration?: number
    ) => {
      logApiCall({
        method,
        url,
        status,
        statusText,
        timestamp: new Date(),
        responseBody: body,
        duration,
        headers: requestId ? { "x-request-id": requestId } : undefined,
      });
    },
    logError: (
      method: string,
      url: string,
      error: string,
      duration?: number
    ) => {
      logApiCall({
        method,
        url,
        timestamp: new Date(),
        error,
        duration,
        headers: requestId ? { "x-request-id": requestId } : undefined,
      });
    },
  };
}
