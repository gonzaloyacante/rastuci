/**
 * Tests for Promotions and Coupons functionality
 *
 * Tests for coupon validation, discounts, and promotions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Coupon Validation", () => {
    interface Coupon {
        code: string;
        type: "percentage" | "fixed";
        value: number;
        minOrderValue?: number;
        maxUses?: number;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
    }

    const validateCoupon = (coupon: Coupon, orderTotal: number) => {
        if (!coupon.isActive) {
            return { valid: false, error: "El cupón no está activo" };
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { valid: false, error: "El cupón ha expirado" };
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, error: "El cupón ha alcanzado su límite de usos" };
        }

        if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
            return {
                valid: false,
                error: `El pedido mínimo para este cupón es $${coupon.minOrderValue}`,
            };
        }

        return { valid: true };
    };

    it("should accept valid active coupon", () => {
        const coupon: Coupon = {
            code: "SAVE10",
            type: "percentage",
            value: 10,
            usedCount: 0,
            expiresAt: new Date(Date.now() + 86400000),
            isActive: true,
        };

        expect(validateCoupon(coupon, 1000).valid).toBe(true);
    });

    it("should reject inactive coupon", () => {
        const coupon: Coupon = {
            code: "SAVE10",
            type: "percentage",
            value: 10,
            usedCount: 0,
            expiresAt: null,
            isActive: false,
        };

        const result = validateCoupon(coupon, 1000);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("El cupón no está activo");
    });

    it("should reject expired coupon", () => {
        const coupon: Coupon = {
            code: "SAVE10",
            type: "percentage",
            value: 10,
            usedCount: 0,
            expiresAt: new Date(Date.now() - 86400000),
            isActive: true,
        };

        const result = validateCoupon(coupon, 1000);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("El cupón ha expirado");
    });

    it("should reject coupon at max uses", () => {
        const coupon: Coupon = {
            code: "SAVE10",
            type: "percentage",
            value: 10,
            maxUses: 100,
            usedCount: 100,
            expiresAt: null,
            isActive: true,
        };

        const result = validateCoupon(coupon, 1000);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("El cupón ha alcanzado su límite de usos");
    });

    it("should reject coupon below minimum order", () => {
        const coupon: Coupon = {
            code: "SAVE10",
            type: "percentage",
            value: 10,
            minOrderValue: 5000,
            usedCount: 0,
            expiresAt: null,
            isActive: true,
        };

        const result = validateCoupon(coupon, 3000);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("5000");
    });
});

describe("Discount Calculation", () => {
    interface Coupon {
        type: "percentage" | "fixed";
        value: number;
        maxDiscount?: number;
    }

    const calculateDiscount = (coupon: Coupon, orderTotal: number) => {
        let discount: number;

        if (coupon.type === "percentage") {
            discount = (orderTotal * coupon.value) / 100;
        } else {
            discount = coupon.value;
        }

        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }

        if (discount > orderTotal) {
            discount = orderTotal;
        }

        return Math.round(discount * 100) / 100;
    };

    it("should calculate percentage discount", () => {
        const coupon: Coupon = { type: "percentage", value: 10 };
        expect(calculateDiscount(coupon, 1000)).toBe(100);
    });

    it("should calculate fixed discount", () => {
        const coupon: Coupon = { type: "fixed", value: 500 };
        expect(calculateDiscount(coupon, 1000)).toBe(500);
    });

    it("should cap at max discount", () => {
        const coupon: Coupon = { type: "percentage", value: 50, maxDiscount: 200 };
        expect(calculateDiscount(coupon, 1000)).toBe(200);
    });

    it("should not exceed order total", () => {
        const coupon: Coupon = { type: "fixed", value: 2000 };
        expect(calculateDiscount(coupon, 1000)).toBe(1000);
    });

    it("should handle decimal results", () => {
        const coupon: Coupon = { type: "percentage", value: 15 };
        expect(calculateDiscount(coupon, 333)).toBe(49.95);
    });
});

describe("Free Shipping Promotions", () => {
    interface FreeShippingPromo {
        minOrderValue: number;
        isActive: boolean;
        provinces?: string[];
        expiresAt: Date | null;
    }

    const checkFreeShipping = (
        promo: FreeShippingPromo | null,
        orderTotal: number,
        province: string
    ) => {
        if (!promo || !promo.isActive) {
            return false;
        }

        if (promo.expiresAt && new Date() > promo.expiresAt) {
            return false;
        }

        if (promo.provinces && !promo.provinces.includes(province)) {
            return false;
        }

        return orderTotal >= promo.minOrderValue;
    };

    it("should grant free shipping above threshold", () => {
        const promo: FreeShippingPromo = {
            minOrderValue: 5000,
            isActive: true,
            expiresAt: null,
        };

        expect(checkFreeShipping(promo, 6000, "Buenos Aires")).toBe(true);
    });

    it("should deny free shipping below threshold", () => {
        const promo: FreeShippingPromo = {
            minOrderValue: 5000,
            isActive: true,
            expiresAt: null,
        };

        expect(checkFreeShipping(promo, 4000, "Buenos Aires")).toBe(false);
    });

    it("should deny for inactive promo", () => {
        const promo: FreeShippingPromo = {
            minOrderValue: 5000,
            isActive: false,
            expiresAt: null,
        };

        expect(checkFreeShipping(promo, 6000, "Buenos Aires")).toBe(false);
    });

    it("should check province restrictions", () => {
        const promo: FreeShippingPromo = {
            minOrderValue: 5000,
            isActive: true,
            provinces: ["Buenos Aires", "CABA"],
            expiresAt: null,
        };

        expect(checkFreeShipping(promo, 6000, "Buenos Aires")).toBe(true);
        expect(checkFreeShipping(promo, 6000, "Córdoba")).toBe(false);
    });

    it("should handle expired promo", () => {
        const promo: FreeShippingPromo = {
            minOrderValue: 5000,
            isActive: true,
            expiresAt: new Date(Date.now() - 86400000),
        };

        expect(checkFreeShipping(promo, 6000, "Buenos Aires")).toBe(false);
    });
});

describe("Sale Calculations", () => {
    interface Product {
        price: number;
        onSale: boolean;
        salePrice: number | null;
        saleEndDate: Date | null;
    }

    const isSaleActive = (product: Product) => {
        if (!product.onSale || !product.salePrice) {
            return false;
        }
        if (product.saleEndDate && new Date() > product.saleEndDate) {
            return false;
        }
        return true;
    };

    const getEffectivePrice = (product: Product) => {
        return isSaleActive(product) ? product.salePrice! : product.price;
    };

    const getSavingsAmount = (product: Product) => {
        if (!isSaleActive(product)) return 0;
        return product.price - product.salePrice!;
    };

    const getSavingsPercentage = (product: Product) => {
        if (!isSaleActive(product)) return 0;
        return Math.round(((product.price - product.salePrice!) / product.price) * 100);
    };

    it("should detect active sale", () => {
        const product: Product = {
            price: 1000,
            onSale: true,
            salePrice: 800,
            saleEndDate: new Date(Date.now() + 86400000),
        };
        expect(isSaleActive(product)).toBe(true);
    });

    it("should detect expired sale", () => {
        const product: Product = {
            price: 1000,
            onSale: true,
            salePrice: 800,
            saleEndDate: new Date(Date.now() - 86400000),
        };
        expect(isSaleActive(product)).toBe(false);
    });

    it("should get sale price when active", () => {
        const product: Product = {
            price: 1000,
            onSale: true,
            salePrice: 800,
            saleEndDate: null,
        };
        expect(getEffectivePrice(product)).toBe(800);
    });

    it("should get regular price when not on sale", () => {
        const product: Product = {
            price: 1000,
            onSale: false,
            salePrice: null,
            saleEndDate: null,
        };
        expect(getEffectivePrice(product)).toBe(1000);
    });

    it("should calculate savings amount", () => {
        const product: Product = {
            price: 1000,
            onSale: true,
            salePrice: 750,
            saleEndDate: null,
        };
        expect(getSavingsAmount(product)).toBe(250);
    });

    it("should calculate savings percentage", () => {
        const product: Product = {
            price: 1000,
            onSale: true,
            salePrice: 750,
            saleEndDate: null,
        };
        expect(getSavingsPercentage(product)).toBe(25);
    });
});

describe("Bulk Discounts", () => {
    interface BulkDiscount {
        minQuantity: number;
        discountPercentage: number;
    }

    const calculateBulkDiscount = (
        quantity: number,
        unitPrice: number,
        discounts: BulkDiscount[]
    ) => {
        const sortedDiscounts = [...discounts].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableDiscount = sortedDiscounts.find((d) => quantity >= d.minQuantity);

        if (!applicableDiscount) {
            return { subtotal: quantity * unitPrice, discount: 0, total: quantity * unitPrice };
        }

        const subtotal = quantity * unitPrice;
        const discount = (subtotal * applicableDiscount.discountPercentage) / 100;
        return { subtotal, discount, total: subtotal - discount };
    };

    const discounts: BulkDiscount[] = [
        { minQuantity: 10, discountPercentage: 10 },
        { minQuantity: 25, discountPercentage: 15 },
        { minQuantity: 50, discountPercentage: 20 },
    ];

    it("should not apply discount below minimum", () => {
        const result = calculateBulkDiscount(5, 100, discounts);
        expect(result.discount).toBe(0);
        expect(result.total).toBe(500);
    });

    it("should apply 10% for 10+ items", () => {
        const result = calculateBulkDiscount(10, 100, discounts);
        expect(result.discount).toBe(100);
        expect(result.total).toBe(900);
    });

    it("should apply 15% for 25+ items", () => {
        const result = calculateBulkDiscount(30, 100, discounts);
        expect(result.discount).toBe(450);
        expect(result.total).toBe(2550);
    });

    it("should apply 20% for 50+ items", () => {
        const result = calculateBulkDiscount(50, 100, discounts);
        expect(result.discount).toBe(1000);
        expect(result.total).toBe(4000);
    });
});
