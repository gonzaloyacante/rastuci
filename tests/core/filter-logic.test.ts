/**
 * Core Logic: Filter & Sort
 *
 * Tests for array sorting, filtering, and pagination logic.
 */

import { describe, it, expect } from "vitest";

describe("Filter Logic Tests", () => {
  interface Item {
    id: number;
    name: string;
    price: number;
    category: string;
    rating: number;
  }

  const items: Item[] = [
    {
      id: 1,
      name: "Product A",
      price: 100,
      category: "Electronics",
      rating: 4.5,
    },
    { id: 2, name: "Product B", price: 50, category: "Clothing", rating: 3.0 },
    {
      id: 3,
      name: "Product C",
      price: 200,
      category: "Electronics",
      rating: 5.0,
    },
    { id: 4, name: "Product D", price: 75, category: "Home", rating: 4.0 },
    { id: 5, name: "Product E", price: 150, category: "Clothing", rating: 4.8 },
  ];

  describe("Sorting", () => {
    const sortItems = (
      items: Item[],
      sortBy: "price_asc" | "price_desc" | "rating_desc" | "name_asc"
    ) => {
      const sorted = [...items];
      sorted.sort((a, b) => {
        switch (sortBy) {
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "rating_desc":
            return b.rating - a.rating;
          case "name_asc":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      return sorted;
    };

    it("should sort by price ascending", () => {
      const sorted = sortItems(items, "price_asc");
      expect(sorted[0].id).toBe(2); // Lowest price 50
      expect(sorted[4].id).toBe(3); // Highest price 200
    });

    it("should sort by price descending", () => {
      const sorted = sortItems(items, "price_desc");
      expect(sorted[0].id).toBe(3); // Highest price 200
    });

    it("should sort by rating descending", () => {
      const sorted = sortItems(items, "rating_desc");
      expect(sorted[0].id).toBe(3); // Rating 5.0
    });

    it("should sort by name ascending", () => {
      const sorted = sortItems(items, "name_asc");
      expect(sorted[0].name).toBe("Product A");
      expect(sorted[4].name).toBe("Product E");
    });
  });

  describe("Filtering", () => {
    interface Filters {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
    }

    const filterItems = (items: Item[], filters: Filters) => {
      return items.filter((item) => {
        if (filters.category && item.category !== filters.category)
          return false;
        if (filters.minPrice && item.price < filters.minPrice) return false;
        if (filters.maxPrice && item.price > filters.maxPrice) return false;
        if (filters.minRating && item.rating < filters.minRating) return false;
        return true;
      });
    };

    it("should filter by category", () => {
      const filtered = filterItems(items, { category: "Electronics" });
      expect(filtered).toHaveLength(2);
      expect(filtered[0].category).toBe("Electronics");
    });

    it("should filter by price range", () => {
      const filtered = filterItems(items, { minPrice: 100, maxPrice: 150 });
      expect(filtered).toHaveLength(2); // 100 and 150
    });

    it("should filter by minimum rating", () => {
      const filtered = filterItems(items, { minRating: 4.5 });
      expect(filtered).toHaveLength(3); // 4.5, 5.0, 4.8
    });

    it("should handle multiple filters", () => {
      const filtered = filterItems(items, {
        category: "Clothing",
        minPrice: 100,
      });
      expect(filtered).toHaveLength(1); // Product E
    });
  });

  describe("Pagination", () => {
    const paginate = (items: any[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      return items.slice(startIndex, startIndex + limit);
    };

    it("should return correct page", () => {
      const page1 = paginate(items, 1, 2);
      expect(page1).toHaveLength(2);
      expect(page1[0].id).toBe(1);
    });

    it("should return second page", () => {
      const page2 = paginate(items, 2, 2);
      expect(page2).toHaveLength(2);
      expect(page2[0].id).toBe(3);
    });

    it("should return remaining items on last page", () => {
      const page3 = paginate(items, 3, 2);
      expect(page3).toHaveLength(1); // 5 items total, 2 per page -> 1 left
    });

    it("should return empty if page invalid", () => {
      const page4 = paginate(items, 4, 2);
      expect(page4).toHaveLength(0);
    });
  });
});
