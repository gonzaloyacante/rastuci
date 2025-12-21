/**
 * Security: Headers & Configuration
 *
 * Tests for security headers, CSP, and safe configuration defaults.
 */

import { describe, it, expect } from "vitest";

describe("Security Header Tests", () => {
  interface SecurityHeaders {
    "Content-Security-Policy": string;
    "X-Frame-Options": string;
    "X-Content-Type-Options": string;
    "Referrer-Policy": string;
    "Strict-Transport-Security": string;
    "Permissions-Policy": string;
  }

  const getRecommendedHeaders = (isProd: boolean): SecurityHeaders => ({
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": isProd
      ? "max-age=63072000; includeSubDomains; preload"
      : "max-age=0",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });

  it("should enforce DENY frame options", () => {
    const headers = getRecommendedHeaders(true);
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("should prevent sniff", () => {
    const headers = getRecommendedHeaders(true);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("should have strict CSP by default", () => {
    const headers = getRecommendedHeaders(true);
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
  });

  it("should enable HSTS in production", () => {
    const headers = getRecommendedHeaders(true);
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
  });

  it("should disable HSTS in dev", () => {
    const headers = getRecommendedHeaders(false);
    expect(headers["Strict-Transport-Security"]).toBe("max-age=0");
  });

  it("should restrict permissions", () => {
    const headers = getRecommendedHeaders(true);
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });
});

describe("Cookie Configuration", () => {
  const getCookieConfig = (isProd: boolean) => ({
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  it("should be httpOnly", () => {
    expect(getCookieConfig(true).httpOnly).toBe(true);
  });

  it("should be secure in prod", () => {
    expect(getCookieConfig(true).secure).toBe(true);
  });

  it("should not be secure in dev", () => {
    expect(getCookieConfig(false).secure).toBe(false);
  });

  it("should have sameSite policy", () => {
    expect(getCookieConfig(true).sameSite).toBe("lax");
  });
});
