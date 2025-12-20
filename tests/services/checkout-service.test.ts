/**
 * Service Layer Tests: Checkout Service
 * 
 * Tests for checkout business logic including:
 * - Cart validation
 * - Price calculations
 * - Discount application
 * - Payment method handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
    default: {
        products: {
            findMany: vi.fn(),
        },
        coupons: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("Checkout Service Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Cart Item Validation", () => {
        interface CartItem {
            productId: string;
            variantId?: string;
            quantity: number;
            price: number;
            size?: string;
            color?: string;
        }

        const validateCartItem = (item: CartItem): { valid: boolean; error?: string } => {
            if (!item.productId) {
                return { valid: false, error: "Product ID is required" };
            }
            if (item.quantity < 1) {
                return { valid: false, error: "Quantity must be at least 1" };
            }
            if (item.quantity > 100) {
                return { valid: false, error: "Quantity exceeds maximum (100)" };
            }
            if (item.price < 0) {
                return { valid: false, error: "Price cannot be negative" };
            }
            return { valid: true };
        };

        it("should validate valid cart item", () => {
            const item: CartItem = { productId: "p1", quantity: 2, price: 100 };
            expect(validateCartItem(item).valid).toBe(true);
        });

        it("should reject missing productId", () => {
            const item: CartItem = { productId: "", quantity: 2, price: 100 };
            expect(validateCartItem(item).valid).toBe(false);
        });

        it("should reject zero quantity", () => {
            const item: CartItem = { productId: "p1", quantity: 0, price: 100 };
            expect(validateCartItem(item).valid).toBe(false);
        });

        it("should reject negative quantity", () => {
            const item: CartItem = { productId: "p1", quantity: -1, price: 100 };
            expect(validateCartItem(item).valid).toBe(false);
        });

        it("should reject excessive quantity", () => {
            const item: CartItem = { productId: "p1", quantity: 101, price: 100 };
            expect(validateCartItem(item).valid).toBe(false);
        });

        it("should reject negative price", () => {
            const item: CartItem = { productId: "p1", quantity: 1, price: -50 };
            expect(validateCartItem(item).valid).toBe(false);
        });
    });

    describe("Price Calculations", () => {
        interface CartItem {
            price: number;
            quantity: number;
            discount?: number;
        }

        const calculateSubtotal = (items: CartItem[]): number => {
            return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        };

        const applyDiscount = (subtotal: number, discountPercent: number): number => {
            const discount = subtotal * (discountPercent / 100);
            return Math.max(0, subtotal - discount);
        };

        const calculateTotal = (
            subtotal: number,
            shipping: number,
            discount: number
        ): number => {
            return Math.max(0, subtotal + shipping - discount);
        };

        it("should calculate subtotal correctly", () => {
            const items = [
                { price: 100, quantity: 2 },
                { price: 50, quantity: 3 },
            ];
            expect(calculateSubtotal(items)).toBe(350);
        });

        it("should handle empty cart", () => {
            expect(calculateSubtotal([])).toBe(0);
        });

        it("should apply percentage discount", () => {
            expect(applyDiscount(1000, 10)).toBe(900);
        });

        it("should handle 100% discount", () => {
            expect(applyDiscount(1000, 100)).toBe(0);
        });

        it("should not go below zero with large discount", () => {
            expect(applyDiscount(100, 150)).toBe(0);
        });

        it("should calculate total with shipping", () => {
            expect(calculateTotal(1000, 200, 0)).toBe(1200);
        });

        it("should calculate total with discount", () => {
            expect(calculateTotal(1000, 200, 100)).toBe(1100);
        });

        it("should not go below zero on total", () => {
            expect(calculateTotal(100, 50, 500)).toBe(0);
        });
    });

    describe("Shipping Cost Calculation", () => {
        interface ShippingZone {
            id: string;
            name: string;
            baseCost: number;
            costPerKg: number;
        }

        const zones: ShippingZone[] = [
            { id: "caba", name: "CABA", baseCost: 500, costPerKg: 50 },
            { id: "gba", name: "GBA", baseCost: 800, costPerKg: 75 },
            { id: "interior", name: "Interior", baseCost: 1200, costPerKg: 100 },
        ];

        const calculateShippingCost = (zoneId: string, weightKg: number): number => {
            const zone = zones.find((z) => z.id === zoneId);
            if (!zone) return 0;
            return zone.baseCost + zone.costPerKg * weightKg;
        };

        it("should calculate CABA shipping", () => {
            expect(calculateShippingCost("caba", 2)).toBe(600);
        });

        it("should calculate GBA shipping", () => {
            expect(calculateShippingCost("gba", 2)).toBe(950);
        });

        it("should calculate Interior shipping", () => {
            expect(calculateShippingCost("interior", 2)).toBe(1400);
        });

        it("should return 0 for unknown zone", () => {
            expect(calculateShippingCost("unknown", 2)).toBe(0);
        });

        it("should handle zero weight", () => {
            expect(calculateShippingCost("caba", 0)).toBe(500);
        });
    });

    describe("Coupon Validation", () => {
        interface Coupon {
            code: string;
            type: "percentage" | "fixed";
            value: number;
            minPurchase: number;
            maxUses: number;
            currentUses: number;
            expiresAt: Date | null;
            isActive: boolean;
        }

        const validateCoupon = (
            coupon: Coupon | null,
            subtotal: number
        ): { valid: boolean; error?: string } => {
            if (!coupon) {
                return { valid: false, error: "Coupon not found" };
            }
            if (!coupon.isActive) {
                return { valid: false, error: "Coupon is not active" };
            }
            if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                return { valid: false, error: "Coupon has expired" };
            }
            if (coupon.currentUses >= coupon.maxUses) {
                return { valid: false, error: "Coupon usage limit reached" };
            }
            if (subtotal < coupon.minPurchase) {
                return { valid: false, error: `Minimum purchase of $${coupon.minPurchase} required` };
            }
            return { valid: true };
        };

        it("should reject null coupon", () => {
            expect(validateCoupon(null, 1000).valid).toBe(false);
        });

        it("should reject inactive coupon", () => {
            const coupon: Coupon = {
                code: "TEST10",
                type: "percentage",
                value: 10,
                minPurchase: 0,
                maxUses: 100,
                currentUses: 0,
                expiresAt: null,
                isActive: false,
            };
            expect(validateCoupon(coupon, 1000).valid).toBe(false);
        });

        it("should reject expired coupon", () => {
            const coupon: Coupon = {
                code: "TEST10",
                type: "percentage",
                value: 10,
                minPurchase: 0,
                maxUses: 100,
                currentUses: 0,
                expiresAt: new Date("2020-01-01"),
                isActive: true,
            };
            expect(validateCoupon(coupon, 1000).valid).toBe(false);
        });

        it("should reject exhausted coupon", () => {
            const coupon: Coupon = {
                code: "TEST10",
                type: "percentage",
                value: 10,
                minPurchase: 0,
                maxUses: 10,
                currentUses: 10,
                expiresAt: null,
                isActive: true,
            };
            expect(validateCoupon(coupon, 1000).valid).toBe(false);
        });

        it("should reject when below minimum purchase", () => {
            const coupon: Coupon = {
                code: "TEST10",
                type: "percentage",
                value: 10,
                minPurchase: 5000,
                maxUses: 100,
                currentUses: 0,
                expiresAt: null,
                isActive: true,
            };
            expect(validateCoupon(coupon, 1000).valid).toBe(false);
        });

        it("should accept valid coupon", () => {
            const coupon: Coupon = {
                code: "TEST10",
                type: "percentage",
                value: 10,
                minPurchase: 500,
                maxUses: 100,
                currentUses: 50,
                expiresAt: new Date("2030-12-31"),
                isActive: true,
            };
            expect(validateCoupon(coupon, 1000).valid).toBe(true);
        });
    });

    describe("Payment Method Selection", () => {
        type PaymentMethod = "mercadopago" | "cash" | "transfer";

        interface PaymentConfig {
            method: PaymentMethod;
            enabled: boolean;
            minAmount?: number;
            maxAmount?: number;
            surchargePercent?: number;
        }

        const paymentConfigs: PaymentConfig[] = [
            { method: "mercadopago", enabled: true },
            { method: "cash", enabled: true, maxAmount: 50000 },
            { method: "transfer", enabled: true, minAmount: 1000 },
        ];

        const isPaymentMethodAvailable = (
            method: PaymentMethod,
            amount: number
        ): boolean => {
            const config = paymentConfigs.find((c) => c.method === method);
            if (!config || !config.enabled) return false;
            if (config.minAmount && amount < config.minAmount) return false;
            if (config.maxAmount && amount > config.maxAmount) return false;
            return true;
        };

        it("should allow MercadoPago for any amount", () => {
            expect(isPaymentMethodAvailable("mercadopago", 100)).toBe(true);
            expect(isPaymentMethodAvailable("mercadopago", 100000)).toBe(true);
        });

        it("should restrict cash for high amounts", () => {
            expect(isPaymentMethodAvailable("cash", 10000)).toBe(true);
            expect(isPaymentMethodAvailable("cash", 60000)).toBe(false);
        });

        it("should restrict transfer for low amounts", () => {
            expect(isPaymentMethodAvailable("transfer", 500)).toBe(false);
            expect(isPaymentMethodAvailable("transfer", 5000)).toBe(true);
        });
    });
});

describe("Checkout Data Sanitization", () => {
    describe("Customer Data Cleaning", () => {
        const sanitizeCustomerData = (data: {
            name: string;
            email: string;
            phone: string;
        }) => ({
            name: data.name.trim().replace(/\s+/g, " "),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.replace(/\D/g, ""),
        });

        it("should trim whitespace from name", () => {
            const result = sanitizeCustomerData({
                name: "  Juan  Pérez  ",
                email: "test@test.com",
                phone: "12345678",
            });
            expect(result.name).toBe("Juan Pérez");
        });

        it("should lowercase email", () => {
            const result = sanitizeCustomerData({
                name: "Juan",
                email: "TEST@EXAMPLE.COM",
                phone: "12345678",
            });
            expect(result.email).toBe("test@example.com");
        });

        it("should remove non-digits from phone", () => {
            const result = sanitizeCustomerData({
                name: "Juan",
                email: "test@test.com",
                phone: "+54 11 1234-5678",
            });
            expect(result.phone).toBe("541112345678");
        });
    });
});
