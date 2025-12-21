/**
 * Core Logic: Loyalty Program
 *
 * Tests for points accumulation, tier progression, and redemption logic.
 */

import { describe, it, expect } from "vitest";

describe("Loyalty Program Tests", () => {
  describe("Points Accumulation", () => {
    const calculatePoints = (
      amount: number,
      tier: "BRONZE" | "SILVER" | "GOLD"
    ) => {
      const multiplier = { BRONZE: 1, SILVER: 1.5, GOLD: 2 };
      return Math.floor(amount * multiplier[tier]);
    };

    it("should give 1 point per 1 unit for Bronze", () => {
      expect(calculatePoints(100, "BRONZE")).toBe(100);
    });

    it("should give 1.5 points for Silver", () => {
      expect(calculatePoints(100, "SILVER")).toBe(150);
    });

    it("should give 2 points for Gold", () => {
      expect(calculatePoints(100, "GOLD")).toBe(200);
    });

    it("should round down points", () => {
      expect(calculatePoints(99.9, "BRONZE")).toBe(99);
    });
  });

  describe("Tier Progression", () => {
    const getTier = (points: number) => {
      if (points >= 10000) return "GOLD";
      if (points >= 5000) return "SILVER";
      return "BRONZE";
    };

    const pointsToNextTier = (points: number) => {
      if (points >= 10000) return 0;
      if (points >= 5000) return 10000 - points;
      return 5000 - points;
    };

    it("should start at Bronze", () => {
      expect(getTier(0)).toBe("BRONZE");
      expect(getTier(4999)).toBe("BRONZE");
    });

    it("should reach Silver", () => {
      expect(getTier(5000)).toBe("SILVER");
      expect(getTier(9999)).toBe("SILVER");
    });

    it("should reach Gold", () => {
      expect(getTier(10000)).toBe("GOLD");
    });

    it("should calculate gap to Silver", () => {
      expect(pointsToNextTier(4000)).toBe(1000);
    });

    it("should calculate gap to Gold", () => {
      expect(pointsToNextTier(8000)).toBe(2000);
    });
  });

  describe("Points Redemption", () => {
    const redeemPoints = (points: number, amountNeeded: number) => {
      if (points < amountNeeded) return { success: false, remaining: points };
      return { success: true, remaining: points - amountNeeded };
    };

    const getRedemptionValue = (points: number) => points / 100; // 100 pts = $1

    it("should allow redemption if sufficient", () => {
      expect(redeemPoints(500, 200).success).toBe(true);
      expect(redeemPoints(500, 200).remaining).toBe(300);
    });

    it("should deny redemption if insufficient", () => {
      expect(redeemPoints(100, 200).success).toBe(false);
      expect(redeemPoints(100, 200).remaining).toBe(100);
    });

    it("should calculate monetary value", () => {
      expect(getRedemptionValue(1000)).toBe(10);
    });
  });
});
