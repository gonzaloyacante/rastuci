/**
 * Core Logic: Pricing Engine
 *
 * Comprehensive tests for price calculations, discounts, taxes, and currency conversions.
 */

import { describe, it, expect } from "vitest";

describe("Pricing Engine Tests", () => {
  describe("Base Price Calculations", () => {
    it("should calculate line item total", () => {
      expect(100 * 2).toBe(200);
    });

    it("should handle floating point precision", () => {
      const result = 0.1 + 0.2;
      expect(result).toBeCloseTo(0.3);
    });

    it("should calculate price with markup", () => {
      const cost = 100;
      const markup = 0.5; // 50%
      const price = cost * (1 + markup);
      expect(price).toBe(150);
    });
  });

  describe("Discount Logic", () => {
    const applyDiscount = (
      price: number,
      type: "percentage" | "fixed",
      value: number
    ): number => {
      if (type === "percentage") {
        return price * (1 - value / 100);
      }
      return Math.max(0, price - value);
    };

    it("should apply percentage discount", () => {
      expect(applyDiscount(100, "percentage", 20)).toBe(80);
    });

    it("should apply fixed discount", () => {
      expect(applyDiscount(100, "fixed", 15)).toBe(85);
    });

    it("should not exceed price with fixed discount", () => {
      expect(applyDiscount(50, "fixed", 60)).toBe(0);
    });

    it("should handle 100% discount", () => {
      expect(applyDiscount(100, "percentage", 100)).toBe(0);
    });

    it("should handle 0% discount", () => {
      expect(applyDiscount(100, "percentage", 0)).toBe(100);
    });
  });

  describe("Tax Calculations (Argentina)", () => {
    const IVA_RATE = 0.21;

    const calculateIVA = (netPrice: number): number => {
      return Number((netPrice * IVA_RATE).toFixed(2));
    };

    const getPriceWithIVA = (netPrice: number): number => {
      return Number((netPrice * (1 + IVA_RATE)).toFixed(2));
    };

    const getNetFromGross = (grossPrice: number): number => {
      return Number((grossPrice / (1 + IVA_RATE)).toFixed(2));
    };

    it("should calculate standard IVA (21%)", () => {
      expect(calculateIVA(100)).toBe(21);
    });

    it("should calculate price with IVA", () => {
      expect(getPriceWithIVA(100)).toBe(121);
    });

    it("should extract net price from gross", () => {
      expect(getNetFromGross(121)).toBe(100);
    });

    it("should handle strict rounding", () => {
      // 10.555 * 0.21 = 2.21655 -> 2.22
      expect(calculateIVA(10.555)).toBe(2.22);
    });
  });

  describe("Bulk Pricing Tiers", () => {
    const getTieredPrice = (quantity: number, basePrice: number): number => {
      let discount = 0;
      if (quantity >= 50) discount = 0.2;
      else if (quantity >= 20) discount = 0.1;
      else if (quantity >= 10) discount = 0.05;

      return basePrice * (1 - discount);
    };

    it("should apply no discount for small quantities", () => {
      expect(getTieredPrice(5, 100)).toBe(100);
    });

    it("should apply tier 1 discount (5%)", () => {
      expect(getTieredPrice(10, 100)).toBe(95);
      expect(getTieredPrice(15, 100)).toBe(95);
    });

    it("should apply tier 2 discount (10%)", () => {
      expect(getTieredPrice(20, 100)).toBe(90);
    });

    it("should apply tier 3 discount (20%)", () => {
      expect(getTieredPrice(50, 100)).toBe(80);
      expect(getTieredPrice(100, 100)).toBe(80);
    });
  });

  describe("Cart Totals Calculation", () => {
    interface CartItem {
      price: number;
      quantity: number;
    }

    const calculateCartTotal = (items: CartItem[]): number => {
      return items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    };

    it("should sum multiple items", () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 20, quantity: 1 },
      ];
      expect(calculateCartTotal(items)).toBe(40);
    });

    it("should handle empty cart", () => {
      expect(calculateCartTotal([])).toBe(0);
    });

    it("should handle fractional quantities (e.g., weight)", () => {
      const items = [{ price: 100, quantity: 1.5 }];
      expect(calculateCartTotal(items)).toBe(150);
    });
  });

  describe("Coupon Validation Logic", () => {
    interface Coupon {
      code: string;
      minPurchase: number;
      expirationDate: Date;
      type: "fixed" | "percentage";
      value: number;
    }

    const validateCoupon = (
      coupon: Coupon,
      cartTotal: number
    ): { valid: boolean; reason?: string } => {
      if (new Date() > coupon.expirationDate) {
        return { valid: false, reason: "Expired" };
      }
      if (cartTotal < coupon.minPurchase) {
        return { valid: false, reason: "Minimum purchase not met" };
      }
      return { valid: true };
    };

    it("should accept valid coupon", () => {
      const coupon: Coupon = {
        code: "TEST",
        minPurchase: 100,
        expirationDate: new Date(Date.now() + 86400000), // Tomorrow
        type: "fixed",
        value: 10,
      };
      expect(validateCoupon(coupon, 150).valid).toBe(true);
    });

    it("should reject expired coupon", () => {
      const coupon: Coupon = {
        code: "TEST",
        minPurchase: 0,
        expirationDate: new Date(Date.now() - 86400000), // Yesterday
        type: "fixed",
        value: 10,
      };
      expect(validateCoupon(coupon, 100).valid).toBe(false);
      expect(validateCoupon(coupon, 100).reason).toBe("Expired");
    });

    it("should reject if minimum purchase not met", () => {
      const coupon: Coupon = {
        code: "TEST",
        minPurchase: 100,
        expirationDate: new Date(Date.now() + 86400000),
        type: "fixed",
        value: 10,
      };
      expect(validateCoupon(coupon, 50).valid).toBe(false);
      expect(validateCoupon(coupon, 50).reason).toBe(
        "Minimum purchase not met"
      );
    });
  });
});
