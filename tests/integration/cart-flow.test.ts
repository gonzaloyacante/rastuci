/**
 * Integration: Cart Flow (Pure Logic)
 *
 * Tests for complex cart operations: merge, update, clear, calculations.
 */

import { describe, it, expect } from "vitest";

describe("Cart Flow Integration Tests", () => {
  interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }

  interface Cart {
    items: CartItem[];
    total: number;
  }

  const createCart = (): Cart => ({ items: [], total: 0 });

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const addItemToCart = (cart: Cart, newItem: CartItem): Cart => {
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.variantId === newItem.variantId
    );

    let newItems;
    if (existingItemIndex > -1) {
      newItems = [...cart.items];
      newItems[existingItemIndex].quantity += newItem.quantity;
    } else {
      newItems = [...cart.items, newItem];
    }

    return {
      items: newItems,
      total: calculateTotal(newItems),
    };
  };

  const removeItem = (
    cart: Cart,
    productId: string,
    variantId?: string
  ): Cart => {
    const newItems = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    return { items: newItems, total: calculateTotal(newItems) };
  };

  const updateQuantity = (
    cart: Cart,
    productId: string,
    qty: number,
    variantId?: string
  ): Cart => {
    if (qty <= 0) return removeItem(cart, productId, variantId);

    const newItems = cart.items.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity: qty };
      }
      return item;
    });

    return { items: newItems, total: calculateTotal(newItems) };
  };

  const mergeCarts = (localCart: Cart, remoteCart: Cart): Cart => {
    let mergedCart = { ...remoteCart };

    localCart.items.forEach((localItem) => {
      mergedCart = addItemToCart(mergedCart, localItem);
    });

    return mergedCart;
  };

  const itemA: CartItem = { id: "1", productId: "p1", quantity: 1, price: 100 };
  const itemB: CartItem = { id: "2", productId: "p2", quantity: 2, price: 50 };

  it("should add item to empty cart", () => {
    const cart = addItemToCart(createCart(), itemA);
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(100);
  });

  it("should accumulate quantity for same item", () => {
    let cart = addItemToCart(createCart(), itemA);
    cart = addItemToCart(cart, itemA);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.total).toBe(200);
  });

  it("should add different items", () => {
    let cart = addItemToCart(createCart(), itemA);
    cart = addItemToCart(cart, itemB);
    expect(cart.items).toHaveLength(2);
    expect(cart.total).toBe(200); // 100*1 + 50*2
  });

  it("should remove item", () => {
    let cart = addItemToCart(createCart(), itemA);
    cart = removeItem(cart, itemA.productId);
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
  });

  it("should update quantity", () => {
    let cart = addItemToCart(createCart(), itemA);
    cart = updateQuantity(cart, itemA.productId, 5);
    expect(cart.items[0].quantity).toBe(5);
    expect(cart.total).toBe(500);
  });

  it("should remove item if quantity updated to 0", () => {
    let cart = addItemToCart(createCart(), itemA);
    cart = updateQuantity(cart, itemA.productId, 0);
    expect(cart.items).toHaveLength(0);
  });

  it("should merge local and remote carts", () => {
    const localCart = addItemToCart(createCart(), itemA); // p1: 1
    const remoteCart = addItemToCart(createCart(), itemB); // p2: 2

    // Add some p1 to remote as well to test increment
    const remoteWithP1 = addItemToCart(remoteCart, itemA); // p2: 2, p1: 1

    const merged = mergeCarts(localCart, remoteWithP1);
    // Should have p1: 2 (1 local + 1 remote), p2: 2 (remote)

    const p1 = merged.items.find((i) => i.productId === "p1");
    const p2 = merged.items.find((i) => i.productId === "p2");

    expect(p1?.quantity).toBe(2);
    expect(p2?.quantity).toBe(2);
    expect(merged.total).toBe(300); // 100*2 + 50*2
  });

  it("should handle variants correctly", () => {
    const variantItem1 = { ...itemA, variantId: "v1" };
    const variantItem2 = { ...itemA, variantId: "v2" };

    let cart = addItemToCart(createCart(), variantItem1);
    cart = addItemToCart(cart, variantItem2);

    expect(cart.items).toHaveLength(2); // Treated as different items
    expect(cart.total).toBe(200);
  });
});
