import { NextResponse } from "next/server";
import { logApiCall } from "./api-logger";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export function ok<T>(data: T, message?: string, init?: ResponseInit) {
  // Log successful response
  try {
    logApiCall({
      method: "RESPONSE", // No tenemos el método original aquí fácilmente
      url: "API Response", // No tenemos la URL original aquí fácilmente
      status: init?.status || 200,
      statusText: init?.statusText || "OK",
      timestamp: new Date(),
      responseBody: { success: true, data, message },
    });
  } catch {
    // Ignore logging errors
  }
  return NextResponse.json({ success: true, data, message }, init);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  // Log error response
  try {
    logApiCall({
      method: "RESPONSE",
      url: "API Error",
      status: status,
      statusText: code,
      timestamp: new Date(),
      error: message,
      responseBody: { success: false, code, error: message, ...extra },
    });
  } catch {
    // Ignore logging errors
  }
  return NextResponse.json(
    { success: false, code, error: message, ...(extra ?? {}) },
    { status }
  );
}
