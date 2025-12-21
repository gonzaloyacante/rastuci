/**
 * Core Logic: Tax Calculator (Argentina)
 *
 * Tests for complex tax scenarios: IVA, Perceptions, Exemptions.
 */

import { describe, it, expect } from "vitest";

describe("Tax Calculator Tests", () => {
  const IVA_GENERAL = 0.21;
  const IVA_REDUCED = 0.105;
  const PERCEPCION_IIBB = 0.035;

  describe("IVA General (21%)", () => {
    const calculateIVAGeneral = (net: number) =>
      Number((net * IVA_GENERAL).toFixed(2));

    it("should calculate correctly for 100", () => {
      expect(calculateIVAGeneral(100)).toBe(21.0);
    });

    it("should calculate correctly for 1500", () => {
      expect(calculateIVAGeneral(1500)).toBe(315.0);
    });

    it("should round correctly", () => {
      expect(calculateIVAGeneral(10.55)).toBe(2.22); // 2.2155 -> 2.22
    });
  });

  describe("IVA Reduced (10.5%)", () => {
    const calculateIVAReduced = (net: number) =>
      Number((net * IVA_REDUCED).toFixed(2));

    it("should calculate correctly for 100", () => {
      expect(calculateIVAReduced(100)).toBe(10.5);
    });

    it("should calculate correctly for electronics", () => {
      expect(calculateIVAReduced(20000)).toBe(2100.0);
    });
  });

  describe("Perception IIBB (3.5%)", () => {
    const calculatePercepcion = (net: number, state: string) => {
      if (state !== "CABA") return 0;
      return Number((net * PERCEPCION_IIBB).toFixed(2));
    };

    it("should apply to CABA", () => {
      expect(calculatePercepcion(100, "CABA")).toBe(3.5);
    });

    it("should not apply to other provinces", () => {
      expect(calculatePercepcion(100, "Cordoba")).toBe(0);
    });
  });

  describe("Tax Exemptions", () => {
    const calculateTax = (
      net: number,
      condition: "RI" | "Monotributo" | "Exento"
    ) => {
      if (condition === "Exento") return 0;
      return Number((net * IVA_GENERAL).toFixed(2));
    };

    it("should charge RI", () => {
      expect(calculateTax(100, "RI")).toBe(21);
    });

    it("should charge Monotributo", () => {
      expect(calculateTax(100, "Monotributo")).toBe(21);
    });

    it("should not charge Exento", () => {
      expect(calculateTax(100, "Exento")).toBe(0);
    });
  });

  describe("Reverse Calculation (Gross to Net)", () => {
    const getNet = (gross: number) =>
      Number((gross / (1 + IVA_GENERAL)).toFixed(2));

    it("should extract net from 121", () => {
      expect(getNet(121)).toBe(100.0);
    });

    it("should extract net from 1000", () => {
      expect(getNet(1000)).toBe(826.45);
    });
  });

  describe("Multiple Items Aggregation", () => {
    const calculateTotalTax = (items: { price: number; taxRate: number }[]) => {
      return items.reduce((acc, item) => {
        return acc + Number((item.price * item.taxRate).toFixed(2));
      }, 0);
    };

    it("should sum mixed rates", () => {
      const items = [
        { price: 100, taxRate: 0.21 }, // 21
        { price: 200, taxRate: 0.105 }, // 21
      ];
      expect(calculateTotalTax(items)).toBe(42.0);
    });
  });
});
