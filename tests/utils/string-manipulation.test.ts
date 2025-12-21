/**
 * Utils: String Manipulation
 *
 * Tests for string helpers like slugify, truncation, and matching.
 */

import { describe, it, expect } from "vitest";

describe("String Manipulation Tests", () => {
  describe("Slugify", () => {
    const slugify = (text: string): string => {
      return text
        .toString()
        .toLowerCase()
        .normalize("NFD") // Split accents
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-") // Replace multiple - with single -
        .replace(/^-+|-+$/g, ""); // Trim - from start and end
    };

    it("should handle basic string", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle accents", () => {
      expect(slugify("Café con Leche")).toBe("cafe-con-leche");
    });

    it("should handle special characters", () => {
      expect(slugify("Ropa & Accesorios!")).toBe("ropa-accesorios");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("  Too   Many   Spaces  ")).toBe("too-many-spaces");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("Truncate", () => {
    const truncate = (str: string, length: number): string => {
      if (str.length <= length) return str;
      return str.slice(0, length) + "...";
    };

    const truncateWords = (str: string, limit: number): string => {
      const words = str.split(" ");
      if (words.length <= limit) return str;
      return words.slice(0, limit).join(" ") + "...";
    };

    it("should truncate long string", () => {
      expect(truncate("Hello World", 5)).toBe("Hello...");
    });

    it("should not truncate short string", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });

    it("should truncate by words", () => {
      expect(truncateWords("One Two Three Four", 2)).toBe("One Two...");
    });

    it("should not truncate words if under limit", () => {
      expect(truncateWords("One Two", 5)).toBe("One Two");
    });
  });

  describe("Capitalize", () => {
    const capitalize = (str: string): string => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const titleCase = (str: string): string => {
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };

    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should lowercase the rest", () => {
      expect(capitalize("HELLO")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should title case sentence", () => {
      expect(titleCase("hello world")).toBe("Hello World");
    });
  });

  describe("Fuzzy Match", () => {
    const fuzzyMatch = (text: string, search: string): boolean => {
      const t = text.toLowerCase();
      const s = search.toLowerCase();
      // Simple includes for now, could be levenshtein
      return t.includes(s);
    };

    it("should match exact substring", () => {
      expect(fuzzyMatch("Hello World", "World")).toBe(true);
    });

    it("should match check case insensitive", () => {
      expect(fuzzyMatch("Hello World", "world")).toBe(true);
    });

    it("should return false for no match", () => {
      expect(fuzzyMatch("Hello World", "Space")).toBe(false);
    });
  });

  describe("Email Masking", () => {
    const maskEmail = (email: string): string => {
      const [user, domain] = email.split("@");
      if (!user || !domain) return email;
      const maskedUser =
        user.slice(0, 2) + "*".repeat(Math.max(0, user.length - 2));
      return `${maskedUser}@${domain}`;
    };

    it("should mask username", () => {
      expect(maskEmail("john.doe@example.com")).toBe("jo******@example.com");
    });

    it("should handle short usernames", () => {
      expect(maskEmail("me@example.com")).toBe("me@example.com");
      expect(maskEmail("a@example.com")).toBe("a@example.com");
    });
  });
});
