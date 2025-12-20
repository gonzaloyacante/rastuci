/**
 * Utility Tests: Formatters
 * 
 * Tests for formatting utilities used across the application.
 */

import { describe, it, expect } from "vitest";

// Format utilities implementation
const formatCurrency = (amount: number, currency = "ARS"): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

const formatDateShort = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

const formatPhone = (phone: string): string => {
  // Remove non-digits
  const digits = phone.replace(/\D/g, "");

  // Format as Argentine phone
  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

describe("Currency Formatting Tests", () => {
  describe("formatCurrency", () => {
    it("should format whole numbers", () => {
      const result = formatCurrency(1000);
      expect(result).toMatch(/1[.,]?000/);
    });

    it("should format decimal numbers", () => {
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/1[.,]?234/);
    });

    it("should format zero", () => {
      const result = formatCurrency(0);
      expect(result).toContain("0");
    });

    it("should handle negative numbers", () => {
      const result = formatCurrency(-500);
      expect(result).toContain("-");
    });

    it("should include currency symbol", () => {
      const result = formatCurrency(100);
      expect(result).toMatch(/\$|ARS/);
    });

    it("should format large numbers", () => {
      const result = formatCurrency(1000000);
      expect(result).toMatch(/1[.,]?000[.,]?000/);
    });
  });
});

describe("Date Formatting Tests", () => {
  describe("formatDate", () => {
    it("should format date string", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("2024");
      expect(result).toMatch(/enero|January|15/i);
    });

    it("should format Date object", () => {
      const result = formatDate(new Date(2024, 0, 15));
      expect(result).toContain("2024");
    });

    it("should handle ISO date string", () => {
      const result = formatDate("2024-06-20T10:30:00Z");
      expect(result).toContain("2024");
    });
  });

  describe("formatDateShort", () => {
    it("should format as short date", () => {
      const result = formatDateShort("2024-01-15");
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
    });
  });
});

describe("Phone Formatting Tests", () => {
  describe("formatPhone", () => {
    it("should format 10-digit phone", () => {
      const result = formatPhone("1123456789");
      expect(result).toBe("11 2345-6789");
    });

    it("should format 11-digit phone with leading 0", () => {
      const result = formatPhone("01123456789");
      expect(result).toBe("011 2345-6789");
    });

    it("should handle already formatted phone", () => {
      const result = formatPhone("11 2345-6789");
      expect(result).toBe("11 2345-6789");
    });

    it("should handle phone with spaces and dashes", () => {
      const original = "11-2345 6789";
      const result = formatPhone(original);
      expect(result).toBe("11 2345-6789");
    });

    it("should return original for invalid length", () => {
      const result = formatPhone("12345");
      expect(result).toBe("12345");
    });
  });
});

describe("Text Utility Tests", () => {
  describe("slugify", () => {
    it("should convert to lowercase", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove accents", () => {
      expect(slugify("Niño Español")).toBe("nino-espanol");
    });

    it("should replace spaces with dashes", () => {
      expect(slugify("hello world")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("hello@world!")).toBe("hello-world");
    });

    it("should remove leading/trailing dashes", () => {
      expect(slugify("-hello-world-")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("hello    world")).toBe("hello-world");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("should not truncate short text", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });

    it("should truncate long text", () => {
      expect(truncate("Hello World", 5)).toBe("Hello...");
    });

    it("should add ellipsis", () => {
      const result = truncate("This is a long text", 10);
      expect(result).toContain("...");
    });

    it("should handle exact length", () => {
      expect(truncate("Hello", 5)).toBe("Hello");
    });

    it("should trim whitespace before ellipsis", () => {
      const result = truncate("Hello World Test", 6);
      expect(result).toBe("Hello...");
    });
  });
});

describe("Number Formatting Tests", () => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-AR").format(num);
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  it("should format large numbers with separators", () => {
    const result = formatNumber(1000000);
    expect(result).toMatch(/1[.,]?000[.,]?000/);
  });

  it("should format percentages", () => {
    const result = formatPercent(25);
    expect(result).toMatch(/25\s?%/);
  });

  it("should format decimal percentages", () => {
    const result = formatPercent(33.33);
    expect(result).toMatch(/33[.,]3\s?%/);
  });
});

describe("Order ID Formatting", () => {
  const formatOrderId = (id: string): string => {
    // Show first 8 characters for display
    return id.length > 8 ? `${id.slice(0, 8)}...` : id;
  };

  it("should truncate long order IDs", () => {
    const longId = "clxyz123456789abcdef";
    const result = formatOrderId(longId);
    expect(result).toBe("clxyz123...");
  });

  it("should not truncate short order IDs", () => {
    const shortId = "ABC123";
    const result = formatOrderId(shortId);
    expect(result).toBe("ABC123");
  });
});
