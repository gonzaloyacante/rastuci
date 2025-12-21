/**
 * Core Logic: User Profile
 *
 * Tests for address management, validation, and profile updates.
 */

import { describe, it, expect } from "vitest";

describe("User Profile Logic Tests", () => {
  describe("Address Validation", () => {
    interface Address {
      street: string;
      number: string;
      city: string;
      province: string;
      postalCode: string;
    }

    const validateAddress = (
      address: Address
    ): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      if (!address.street) errors.push("Street required");
      if (!address.number) errors.push("Number required");
      if (!address.city) errors.push("City required");
      if (!address.province) errors.push("Province required");
      if (!/^\d{4}$/.test(address.postalCode))
        errors.push("Invalid postal code");
      return { valid: errors.length === 0, errors };
    };

    it("should validate correct address", () => {
      const address = {
        street: "Calle 123",
        number: "456",
        city: "CABA",
        province: "CABA",
        postalCode: "1000",
      };
      expect(validateAddress(address).valid).toBe(true);
    });

    it("should require street", () => {
      const address = {
        street: "",
        number: "456",
        city: "CABA",
        province: "CABA",
        postalCode: "1000",
      };
      expect(validateAddress(address).valid).toBe(false);
      expect(validateAddress(address).errors).toContain("Street required");
    });

    it("should validate postal code format", () => {
      const address = {
        street: "Calle",
        number: "123",
        city: "CABA",
        province: "CABA",
        postalCode: "ABC",
      };
      expect(validateAddress(address).valid).toBe(false);
      expect(validateAddress(address).errors).toContain("Invalid postal code");
    });
  });

  describe("Name Formatting", () => {
    const formatFullName = (firstName: string, lastName: string): string => {
      const capitalize = (s: string) =>
        s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      return `${capitalize(firstName.trim())} ${capitalize(lastName.trim())}`;
    };

    it("should format normal names", () => {
      expect(formatFullName("juan", "perez")).toBe("Juan Perez");
    });

    it("should handle messy input", () => {
      expect(formatFullName("  JUAN  ", "  PEREZ  ")).toBe("Juan Perez");
    });

    it("should handle mixed case", () => {
      expect(formatFullName("jUaN", "PeReZ")).toBe("Juan Perez");
    });
  });

  describe("Profile Completion Check", () => {
    interface UserProfile {
      name?: string;
      email?: string;
      phone?: string;
      address?: any;
    }

    const getProfileCompletion = (profile: UserProfile): number => {
      const fields = ["name", "email", "phone", "address"];
      const completed = fields.filter(
        (f) => !!profile[f as keyof UserProfile]
      ).length;
      return (completed / fields.length) * 100;
    };

    it("should calculate 100% completion", () => {
      const profile = {
        name: "Test",
        email: "test@test.com",
        phone: "123",
        address: {},
      };
      expect(getProfileCompletion(profile)).toBe(100);
    });

    it("should calculate partial completion", () => {
      const profile = { name: "Test", email: "test@test.com" };
      expect(getProfileCompletion(profile)).toBe(50);
    });

    it("should calculate 0% completion", () => {
      expect(getProfileCompletion({})).toBe(0);
    });
  });
});
