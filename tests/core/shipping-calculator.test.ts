/**
 * Core Logic: Shipping Calculator
 *
 * Tests for dimensional weight, zone rates, and package optimization.
 */

import { describe, it, expect } from "vitest";

describe("Shipping Calculator Tests", () => {
  describe("Dimensional Weight", () => {
    // Dim Factor typically 5000 for cm
    const calculateVolumetricWeight = (
      l: number,
      w: number,
      h: number,
      factor = 5000
    ) => {
      return (l * w * h) / factor;
    };

    const getChargeableWeight = (actual: number, volumetric: number) => {
      return Math.max(actual, volumetric);
    };

    it("should calculate volumetric weight", () => {
      // 50x40x30 / 5000 = 12
      expect(calculateVolumetricWeight(50, 40, 30)).toBe(12);
    });

    it("should use actual weight if heavier", () => {
      expect(getChargeableWeight(15, 12)).toBe(15);
    });

    it("should use volumetric weight if bulkier", () => {
      expect(getChargeableWeight(5, 12)).toBe(12);
    });
  });

  describe("Zone Based Rates", () => {
    const zones = {
      local: 500,
      national: 1000,
      remote: 2000,
    };

    const getRate = (zone: keyof typeof zones, weight: number) => {
      const base = zones[zone];
      const surcharge = Math.max(0, weight - 1) * 100; // $100 per extra kg
      return base + surcharge;
    };

    it("should charge base rate for 1kg local", () => {
      expect(getRate("local", 1)).toBe(500);
    });

    it("should charge surcharge for heavy local", () => {
      expect(getRate("local", 5)).toBe(900); // 500 + 400
    });

    it("should charge remote base rate", () => {
      expect(getRate("remote", 1)).toBe(2000);
    });
  });

  describe("Package Optimization", () => {
    const canFit = (itemDims: number[], boxDims: number[]) => {
      // Simple logic: sort dimensions and check if item fits in box
      const sortedItem = [...itemDims].sort((a, b) => b - a);
      const sortedBox = [...boxDims].sort((a, b) => b - a);
      return (
        sortedItem[0] <= sortedBox[0] &&
        sortedItem[1] <= sortedBox[1] &&
        sortedItem[2] <= sortedBox[2]
      );
    };

    it("should fit smaller item in box", () => {
      expect(canFit([10, 10, 10], [20, 20, 20])).toBe(true);
    });

    it("should not fit larger item", () => {
      expect(canFit([30, 10, 10], [20, 20, 20])).toBe(false);
    });

    it("should fit rotated item", () => {
      // Item 20x10x5 fits in Box 10x20x10
      expect(canFit([20, 10, 5], [10, 20, 10])).toBe(true);
    });
  });
});
