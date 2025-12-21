/**
 * Core Logic: Promotions Engine
 *
 * Tests for advanced promotions like BOGO, Bundle offers, and Time-limited deals.
 */

import { describe, it, expect } from "vitest";

describe("Promotions Engine Tests", () => {
  describe("Buy X Get Y Free (BOGO)", () => {
    const calculateBOGO = (qty: number, price: number): number => {
      const paidQty = Math.ceil(qty / 2);
      return paidQty * price;
    };

    it("should pay 1 for 1", () => {
      expect(calculateBOGO(1, 100)).toBe(100);
    });

    it("should pay 1 for 2 (Buy 1 Get 1)", () => {
      expect(calculateBOGO(2, 100)).toBe(100);
    });

    it("should pay 2 for 3", () => {
      expect(calculateBOGO(3, 100)).toBe(200);
    });

    it("should pay 2 for 4", () => {
      expect(calculateBOGO(4, 100)).toBe(200);
    });
  });

  describe("Buy X Get % Off Y", () => {
    const calculatePairDiscount = (
      qty: number,
      price: number,
      discountPercent: number
    ): number => {
      if (qty < 2) return qty * price;

      const pairs = Math.floor(qty / 2);
      const remainder = qty % 2;

      const pairPrice = price + price * (1 - discountPercent);
      return pairs * pairPrice + remainder * price;
    };

    it("should discount second item by 50%", () => {
      // 2 items at 100. 2nd is 50. Total 150.
      expect(calculatePairDiscount(2, 100, 0.5)).toBe(150);
    });

    it("should not discount single item", () => {
      expect(calculatePairDiscount(1, 100, 0.5)).toBe(100);
    });

    it("should apply to multiple pairs", () => {
      // 4 items. 2 pairs. 150 * 2 = 300.
      expect(calculatePairDiscount(4, 100, 0.5)).toBe(300);
    });
  });

  describe("Bundle Pricing", () => {
    const calculateBundle = (
      items: string[],
      bundleItems: string[],
      bundlePrice: number,
      regularTotal: number
    ): number => {
      // Simplification: Check if all bundle items present
      const hasBundle = bundleItems.every((i) => items.includes(i));
      return hasBundle ? bundlePrice : regularTotal;
    };

    it("should apply bundle price", () => {
      expect(calculateBundle(["A", "B"], ["A", "B"], 150, 200)).toBe(150);
    });

    it("should apply regular price if incomplete", () => {
      expect(calculateBundle(["A", "C"], ["A", "B"], 150, 200)).toBe(200);
    });
  });

  describe("Time Limited Offers", () => {
    const getPrice = (
      basePrice: number,
      promoPrice: number,
      end: Date,
      now: Date
    ): number => {
      return now < end ? promoPrice : basePrice;
    };

    it("should return promo price before expiry", () => {
      const end = new Date(Date.now() + 10000);
      expect(getPrice(100, 80, end, new Date())).toBe(80);
    });

    it("should return base price after expiry", () => {
      const end = new Date(Date.now() - 10000);
      expect(getPrice(100, 80, end, new Date())).toBe(100);
    });
  });

  describe("Tiered Volume Discount", () => {
    const getVolumePrice = (qty: number, basePrice: number): number => {
      if (qty >= 100) return basePrice * 0.5;
      if (qty >= 50) return basePrice * 0.7;
      if (qty >= 10) return basePrice * 0.9;
      return basePrice;
    };

    it("should handle large volume", () => {
      expect(getVolumePrice(150, 100)).toBe(50);
    });

    it("should handle medium volume", () => {
      expect(getVolumePrice(60, 100)).toBe(70);
    });

    it("should handle small volume", () => {
      expect(getVolumePrice(12, 100)).toBe(90);
    });

    it("should handle single unit", () => {
      expect(getVolumePrice(1, 100)).toBe(100);
    });
  });
});
