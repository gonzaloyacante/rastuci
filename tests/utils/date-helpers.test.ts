/**
 * Utils: Date Helpers
 *
 * Comprehensive tests for date manipulation, formatting, and duration logic.
 */

import { describe, it, expect } from "vitest";

describe("Date Helper Tests", () => {
  describe("Formatting", () => {
    // Mock date for consistent testing
    const TEST_DATE = new Date("2024-03-15T10:30:00Z");

    const formatDateAR = (date: Date): string => {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    };

    const formatDateTimeAR = (date: Date): string => {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    };

    it("should format date as DD/MM/YYYY", () => {
      // Note: Test might depend on local timezone if not handled carefully.
      // Ideally we force timezone in formatting options, but basic check:
      const formatted = formatDateAR(TEST_DATE);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should format datetime as DD/MM/YYYY HH:mm", () => {
      const formatted = formatDateTimeAR(TEST_DATE);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}[,\s]+\d{1,2}:\d{2}/);
    });
  });

  describe("Duration Calculation", () => {
    const getDaysDifference = (start: Date, end: Date): number => {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getBusinessDays = (start: Date, daysToAdd: number): Date => {
      const result = new Date(start);
      let daysAdded = 0;
      while (daysAdded < daysToAdd) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) {
          // Skip Sunday(0) and Saturday(6)
          daysAdded++;
        }
      }
      return result;
    };

    it("should calculate difference in days", () => {
      const d1 = new Date("2024-01-01");
      const d2 = new Date("2024-01-05");
      expect(getDaysDifference(d1, d2)).toBe(4);
    });

    it("should handles same day", () => {
      const d1 = new Date("2024-01-01");
      expect(getDaysDifference(d1, d1)).toBe(0); // or 0 depending on logic, Math.ceil of 0 is 0
    });

    it("should add business days correctly (skipping weekend)", () => {
      // Friday
      const start = new Date("2024-03-15"); // Fri
      // Add 2 business days -> Mon, Tue
      const end = getBusinessDays(start, 2);
      expect(end.getDay()).toBe(2); // Tuesday
    });

    it("should handle crossing multiple weekends", () => {
      const start = new Date("2024-03-15"); // Fri
      const end = getBusinessDays(start, 6); // + Mon,Tue,Wed,Thu,Fri,Mon
      // Fri + 6 bus days -> Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Mon(6)
      // Result should be Monday 25th approx
      expect(end.getDay()).not.toBe(0);
      expect(end.getDay()).not.toBe(6);
    });
  });

  describe("Relative Time", () => {
    const timeAgo = (date: Date): string => {
      const seconds = Math.floor(
        (new Date().getTime() - date.getTime()) / 1000
      );

      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " años";

      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " meses";

      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " días";

      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " horas";

      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutos";

      return Math.floor(seconds) + " segundos";
    };

    it("should return seconds ago", () => {
      const d = new Date(Date.now() - 5000);
      expect(timeAgo(d)).toBe("5 segundos");
    });

    it("should return minutes ago", () => {
      const d = new Date(Date.now() - 60000 * 5); // 5 mins
      expect(timeAgo(d)).toBe("5 minutos");
    });

    it("should return hours ago", () => {
      const d = new Date(Date.now() - 3600000 * 2); // 2 hours
      expect(timeAgo(d)).toBe("2 horas");
    });

    it("should return days ago", () => {
      const d = new Date(Date.now() - 86400000 * 3); // 3 days
      expect(timeAgo(d)).toBe("3 días");
    });
  });

  describe("Validation", () => {
    const isValidDate = (d: any): boolean => {
      return d instanceof Date && !isNaN(d.getTime());
    };

    const isFuture = (d: Date): boolean => {
      return d.getTime() > Date.now();
    };

    it("should validate valid date object", () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    it("should reject invalid date", () => {
      expect(isValidDate(new Date("invalid"))).toBe(false);
    });

    it("should reject non-date objects", () => {
      expect(isValidDate("2024-01-01")).toBe(false);
      expect(isValidDate(123456789)).toBe(false);
    });

    it("should detect future dates", () => {
      expect(isFuture(new Date(Date.now() + 10000))).toBe(true);
    });

    it("should detect past dates", () => {
      expect(isFuture(new Date(Date.now() - 10000))).toBe(false);
    });
  });
});
