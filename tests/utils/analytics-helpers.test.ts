/**
 * Utils: Analytics Helpers
 *
 * Tests for metric calculation and aggregation.
 */

import { describe, it, expect } from "vitest";

describe("Analytics Helper Tests", () => {
  describe("Metric Aggregation", () => {
    const sum = (vals: number[]) => vals.reduce((a, b) => a + b, 0);
    const max = (vals: number[]) => Math.max(...vals);
    const min = (vals: number[]) => Math.min(...vals);

    it("should sum empty", () => expect(sum([])).toBe(0));
    it("should sum values", () => expect(sum([1, 2, 3])).toBe(6));

    it("should find max", () => expect(max([1, 5, 2])).toBe(5));
    it("should find min", () => expect(min([1, 5, 2])).toBe(1));
  });

  describe("Growth Rate", () => {
    const growth = (curr: number, prev: number) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return ((curr - prev) / prev) * 100;
    };

    it("should calc positive growth", () => expect(growth(120, 100)).toBe(20));
    it("should calc negative growth", () => expect(growth(80, 100)).toBe(-20));
    it("should calc zero growth", () => expect(growth(100, 100)).toBe(0));
  });

  describe("Cohort Analysis (Mock)", () => {
    interface User {
      joinedAt: Date;
      active: boolean;
    }

    const getRetention = (users: User[]) => {
      if (users.length === 0) return 0;
      const active = users.filter((u) => u.active).length;
      return (active / users.length) * 100;
    };

    it("should calc 100% retention", () => {
      expect(getRetention([{ joinedAt: new Date(), active: true }])).toBe(100);
    });

    it("should calc 50% retention", () => {
      expect(
        getRetention([
          { joinedAt: new Date(), active: true },
          { joinedAt: new Date(), active: false },
        ])
      ).toBe(50);
    });
  });

  describe("Moving Average", () => {
    const movingAve = (data: number[], window: number) => {
      if (window > data.length) return [];
      const result = [];
      for (let i = 0; i <= data.length - window; i++) {
        const slice = data.slice(i, i + window);
        result.push(Number((sum(slice) / window).toFixed(2)));
      }
      return result;
    };

    it("should calc moving average window 2", () => {
      // [1+2]/2=1.5, [2+3]/2=2.5
      expect(movingAve([1, 2, 3], 2)).toEqual([1.5, 2.5]);
    });

    it("should calc moving average window 3", () => {
      expect(movingAve([1, 2, 3], 3)).toEqual([2]);
    });
  });
});

function sum(slice: number[]) {
  return slice.reduce((a, b) => a + b, 0);
}
