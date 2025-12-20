/**
 * Library Tests: Input Sanitization
 * 
 * Tests for XSS prevention, HTML sanitization, and input cleaning.
 */

import { describe, it, expect } from "vitest";

describe("Input Sanitization Tests", () => {
    describe("XSS Prevention", () => {
        const sanitizeHtml = (input: string): string => {
            return input
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;")
                .replace(/\//g, "&#x2F;");
        };

        it("should escape < and > characters", () => {
            const input = "<script>alert('xss')</script>";
            const result = sanitizeHtml(input);
            expect(result).not.toContain("<script>");
            expect(result).toContain("&lt;script&gt;");
        });

        it("should escape double quotes", () => {
            const input = 'onclick="alert(1)"';
            const result = sanitizeHtml(input);
            expect(result).toContain("&quot;");
        });

        it("should escape single quotes", () => {
            const input = "onclick='alert(1)'";
            const result = sanitizeHtml(input);
            expect(result).toContain("&#x27;");
        });

        it("should escape ampersands", () => {
            const input = "foo & bar";
            const result = sanitizeHtml(input);
            expect(result).toBe("foo &amp; bar");
        });

        it("should escape forward slashes", () => {
            const input = "</div>";
            const result = sanitizeHtml(input);
            expect(result).toContain("&#x2F;");
        });

        it("should handle multiple dangerous patterns", () => {
            const input = '<img src="x" onerror="alert(1)">';
            const result = sanitizeHtml(input);
            expect(result).not.toContain("<img");
            expect(result).not.toContain("onerror");
        });
    });

    describe("SQL Injection Prevention", () => {
        const escapeSqlLike = (input: string): string => {
            return input
                .replace(/\\/g, "\\\\")
                .replace(/%/g, "\\%")
                .replace(/_/g, "\\_");
        };

        const isSafeSqlInput = (input: string): boolean => {
            const dangerousPatterns = [
                /;\s*DROP/i,
                /;\s*DELETE/i,
                /;\s*UPDATE/i,
                /;\s*INSERT/i,
                /--/,
                /\/\*/,
                /UNION\s+SELECT/i,
            ];
            return !dangerousPatterns.some((p) => p.test(input));
        };

        it("should escape LIKE wildcards", () => {
            expect(escapeSqlLike("100% success")).toBe("100\\% success");
            expect(escapeSqlLike("user_name")).toBe("user\\_name");
        });

        it("should detect DROP injection", () => {
            expect(isSafeSqlInput("'; DROP TABLE users;--")).toBe(false);
        });

        it("should detect UNION SELECT injection", () => {
            expect(isSafeSqlInput("1 UNION SELECT * FROM users")).toBe(false);
        });

        it("should detect comment injection", () => {
            expect(isSafeSqlInput("admin'--")).toBe(false);
            expect(isSafeSqlInput("/* comment */")).toBe(false);
        });

        it("should allow safe inputs", () => {
            expect(isSafeSqlInput("John Doe")).toBe(true);
            expect(isSafeSqlInput("user@example.com")).toBe(true);
            expect(isSafeSqlInput("Calle 123")).toBe(true);
        });
    });

    describe("Path Traversal Prevention", () => {
        const sanitizePath = (path: string): string => {
            // Remove any path traversal attempts
            return path
                .replace(/\.\.\//g, "")
                .replace(/\.\./g, "")
                .replace(/^\/+/, "");
        };

        const isValidFilename = (filename: string): boolean => {
            // Only allow alphanumeric, dash, underscore, and single dot for extension
            const validPattern = /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/;
            return validPattern.test(filename) && !filename.includes("..");
        };

        it("should remove parent directory traversal", () => {
            expect(sanitizePath("../../../etc/passwd")).toBe("etc/passwd");
        });

        it("should remove double dots", () => {
            expect(sanitizePath("..secret.txt")).toBe("secret.txt");
        });

        it("should remove leading slashes", () => {
            expect(sanitizePath("/etc/passwd")).toBe("etc/passwd");
        });

        it("should validate safe filenames", () => {
            expect(isValidFilename("image.jpg")).toBe(true);
            expect(isValidFilename("document_v2.pdf")).toBe(true);
            expect(isValidFilename("file-name.png")).toBe(true);
        });

        it("should reject dangerous filenames", () => {
            expect(isValidFilename("../etc/passwd")).toBe(false);
            expect(isValidFilename("file..txt")).toBe(false);
            expect(isValidFilename("file name.txt")).toBe(false);
        });
    });

    describe("Email Sanitization", () => {
        const sanitizeEmail = (email: string): string => {
            return email.trim().toLowerCase();
        };

        const isValidEmail = (email: string): boolean => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(email);
        };

        it("should trim whitespace", () => {
            expect(sanitizeEmail("  test@example.com  ")).toBe("test@example.com");
        });

        it("should lowercase email", () => {
            expect(sanitizeEmail("TEST@EXAMPLE.COM")).toBe("test@example.com");
        });

        it("should validate correct emails", () => {
            expect(isValidEmail("user@example.com")).toBe(true);
            expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
        });

        it("should reject invalid emails", () => {
            expect(isValidEmail("not-an-email")).toBe(false);
            expect(isValidEmail("user@")).toBe(false);
            expect(isValidEmail("@domain.com")).toBe(false);
            expect(isValidEmail("user @domain.com")).toBe(false);
        });
    });

    describe("Phone Number Sanitization", () => {
        const sanitizePhone = (phone: string): string => {
            return phone.replace(/\D/g, "");
        };

        const isValidArgentinePhone = (phone: string): boolean => {
            const digits = phone.replace(/\D/g, "");
            // Argentine phone: 10-11 digits
            return digits.length >= 10 && digits.length <= 11;
        };

        it("should remove non-digit characters", () => {
            expect(sanitizePhone("+54 11 1234-5678")).toBe("541112345678");
            expect(sanitizePhone("(011) 4567-8901")).toBe("01145678901");
        });

        it("should validate Argentine phone numbers", () => {
            expect(isValidArgentinePhone("1123456789")).toBe(true);
            expect(isValidArgentinePhone("01123456789")).toBe(true);
        });

        it("should reject short phone numbers", () => {
            expect(isValidArgentinePhone("12345")).toBe(false);
        });

        it("should reject too long phone numbers", () => {
            expect(isValidArgentinePhone("123456789012345")).toBe(false);
        });
    });

    describe("Name Sanitization", () => {
        const sanitizeName = (name: string): string => {
            return name
                .trim()
                .replace(/\s+/g, " ") // Collapse multiple spaces
                .replace(/[<>\"\'&]/g, ""); // Remove dangerous characters
        };

        it("should trim whitespace", () => {
            expect(sanitizeName("  Juan  ")).toBe("Juan");
        });

        it("should collapse multiple spaces", () => {
            expect(sanitizeName("Juan    Pérez")).toBe("Juan Pérez");
        });

        it("should remove dangerous characters", () => {
            expect(sanitizeName("Juan<script>")).toBe("Juanscript");
            expect(sanitizeName("O'Connor")).toBe("OConnor");
        });

        it("should preserve accented characters", () => {
            expect(sanitizeName("José María")).toBe("José María");
        });
    });

    describe("Postal Code Validation", () => {
        const isValidArgentinePostalCode = (code: string): boolean => {
            // Argentine postal codes: 4 digits
            return /^\d{4}$/.test(code);
        };

        it("should accept valid 4-digit codes", () => {
            expect(isValidArgentinePostalCode("1234")).toBe(true);
            expect(isValidArgentinePostalCode("0001")).toBe(true);
        });

        it("should reject non-numeric codes", () => {
            expect(isValidArgentinePostalCode("ABCD")).toBe(false);
            expect(isValidArgentinePostalCode("12AB")).toBe(false);
        });

        it("should reject wrong length codes", () => {
            expect(isValidArgentinePostalCode("123")).toBe(false);
            expect(isValidArgentinePostalCode("12345")).toBe(false);
        });
    });
});

describe("URL Parameter Sanitization", () => {
    describe("Query Parameter Encoding", () => {
        const encodeQueryParam = (value: string): string => {
            return encodeURIComponent(value);
        };

        it("should encode special characters", () => {
            expect(encodeQueryParam("hello world")).toBe("hello%20world");
            expect(encodeQueryParam("a=b&c=d")).toBe("a%3Db%26c%3Dd");
        });

        it("should encode unicode characters", () => {
            const result = encodeQueryParam("café");
            expect(result).toBe("caf%C3%A9");
        });
    });

    describe("Redirect URL Validation", () => {
        const isValidRedirectUrl = (url: string, allowedDomains: string[]): boolean => {
            try {
                const parsed = new URL(url);
                return allowedDomains.includes(parsed.hostname);
            } catch {
                // Relative URLs are allowed
                return url.startsWith("/") && !url.startsWith("//");
            }
        };

        it("should allow relative URLs", () => {
            expect(isValidRedirectUrl("/checkout", ["example.com"])).toBe(true);
            expect(isValidRedirectUrl("/admin/dashboard", ["example.com"])).toBe(true);
        });

        it("should allow whitelisted domains", () => {
            expect(isValidRedirectUrl("https://example.com/page", ["example.com"])).toBe(true);
        });

        it("should reject non-whitelisted domains", () => {
            expect(isValidRedirectUrl("https://evil.com/phish", ["example.com"])).toBe(false);
        });

        it("should reject protocol-relative URLs", () => {
            expect(isValidRedirectUrl("//evil.com/phish", ["example.com"])).toBe(false);
        });
    });
});
