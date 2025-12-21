/**
 * Utils: Math Helpers
 *
 * Tests for clamping, measuring, and statistical helpers.
 */

import { describe, it, expect } from "vitest";

describe("Math Helper Tests", () => {
  describe("Clamp", () => {
    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    it("should clamp within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it("should clamp low values", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("should clamp high values", () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("Lerp (Linear Interpolation)", () => {
    const lerp = (start: number, end: number, t: number) =>
      start * (1 - t) + end * t;

    it("should return start at 0", () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    it("should return end at 1", () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it("should return mid at 0.5", () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });
  });

  describe("Statistics", () => {
    const average = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    it("should calculate average", () => {
      expect(average([1, 2, 3])).toBe(2);
    });

    it("should calculate median odd", () => {
      expect(median([1, 5, 2])).toBe(2);
    });

    it("should calculate median even", () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });
  });

  describe("Range Generator", () => {
    const range = (start: number, end: number, step = 1) => {
      const output = [];
      for (let i = start; i <= end; i += step) {
        output.push(i);
      }
      return output;
    };

    it("should generate simple range", () => {
      expect(range(1, 3)).toEqual([1, 2, 3]);
    });

    it("should generate step range", () => {
      expect(range(0, 10, 5)).toEqual([0, 5, 10]);
    });
  });
});
