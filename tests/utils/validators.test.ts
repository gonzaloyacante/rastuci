/**
 * Utils: Validators
 *
 * Tests for generic schema validators and form inputs.
 */

import { describe, it, expect } from "vitest";

describe("Validator Tests", () => {
  describe("Required Field Validator", () => {
    const isRequired = (val: any) =>
      val !== null && val !== undefined && val !== "";

    it("should accept string", () => expect(isRequired("a")).toBe(true));
    it("should accept number", () => expect(isRequired(0)).toBe(true));
    it("should reject null", () => expect(isRequired(null)).toBe(false));
    it("should reject undefined", () =>
      expect(isRequired(undefined)).toBe(false));
    it("should reject empty string", () => expect(isRequired("")).toBe(false));
  });

  describe("Password Logic Strength", () => {
    const isStrong = (pwd: string) => {
      if (pwd.length < 8) return false;
      if (!/[A-Z]/.test(pwd)) return false;
      if (!/[0-9]/.test(pwd)) return false;
      return true;
    };

    it("should accept strong password", () =>
      expect(isStrong("Password123")).toBe(true));
    it("should reject short", () => expect(isStrong("Pass1")).toBe(false));
    it("should reject no number", () =>
      expect(isStrong("Password")).toBe(false));
    it("should reject no uppercase", () =>
      expect(isStrong("password123")).toBe(false));
  });

  describe("CUIL/CUIT Validator (Argentina)", () => {
    const isValidCUIT = (cuit: string) => {
      if (!/^\d{11}$/.test(cuit)) return false;
      const type = cuit.substring(0, 2);
      // Simplified check for common types
      return ["20", "23", "24", "27", "30", "33", "34"].includes(type);
    };

    it("should accept valid length and prefix", () =>
      expect(isValidCUIT("20123456789")).toBe(true));
    it("should reject wrong length", () =>
      expect(isValidCUIT("20123")).toBe(false));
    it("should reject wrong prefix", () =>
      expect(isValidCUIT("99123456789")).toBe(false));
    it("should reject non-numeric", () =>
      expect(isValidCUIT("20ABC456789")).toBe(false));
  });

  describe("Credit Card Luhn Mock", () => {
    const luhn = (val: string) => {
      let sum = 0;
      let shouldDouble = false;
      for (let i = val.length - 1; i >= 0; i--) {
        let digit = parseInt(val.charAt(i));
        if (shouldDouble) {
          if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      return sum % 10 == 0;
    };

    it("should validate test card", () => {
      // 49927398716 is a valid Lunh test number
      expect(luhn("49927398716")).toBe(true);
    });

    it("should reject invalid number", () => {
      expect(luhn("49927398717")).toBe(false);
    });
  });

  describe("Object Schema Validator (Simple)", () => {
    const validateSchema = (obj: any, schema: Record<string, string>) => {
      for (const [key, type] of Object.entries(schema)) {
        if (typeof obj[key] !== type) return false;
      }
      return true;
    };

    it("should match correct schema", () => {
      const obj = { name: "Test", age: 20 };
      const schema = { name: "string", age: "number" };
      expect(validateSchema(obj, schema)).toBe(true);
    });

    it("should fail incorrect type", () => {
      const obj = { name: "Test", age: "20" };
      const schema = { name: "string", age: "number" };
      expect(validateSchema(obj, schema)).toBe(false);
    });
  });
});
