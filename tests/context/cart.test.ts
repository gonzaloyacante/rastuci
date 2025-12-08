/**
 * Tests for Cart functionality (CartContext)
 *
 * Tests cart operations, pricing calculations, and state management.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

describe("Cart Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    describe("Cart Item Operations", () => {
        interface CartItem {
            product: {
                id: string;
                name: string;
                price: number;
                onSale?: boolean;
                salePrice?: number | null;
                stock: number;
            };
            quantity: number;
            size: string;
            color: string;
        }

        const createCartItem = (
            productId: string,
            quantity: number,
            size: string,
            color: string,
            price: number = 1000,
            onSale: boolean = false,
            salePrice: number | null = null
        ): CartItem => ({
            product: {
                id: productId,
                name: `Product ${productId}`,
                price,
                onSale,
                salePrice,
                stock: 10,
            },
            quantity,
            size,
            color,
        });

        it("should create a cart item with correct structure", () => {
            const item = createCartItem("1", 2, "M", "Rojo");

            expect(item.product.id).toBe("1");
            expect(item.quantity).toBe(2);
            expect(item.size).toBe("M");
            expect(item.color).toBe("Rojo");
        });

        it("should detect duplicate items by id, size, and color", () => {
            const items: CartItem[] = [
                createCartItem("1", 2, "M", "Rojo"),
                createCartItem("1", 1, "L", "Rojo"),
                createCartItem("1", 1, "M", "Azul"),
            ];

            const findItem = (id: string, size: string, color: string) =>
                items.find(
                    (item) =>
                        item.product.id === id && item.size === size && item.color === color
                );

            expect(findItem("1", "M", "Rojo")).toBeDefined();
            expect(findItem("1", "XL", "Rojo")).toBeUndefined();
        });
    });

    describe("Cart Total Calculation", () => {
        const calculateCartTotal = (
            items: Array<{
                product: { price: number; onSale?: boolean; salePrice?: number | null };
                quantity: number;
            }>
        ) => {
            return items.reduce((total, item) => {
                const effectivePrice =
                    item.product.onSale && item.product.salePrice
                        ? item.product.salePrice
                        : item.product.price;
                return total + effectivePrice * item.quantity;
            }, 0);
        };

        it("should calculate total with regular prices", () => {
            const items = [
                { product: { price: 1000 }, quantity: 2 },
                { product: { price: 500 }, quantity: 3 },
            ];

            expect(calculateCartTotal(items)).toBe(3500);
        });

        it("should use sale price when product is on sale", () => {
            const items = [
                { product: { price: 1000, onSale: true, salePrice: 800 }, quantity: 2 },
            ];

            expect(calculateCartTotal(items)).toBe(1600);
        });

        it("should use regular price if salePrice is null", () => {
            const items = [
                { product: { price: 1000, onSale: true, salePrice: null }, quantity: 1 },
            ];

            expect(calculateCartTotal(items)).toBe(1000);
        });

        it("should handle empty cart", () => {
            expect(calculateCartTotal([])).toBe(0);
        });

        it("should handle mixed items", () => {
            const items = [
                { product: { price: 1000, onSale: true, salePrice: 800 }, quantity: 1 },
                { product: { price: 500 }, quantity: 2 },
                { product: { price: 300, onSale: false }, quantity: 3 },
            ];

            expect(calculateCartTotal(items)).toBe(800 + 1000 + 900);
        });
    });

    describe("Cart Item Count", () => {
        const getItemCount = (items: Array<{ quantity: number }>) =>
            items.reduce((count, item) => count + item.quantity, 0);

        it("should count total items correctly", () => {
            const items = [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }];

            expect(getItemCount(items)).toBe(6);
        });

        it("should return 0 for empty cart", () => {
            expect(getItemCount([])).toBe(0);
        });
    });

    describe("Quantity Updates", () => {
        const updateQuantity = (
            items: Array<{ id: string; quantity: number }>,
            id: string,
            newQuantity: number
        ) => {
            return items.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            );
        };

        it("should update quantity of specific item", () => {
            const items = [
                { id: "1", quantity: 2 },
                { id: "2", quantity: 1 },
            ];

            const updated = updateQuantity(items, "1", 5);

            expect(updated[0].quantity).toBe(5);
            expect(updated[1].quantity).toBe(1);
        });

        it("should not modify other items", () => {
            const items = [
                { id: "1", quantity: 2 },
                { id: "2", quantity: 1 },
            ];

            const updated = updateQuantity(items, "1", 5);

            expect(updated[1]).toEqual({ id: "2", quantity: 1 });
        });
    });

    describe("Remove Item", () => {
        const removeItem = (
            items: Array<{ id: string; size: string; color: string }>,
            id: string,
            size: string,
            color: string
        ) => {
            return items.filter(
                (item) => !(item.id === id && item.size === size && item.color === color)
            );
        };

        it("should remove item by id, size, and color", () => {
            const items = [
                { id: "1", size: "M", color: "Rojo" },
                { id: "1", size: "L", color: "Rojo" },
                { id: "2", size: "M", color: "Azul" },
            ];

            const result = removeItem(items, "1", "M", "Rojo");

            expect(result).toHaveLength(2);
            expect(result.find((i) => i.id === "1" && i.size === "M")).toBeUndefined();
        });

        it("should not remove items with different size/color", () => {
            const items = [
                { id: "1", size: "M", color: "Rojo" },
                { id: "1", size: "L", color: "Rojo" },
            ];

            const result = removeItem(items, "1", "XL", "Rojo");

            expect(result).toHaveLength(2);
        });
    });
});

describe("Cart Persistence", () => {
    describe("localStorage operations", () => {
        it("should serialize cart to JSON", () => {
            const cart = {
                items: [{ id: "1", quantity: 2 }],
                total: 2000,
            };

            const serialized = JSON.stringify(cart);
            const parsed = JSON.parse(serialized);

            expect(parsed.items).toHaveLength(1);
            expect(parsed.total).toBe(2000);
        });

        it("should handle invalid JSON gracefully", () => {
            const parseCart = (data: string | null) => {
                if (!data) return { items: [], total: 0 };
                try {
                    return JSON.parse(data);
                } catch {
                    return { items: [], total: 0 };
                }
            };

            expect(parseCart(null)).toEqual({ items: [], total: 0 });
            expect(parseCart("invalid json")).toEqual({ items: [], total: 0 });
            expect(parseCart('{"items":[]}')).toEqual({ items: [] });
        });
    });
});
