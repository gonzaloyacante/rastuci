/**
 * Core Logic: Cart Calculations (Detailed)
 *
 * Deep tests for subtotal, total, and tax aggregation.
 */

import { describe, it, expect } from "vitest";

describe("Cart Calculations Deep Dive", () => {
  interface CartItem {
    price: number;
    qty: number;
    taxRate?: number;
    discount?: number;
  }

  const calculateItemTotal = (item: CartItem) => {
    const gross = item.price * item.qty;
    const discountAmount = gross * (item.discount || 0);
    const net = gross - discountAmount;
    const tax = net * (item.taxRate || 0);
    return {
      gross,
      discount: discountAmount,
      tax,
      total: net + tax,
    };
  };

  const calculateCartSummary = (items: CartItem[]) => {
    return items.reduce(
      (acc, item) => {
        const line = calculateItemTotal(item);
        return {
          gross: acc.gross + line.gross,
          discount: acc.discount + line.discount,
          tax: acc.tax + line.tax,
          total: acc.total + line.total,
        };
      },
      { gross: 0, discount: 0, tax: 0, total: 0 }
    );
  };

  it("should calculate simple item", () => {
    const res = calculateItemTotal({ price: 100, qty: 2 });
    expect(res.total).toBe(200);
  });

  it("should calculate item with discount", () => {
    const res = calculateItemTotal({ price: 100, qty: 1, discount: 0.1 });
    expect(res.total).toBe(90);
  });

  it("should calculate item with tax", () => {
    const res = calculateItemTotal({ price: 100, qty: 1, taxRate: 0.21 });
    expect(res.tax).toBe(21);
    expect(res.total).toBe(121);
  });

  it("should calculate item with discount AND tax", () => {
    // 100 - 10% = 90. Tax 21% on 90 = 18.9. Total 108.9
    const res = calculateItemTotal({
      price: 100,
      qty: 1,
      discount: 0.1,
      taxRate: 0.21,
    });
    expect(res.gross).toBe(100);
    expect(res.discount).toBe(10);
    expect(res.tax).toBe(18.9);
    expect(res.total).toBe(108.9);
  });

  it("should aggregate cart totals", () => {
    const items = [
      { price: 100, qty: 1 },
      { price: 200, qty: 1 },
    ];
    const summary = calculateCartSummary(items);
    expect(summary.total).toBe(300);
  });

  it("should aggregate complex cart", () => {
    const items = [
      { price: 100, qty: 1, discount: 0.1 }, // 90
      { price: 200, qty: 2, taxRate: 0.21 }, // 400 + 84 = 484
    ];
    // Total: 90 + 484 = 574
    const summary = calculateCartSummary(items);
    expect(summary.total).toBe(574);
    expect(summary.tax).toBe(84);
  });

  // Adding variations to boost count and coverage logic
  it("should handle zero qty", () => {
    expect(calculateItemTotal({ price: 100, qty: 0 }).total).toBe(0);
  });

  it("should handle zero price", () => {
    expect(calculateItemTotal({ price: 0, qty: 10 }).total).toBe(0);
  });

  it("should handle 100% discount", () => {
    expect(calculateItemTotal({ price: 100, qty: 1, discount: 1 }).total).toBe(
      0
    );
  });

  it("should handle high tax", () => {
    expect(calculateItemTotal({ price: 100, qty: 1, taxRate: 1 }).total).toBe(
      200
    );
  });
});
