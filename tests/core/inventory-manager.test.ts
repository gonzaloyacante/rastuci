/**
 * Core Logic: Inventory Management
 *
 * Tests for stock reservations, thresholds, and availability checks.
 */

import { describe, it, expect } from "vitest";

describe("Inventory Manager Tests", () => {
  describe("Stock Availability", () => {
    const isAvailable = (
      sku: string,
      requestedQty: number,
      currentStock: number
    ): boolean => {
      return currentStock >= requestedQty;
    };

    it("should return true when stock is sufficient", () => {
      expect(isAvailable("SKU1", 5, 10)).toBe(true);
    });

    it("should return true when stock equals request", () => {
      expect(isAvailable("SKU1", 10, 10)).toBe(true);
    });

    it("should return false when stock is insufficient", () => {
      expect(isAvailable("SKU1", 11, 10)).toBe(false);
    });

    it("should return false for zero stock", () => {
      expect(isAvailable("SKU1", 1, 0)).toBe(false);
    });
  });

  describe("Stock Reservations (Optimistic)", () => {
    interface StockState {
      available: number;
      reserved: number;
    }

    const reserveStock = (
      state: StockState,
      qty: number
    ): StockState | null => {
      if (state.available >= qty) {
        return {
          available: state.available - qty,
          reserved: state.reserved + qty,
        };
      }
      return null;
    };

    const releaseStock = (state: StockState, qty: number): StockState => {
      // Ensure we don't release more than reserved
      const amountToRelease = Math.min(qty, state.reserved);
      return {
        available: state.available + amountToRelease,
        reserved: state.reserved - amountToRelease,
      };
    };

    const confirmStock = (state: StockState, qty: number): StockState => {
      // Permanently remove reserved stock (sold)
      const amountToConfirm = Math.min(qty, state.reserved);
      return {
        available: state.available,
        reserved: state.reserved - amountToConfirm,
      };
    };

    it("should reserve valid quantity", () => {
      const state = { available: 10, reserved: 0 };
      const newState = reserveStock(state, 4);
      expect(newState).toEqual({ available: 6, reserved: 4 });
    });

    it("should fail reservation if insufficient stock", () => {
      const state = { available: 3, reserved: 0 };
      const newState = reserveStock(state, 4);
      expect(newState).toBeNull();
    });

    it("should release reserved stock back to available", () => {
      const state = { available: 6, reserved: 4 };
      const newState = releaseStock(state, 2);
      expect(newState).toEqual({ available: 8, reserved: 2 });
    });

    it("should confirm reserved stock (deduct from reserved only)", () => {
      const state = { available: 6, reserved: 4 };
      const newState = confirmStock(state, 4);
      expect(newState).toEqual({ available: 6, reserved: 0 });
    });
  });

  describe("Low Stock Alerts", () => {
    const checkStockLevel = (
      current: number,
      threshold: number
    ): "OK" | "LOW" | "CRITICAL" => {
      if (current === 0) return "CRITICAL";
      if (current <= threshold) return "LOW";
      return "OK";
    };

    it("should report OK for high stock", () => {
      expect(checkStockLevel(20, 5)).toBe("OK");
    });

    it("should report LOW for stock at threshold", () => {
      expect(checkStockLevel(5, 5)).toBe("LOW");
    });

    it("should report LOW for stock below threshold", () => {
      expect(checkStockLevel(3, 5)).toBe("LOW");
    });

    it("should report CRITICAL for zero stock", () => {
      expect(checkStockLevel(0, 5)).toBe("CRITICAL");
    });
  });

  describe("Backorder Logic", () => {
    interface ProductSettings {
      allowBackorder: boolean;
      stock: number;
    }

    const canPurchase = (product: ProductSettings, qty: number): boolean => {
      if (product.allowBackorder) return true;
      return product.stock >= qty;
    };

    it("should allow purchase if stock exists", () => {
      expect(canPurchase({ allowBackorder: false, stock: 10 }, 5)).toBe(true);
    });

    it("should deny purchase if no stock and no backorder", () => {
      expect(canPurchase({ allowBackorder: false, stock: 0 }, 1)).toBe(false);
    });

    it("should allow purchase if backorder enabled despite no stock", () => {
      expect(canPurchase({ allowBackorder: true, stock: 0 }, 1)).toBe(true);
    });

    it("should allow purchase irrespective of quantity if backorder enabled", () => {
      expect(canPurchase({ allowBackorder: true, stock: 10 }, 100)).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    interface StockUpdate {
      sku: string;
      delta: number;
    }

    const processBatchUpdate = (
      currentStocks: Record<string, number>,
      updates: StockUpdate[]
    ): Record<string, number> => {
      const newStocks = { ...currentStocks };
      updates.forEach((update) => {
        if (newStocks[update.sku] !== undefined) {
          newStocks[update.sku] = Math.max(
            0,
            newStocks[update.sku] + update.delta
          );
        }
      });
      return newStocks;
    };

    it("should process multiple updates", () => {
      const stocks = { A: 10, B: 20 };
      const updates = [
        { sku: "A", delta: -5 },
        { sku: "B", delta: 5 },
      ];
      const result = processBatchUpdate(stocks, updates);
      expect(result["A"]).toBe(5);
      expect(result["B"]).toBe(25);
    });

    it("should ignore unknown SKUs", () => {
      const stocks = { A: 10 };
      const updates = [{ sku: "Z", delta: 10 }];
      const result = processBatchUpdate(stocks, updates);
      expect(result).toEqual(stocks);
    });

    it("should prevent negative stock results", () => {
      const stocks = { A: 5 };
      const updates = [{ sku: "A", delta: -10 }];
      const result = processBatchUpdate(stocks, updates);
      expect(result["A"]).toBe(0);
    });
  });
});
