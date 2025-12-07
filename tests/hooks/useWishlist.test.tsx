import { WishlistProvider, useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/types";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockProduct: Omit<Product, "createdAt" | "updatedAt"> = {
  id: "prod-1",
  name: "Test Product",
  description: "Test description",
  price: 100,
  images: ["/test-image.jpg"],
  categoryId: "cat-1",
  categories: {
    id: "cat-1",
    name: "Test Category",
    description: "Test",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  stock: 10,
  onSale: false,
};

describe("useWishlist Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WishlistProvider>{children}</WishlistProvider>
  );

  describe("Initial State", () => {
    it("should start with empty wishlist", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      expect(result.current.wishlistItems).toEqual([]);
      expect(result.current.getWishlistCount()).toBe(0);
    });

    it("should load wishlist from localStorage", () => {
      const savedItems = [
        {
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
          addedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("rastuci-wishlist", JSON.stringify(savedItems));

      const { result } = renderHook(() => useWishlist(), { wrapper });

      expect(result.current.wishlistItems).toHaveLength(1);
      expect(result.current.wishlistItems[0].id).toBe(mockProduct.id);
    });
  });

  describe("Adding Items", () => {
    it("should add product to wishlist", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
      });

      expect(result.current.wishlistItems).toHaveLength(1);
      expect(result.current.wishlistItems[0].id).toBe(mockProduct.id);
      expect(result.current.getWishlistCount()).toBe(1);
    });

    it("should not add duplicate products", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
      });

      expect(result.current.wishlistItems).toHaveLength(1);
    });

    it("should persist to localStorage when adding", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
      });

      const saved = localStorage.getItem("rastuci-wishlist");
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(mockProduct.id);
    });

    it("should add multiple different products", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: "prod-1",
          name: "Product 1",
          price: 100,
          image: "/test1.jpg",
        });
        result.current.addToWishlist({
          id: "prod-2",
          name: "Product 2",
          price: 200,
          image: "/test2.jpg",
        });
      });

      expect(result.current.wishlistItems).toHaveLength(2);
      expect(result.current.getWishlistCount()).toBe(2);
    });
  });

  describe("Removing Items", () => {
    it("should remove product from wishlist", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
      });

      expect(result.current.wishlistItems).toHaveLength(1);

      act(() => {
        result.current.removeFromWishlist(mockProduct.id);
      });

      expect(result.current.wishlistItems).toHaveLength(0);
    });

    it("should persist to localStorage when removing", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
        result.current.removeFromWishlist(mockProduct.id);
      });

      const saved = localStorage.getItem("rastuci-wishlist");
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(0);
    });

    it("should handle removing non-existent product", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: "prod-1",
          name: "Product 1",
          price: 100,
          image: "/test1.jpg",
        });
        result.current.removeFromWishlist("prod-999");
      });

      expect(result.current.wishlistItems).toHaveLength(1);
    });
  });

  describe("Checking Items", () => {
    it("should check if product is in wishlist", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          image: mockProduct.images[0],
        });
      });

      expect(result.current.isInWishlist(mockProduct.id)).toBe(true);
      expect(result.current.isInWishlist("non-existent")).toBe(false);
    });
  });

  describe("Clearing Wishlist", () => {
    it("should clear all items", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: "prod-1",
          name: "Product 1",
          price: 100,
          image: "/test1.jpg",
        });
        result.current.addToWishlist({
          id: "prod-2",
          name: "Product 2",
          price: 200,
          image: "/test2.jpg",
        });
      });

      expect(result.current.wishlistItems).toHaveLength(2);

      act(() => {
        result.current.clearWishlist();
      });

      expect(result.current.wishlistItems).toHaveLength(0);
      expect(result.current.getWishlistCount()).toBe(0);
    });

    it("should persist cleared state to localStorage", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      act(() => {
        result.current.addToWishlist({
          id: "prod-1",
          name: "Product 1",
          price: 100,
          image: "/test1.jpg",
        });
        result.current.clearWishlist();
      });

      const saved = localStorage.getItem("rastuci-wishlist");
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe("Item Count", () => {
    it("should return correct item count", () => {
      const { result } = renderHook(() => useWishlist(), { wrapper });

      expect(result.current.getWishlistCount()).toBe(0);

      act(() => {
        result.current.addToWishlist({
          id: "prod-1",
          name: "Product 1",
          price: 100,
          image: "/test1.jpg",
        });
      });

      expect(result.current.getWishlistCount()).toBe(1);

      act(() => {
        result.current.addToWishlist({
          id: "prod-2",
          name: "Product 2",
          price: 200,
          image: "/test2.jpg",
        });
      });

      expect(result.current.getWishlistCount()).toBe(2);
    });
  });
});
