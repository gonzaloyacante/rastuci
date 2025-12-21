/**
 * Utils: Currency & Financial
 *
 * Tests for currency conversion, formatting, and precision.
 */

import { describe, it, expect } from "vitest";

describe("Currency Utils Tests", () => {
  describe("Formatting ARS", () => {
    const formatARS = (val: number) => {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(val);
    };

    it("should format thousands", () => {
      // Note: Depends on locale node env, usually $ 1.000,00
      const res = formatARS(1000);
      expect(res).toContain("1.000,00");
    });

    it("should format decimals", () => {
      const res = formatARS(10.5);
      expect(res).toContain("10,50");
    });
  });

  describe("Currency Conversion logic", () => {
    const convert = (amount: number, rate: number) =>
      Number((amount * rate).toFixed(2));

    it("should convert USD to ARS", () => {
      expect(convert(100, 1000)).toBe(100000);
    });

    it("should convert ARS to USD", () => {
      expect(convert(1000, 0.001)).toBe(1.0);
    });
  });

  describe("Rounding Logic/Bankers Rounding Simulation", () => {
    const round2 = (val: number) => Math.round(val * 100) / 100;

    it("should round normal", () => {
      expect(round2(10.555)).toBe(10.56);
      expect(round2(10.554)).toBe(10.55);
    });
  });

  describe("Split Payment Calculation", () => {
    const splitPayment = (total: number, parts: number) => {
      const base = Math.floor((total / parts) * 100) / 100;
      const remainder = Number((total - base * parts).toFixed(2));
      const result = Array(parts).fill(base);
      // Add remainder to first part
      result[0] = Number((result[0] + remainder).toFixed(2));
      return result;
    };

    it("should split even amount", () => {
      expect(splitPayment(100, 2)).toEqual([50, 50]);
    });

    it("should split odd amount (penny issue)", () => {
      // 100 / 3 = 33.33 + 0.01 left
      const res = splitPayment(100, 3);
      expect(res).toEqual([33.34, 33.33, 33.33]);
      expect(res.reduce((a, b) => a + b, 0)).toBe(100);
    });
  });
});
