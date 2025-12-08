/**
 * Tests for Wishlist functionality
 *
 * Tests wishlist operations and persistence.
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

describe("Wishlist Logic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    describe("Wishlist Item Structure", () => {
        interface WishlistItem {
            id: string;
            name: string;
            price: number;
            image: string;
            addedAt: Date;
        }

        const createWishlistItem = (
            id: string,
            name: string,
            price: number,
            image: string
        ): WishlistItem => ({
            id,
            name,
            price,
            image,
            addedAt: new Date(),
        });

        it("should create item with all required fields", () => {
            const item = createWishlistItem("1", "Test Product", 1000, "/img.jpg");

            expect(item.id).toBe("1");
            expect(item.name).toBe("Test Product");
            expect(item.price).toBe(1000);
            expect(item.image).toBe("/img.jpg");
            expect(item.addedAt).toBeInstanceOf(Date);
        });
    });

    describe("Add to Wishlist", () => {
        const addToWishlist = (
            items: Array<{ id: string }>,
            newItem: { id: string }
        ) => {
            if (items.some((item) => item.id === newItem.id)) {
                return items;
            }
            return [...items, newItem];
        };

        it("should add new item to wishlist", () => {
            const items = [{ id: "1" }];
            const result = addToWishlist(items, { id: "2" });

            expect(result).toHaveLength(2);
        });

        it("should not add duplicate items", () => {
            const items = [{ id: "1" }];
            const result = addToWishlist(items, { id: "1" });

            expect(result).toHaveLength(1);
        });
    });

    describe("Remove from Wishlist", () => {
        const removeFromWishlist = (items: Array<{ id: string }>, id: string) => {
            return items.filter((item) => item.id !== id);
        };

        it("should remove item by id", () => {
            const items = [{ id: "1" }, { id: "2" }, { id: "3" }];
            const result = removeFromWishlist(items, "2");

            expect(result).toHaveLength(2);
            expect(result.find((i) => i.id === "2")).toBeUndefined();
        });

        it("should not affect list if id not found", () => {
            const items = [{ id: "1" }, { id: "2" }];
            const result = removeFromWishlist(items, "999");

            expect(result).toHaveLength(2);
        });
    });

    describe("Check if in Wishlist", () => {
        const isInWishlist = (items: Array<{ id: string }>, id: string) => {
            return items.some((item) => item.id === id);
        };

        it("should return true if item exists", () => {
            const items = [{ id: "1" }, { id: "2" }];

            expect(isInWishlist(items, "1")).toBe(true);
        });

        it("should return false if item does not exist", () => {
            const items = [{ id: "1" }, { id: "2" }];

            expect(isInWishlist(items, "999")).toBe(false);
        });

        it("should return false for empty list", () => {
            expect(isInWishlist([], "1")).toBe(false);
        });
    });

    describe("Clear Wishlist", () => {
        it("should return empty array", () => {
            const clearWishlist = () => [];

            expect(clearWishlist()).toEqual([]);
        });
    });

    describe("Wishlist Sorting", () => {
        type SortOption = "date-asc" | "date-desc" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

        const sortWishlist = (
            items: Array<{ name: string; price: number; addedAt: Date }>,
            sortBy: SortOption
        ) => {
            return [...items].sort((a, b) => {
                switch (sortBy) {
                    case "name-asc":
                        return a.name.localeCompare(b.name);
                    case "name-desc":
                        return b.name.localeCompare(a.name);
                    case "price-asc":
                        return a.price - b.price;
                    case "price-desc":
                        return b.price - a.price;
                    case "date-asc":
                        return a.addedAt.getTime() - b.addedAt.getTime();
                    case "date-desc":
                        return b.addedAt.getTime() - a.addedAt.getTime();
                    default:
                        return 0;
                }
            });
        };

        it("should sort by name ascending", () => {
            const items = [
                { name: "Zebra", price: 100, addedAt: new Date() },
                { name: "Apple", price: 200, addedAt: new Date() },
            ];

            const sorted = sortWishlist(items, "name-asc");

            expect(sorted[0].name).toBe("Apple");
            expect(sorted[1].name).toBe("Zebra");
        });

        it("should sort by price descending", () => {
            const items = [
                { name: "A", price: 100, addedAt: new Date() },
                { name: "B", price: 300, addedAt: new Date() },
                { name: "C", price: 200, addedAt: new Date() },
            ];

            const sorted = sortWishlist(items, "price-desc");

            expect(sorted[0].price).toBe(300);
            expect(sorted[1].price).toBe(200);
            expect(sorted[2].price).toBe(100);
        });
    });
});

describe("Wishlist Persistence", () => {
    const STORAGE_KEY = "wishlist";

    const saveWishlist = (items: unknown[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    };

    const loadWishlist = (): unknown[] => {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    };

    it("should save wishlist to localStorage", () => {
        const items = [{ id: "1", name: "Test" }];
        saveWishlist(items);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    });

    it("should load wishlist from localStorage", () => {
        localStorageMock.getItem.mockReturnValueOnce('[{"id":"1"}]');

        const result = loadWishlist();

        expect(result).toEqual([{ id: "1" }]);
    });

    it("should return empty array for invalid JSON", () => {
        localStorageMock.getItem.mockReturnValueOnce("invalid");

        const result = loadWishlist();

        expect(result).toEqual([]);
    });
});
