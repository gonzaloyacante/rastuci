import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export function ok<T>(data: T, message?: string, init?: ResponseInit) {
  return NextResponse.json({ success: true, data, message }, init);
}

export function fail(code: ApiErrorCode, message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, code, error: message, ...(extra ?? {}) }, { status });
}
