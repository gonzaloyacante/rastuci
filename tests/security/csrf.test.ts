/**
 * Security Tests: CSRF Protection
 * 
 * Tests for CSRF token validation and double-submit cookie pattern.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

describe("CSRF Protection Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Token Generation", () => {
        const generateCsrfToken = (): string => {
            return crypto.randomBytes(32).toString("hex");
        };

        it("should generate 64-character hex token", () => {
            const token = generateCsrfToken();
            expect(token).toHaveLength(64);
            expect(token).toMatch(/^[0-9a-f]+$/);
        });

        it("should generate unique tokens", () => {
            const tokens = new Set<string>();
            for (let i = 0; i < 100; i++) {
                tokens.add(generateCsrfToken());
            }
            expect(tokens.size).toBe(100);
        });
    });

    describe("Token Validation", () => {
        const validateCsrfToken = (
            headerToken: string | null | undefined,
            cookieToken: string | null | undefined
        ): boolean => {
            if (!headerToken || !cookieToken) {
                return false;
            }
            if (headerToken.length !== 64 || cookieToken.length !== 64) {
                return false;
            }
            return crypto.timingSafeEqual(
                Buffer.from(headerToken),
                Buffer.from(cookieToken)
            );
        };

        it("should accept matching tokens", () => {
            const token = "a".repeat(64);
            expect(validateCsrfToken(token, token)).toBe(true);
        });

        it("should reject mismatched tokens", () => {
            const headerToken = "a".repeat(64);
            const cookieToken = "b".repeat(64);
            expect(validateCsrfToken(headerToken, cookieToken)).toBe(false);
        });

        it("should reject null header token", () => {
            const cookieToken = "a".repeat(64);
            expect(validateCsrfToken(null, cookieToken)).toBe(false);
        });

        it("should reject null cookie token", () => {
            const headerToken = "a".repeat(64);
            expect(validateCsrfToken(headerToken, null)).toBe(false);
        });

        it("should reject empty tokens", () => {
            expect(validateCsrfToken("", "")).toBe(false);
        });

        it("should reject wrong length tokens", () => {
            expect(validateCsrfToken("short", "short")).toBe(false);
        });
    });

    describe("Double Submit Cookie Pattern", () => {
        interface RequestWithCsrf {
            headers: Record<string, string>;
            cookies: Record<string, string>;
        }

        const validateDoubleSubmit = (request: RequestWithCsrf): boolean => {
            const headerToken = request.headers["x-csrf-token"];
            const cookieToken = request.cookies["csrf-token"];

            if (!headerToken || !cookieToken) {
                return false;
            }

            return headerToken === cookieToken;
        };

        it("should validate matching header and cookie", () => {
            const token = crypto.randomBytes(32).toString("hex");
            const request: RequestWithCsrf = {
                headers: { "x-csrf-token": token },
                cookies: { "csrf-token": token },
            };
            expect(validateDoubleSubmit(request)).toBe(true);
        });

        it("should reject missing header", () => {
            const token = crypto.randomBytes(32).toString("hex");
            const request: RequestWithCsrf = {
                headers: {},
                cookies: { "csrf-token": token },
            };
            expect(validateDoubleSubmit(request)).toBe(false);
        });

        it("should reject missing cookie", () => {
            const token = crypto.randomBytes(32).toString("hex");
            const request: RequestWithCsrf = {
                headers: { "x-csrf-token": token },
                cookies: {},
            };
            expect(validateDoubleSubmit(request)).toBe(false);
        });

        it("should reject tampered token", () => {
            const request: RequestWithCsrf = {
                headers: { "x-csrf-token": "attacker-token" },
                cookies: { "csrf-token": "original-token" },
            };
            expect(validateDoubleSubmit(request)).toBe(false);
        });
    });

    describe("SameSite Cookie Attributes", () => {
        interface CookieOptions {
            httpOnly: boolean;
            secure: boolean;
            sameSite: "strict" | "lax" | "none";
            maxAge: number;
            path: string;
        }

        const getCsrfCookieOptions = (isProduction: boolean): CookieOptions => ({
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        it("should set httpOnly to true", () => {
            const options = getCsrfCookieOptions(true);
            expect(options.httpOnly).toBe(true);
        });

        it("should set secure in production", () => {
            const prodOptions = getCsrfCookieOptions(true);
            const devOptions = getCsrfCookieOptions(false);
            expect(prodOptions.secure).toBe(true);
            expect(devOptions.secure).toBe(false);
        });

        it("should set sameSite to strict", () => {
            const options = getCsrfCookieOptions(true);
            expect(options.sameSite).toBe("strict");
        });

        it("should set reasonable maxAge", () => {
            const options = getCsrfCookieOptions(true);
            expect(options.maxAge).toBe(86400); // 24 hours in seconds
        });
    });
});

describe("Origin Validation", () => {
    describe("Allowed Origins Check", () => {
        const allowedOrigins = [
            "https://rastuci.com",
            "https://www.rastuci.com",
            "https://admin.rastuci.com",
        ];

        const isAllowedOrigin = (origin: string | undefined): boolean => {
            if (!origin) return false;
            return allowedOrigins.includes(origin);
        };

        it("should allow whitelisted origins", () => {
            expect(isAllowedOrigin("https://rastuci.com")).toBe(true);
            expect(isAllowedOrigin("https://www.rastuci.com")).toBe(true);
        });

        it("should reject non-whitelisted origins", () => {
            expect(isAllowedOrigin("https://evil.com")).toBe(false);
            expect(isAllowedOrigin("https://rastuci.com.evil.com")).toBe(false);
        });

        it("should reject undefined origin", () => {
            expect(isAllowedOrigin(undefined)).toBe(false);
        });

        it("should reject HTTP origins (non-secure)", () => {
            expect(isAllowedOrigin("http://rastuci.com")).toBe(false);
        });
    });

    describe("Referer Validation", () => {
        const isValidReferer = (referer: string | undefined, host: string): boolean => {
            if (!referer) return true; // Some browsers don't send referer
            try {
                const refererUrl = new URL(referer);
                return refererUrl.host === host || refererUrl.host.endsWith(`.${host}`);
            } catch {
                return false;
            }
        };

        it("should allow matching host", () => {
            expect(isValidReferer("https://rastuci.com/checkout", "rastuci.com")).toBe(true);
        });

        it("should allow subdomains", () => {
            expect(isValidReferer("https://admin.rastuci.com/page", "rastuci.com")).toBe(true);
        });

        it("should reject different hosts", () => {
            expect(isValidReferer("https://evil.com/page", "rastuci.com")).toBe(false);
        });

        it("should allow missing referer", () => {
            expect(isValidReferer(undefined, "rastuci.com")).toBe(true);
        });
    });
});

describe("State-Changing Request Protection", () => {
    describe("Safe Methods Check", () => {
        const safeMethods = ["GET", "HEAD", "OPTIONS"];

        const isStateful = (method: string): boolean => {
            return !safeMethods.includes(method.toUpperCase());
        };

        it("should identify GET as safe", () => {
            expect(isStateful("GET")).toBe(false);
        });

        it("should identify HEAD as safe", () => {
            expect(isStateful("HEAD")).toBe(false);
        });

        it("should identify OPTIONS as safe", () => {
            expect(isStateful("OPTIONS")).toBe(false);
        });

        it("should identify POST as stateful", () => {
            expect(isStateful("POST")).toBe(true);
        });

        it("should identify PUT as stateful", () => {
            expect(isStateful("PUT")).toBe(true);
        });

        it("should identify DELETE as stateful", () => {
            expect(isStateful("DELETE")).toBe(true);
        });

        it("should identify PATCH as stateful", () => {
            expect(isStateful("PATCH")).toBe(true);
        });
    });
});
