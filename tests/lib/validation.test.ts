/**
 * Service Layer Tests: Validation Schemas
 * 
 * Tests for Zod validation schemas used across the application.
 * Ensures data integrity and security through input validation.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Product Validation Schema Tests", () => {
    const productSchema = z.object({
        name: z.string().min(1, "Name is required").max(200),
        description: z.string().optional(),
        price: z.number().positive("Price must be positive"),
        salePrice: z.number().positive().optional().nullable(),
        stock: z.number().int().min(0, "Stock cannot be negative"),
        categoryId: z.string().min(1, "Category is required"),
        images: z.array(z.string().url()).optional(),
        onSale: z.boolean().optional(),
        weight: z.number().positive().optional().nullable(),
        height: z.number().positive().optional().nullable(),
        width: z.number().positive().optional().nullable(),
        length: z.number().positive().optional().nullable(),
    });

    describe("Required Fields", () => {
        it("should require name", () => {
            const result = productSchema.safeParse({
                price: 100,
                stock: 10,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });

        it("should require price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                stock: 10,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });

        it("should require categoryId", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 10,
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Price Validation", () => {
        it("should reject negative price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: -100,
                stock: 10,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });

        it("should reject zero price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 0,
                stock: 10,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });

        it("should accept decimal price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 99.99,
                stock: 10,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(true);
        });
    });

    describe("Stock Validation", () => {
        it("should reject negative stock", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: -5,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });

        it("should accept zero stock", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 0,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(true);
        });

        it("should reject decimal stock", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 5.5,
                categoryId: "cat-1",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Image URL Validation", () => {
        it("should accept valid URLs", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 10,
                categoryId: "cat-1",
                images: ["https://example.com/image.jpg"],
            });
            expect(result.success).toBe(true);
        });

        it("should reject invalid URLs", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 10,
                categoryId: "cat-1",
                images: ["not-a-url"],
            });
            expect(result.success).toBe(false);
        });

        it("should accept empty images array", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 100,
                stock: 10,
                categoryId: "cat-1",
                images: [],
            });
            expect(result.success).toBe(true);
        });
    });
});

describe("Customer Validation Schema Tests", () => {
    const customerSchema = z.object({
        name: z.string().min(1, "Name is required").max(100),
        email: z.string().email("Invalid email"),
        phone: z.string().min(8, "Phone must be at least 8 characters"),
        address: z.string().min(1, "Address is required"),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().regex(/^\d{4}$/, "Postal code must be 4 digits").optional(),
        documentType: z.enum(["DNI", "CUIT", "CUIL"]).optional(),
        documentNumber: z.string().optional(),
    });

    describe("Email Validation", () => {
        it("should accept valid email", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@example.com",
                phone: "12345678",
                address: "Calle 123",
            });
            expect(result.success).toBe(true);
        });

        it("should reject invalid email", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "not-an-email",
                phone: "12345678",
                address: "Calle 123",
            });
            expect(result.success).toBe(false);
        });

        it("should reject email without domain", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@",
                phone: "12345678",
                address: "Calle 123",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Postal Code Validation", () => {
        it("should accept 4-digit postal code", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@test.com",
                phone: "12345678",
                address: "Calle 123",
                postalCode: "1234",
            });
            expect(result.success).toBe(true);
        });

        it("should reject non-numeric postal code", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@test.com",
                phone: "12345678",
                address: "Calle 123",
                postalCode: "ABCD",
            });
            expect(result.success).toBe(false);
        });

        it("should reject 5-digit postal code", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@test.com",
                phone: "12345678",
                address: "Calle 123",
                postalCode: "12345",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Phone Validation", () => {
        it("should accept phone with 8+ characters", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@test.com",
                phone: "12345678",
                address: "Calle 123",
            });
            expect(result.success).toBe(true);
        });

        it("should reject short phone", () => {
            const result = customerSchema.safeParse({
                name: "Juan",
                email: "juan@test.com",
                phone: "1234",
                address: "Calle 123",
            });
            expect(result.success).toBe(false);
        });
    });
});

describe("File Upload Validation Tests", () => {
    const allowedFormats = ["jpg", "jpeg", "png", "webp", "avif"];
    const blockedFormats = ["svg", "exe", "php", "js", "html"];

    const isAllowedFormat = (filename: string): boolean => {
        const ext = filename.split(".").pop()?.toLowerCase();
        return allowedFormats.includes(ext || "");
    };

    describe("Allowed Formats", () => {
        it.each(allowedFormats)(
            "should allow .%s files",
            (format) => {
                expect(isAllowedFormat(`image.${format}`)).toBe(true);
            }
        );
    });

    describe("Blocked Formats", () => {
        it.each(blockedFormats)(
            "should block .%s files",
            (format) => {
                expect(isAllowedFormat(`malicious.${format}`)).toBe(false);
            }
        );
    });

    describe("Edge Cases", () => {
        it("should handle files without extension", () => {
            expect(isAllowedFormat("noextension")).toBe(false);
        });

        it("should be case insensitive", () => {
            expect(isAllowedFormat("IMAGE.JPG")).toBe(true);
            expect(isAllowedFormat("image.PNG")).toBe(true);
        });

        it("should handle double extensions", () => {
            expect(isAllowedFormat("image.jpg.exe")).toBe(false);
        });
    });
});

describe("ReDoS Prevention Tests", () => {
    describe("Safe Regex Patterns", () => {
        // These patterns should not cause catastrophic backtracking
        const safePatterns = {
            postalCode: /^\d{4}$/,
            phone: /^[\d\s\-+()]+$/,
            slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        };

        it("should validate postal code quickly", () => {
            const start = performance.now();
            const match = safePatterns.postalCode.test("1234");
            const duration = performance.now() - start;

            expect(match).toBe(true);
            expect(duration).toBeLessThan(10); // Should be instant
        });

        it("should validate phone quickly", () => {
            const start = performance.now();
            const match = safePatterns.phone.test("+54 11 1234-5678");
            const duration = performance.now() - start;

            expect(match).toBe(true);
            expect(duration).toBeLessThan(10);
        });

        it("should not hang on long input", () => {
            const longInput = "a".repeat(10000);
            const start = performance.now();
            safePatterns.slug.test(longInput);
            const duration = performance.now() - start;

            // Should complete quickly even with long input
            expect(duration).toBeLessThan(100);
        });
    });
});
