import { cache } from "react";

// Cache configuration
const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 10 * 60 * 1000, // 10 minutes
  PRODUCT_DETAIL: 2 * 60 * 1000, // 2 minutes
  USER_DATA: 1 * 60 * 1000, // 1 minute
} as const;

// In-memory cache store
class CacheStore {
  private store = new Map<string, { data: unknown; timestamp: number }>();

  set(key: string, data: unknown, ttl: number) {
    this.store.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.store.clear();
  }

  delete(key: string) {
    this.store.delete(key);
  }

  keys() {
    return this.store.keys();
  }
}

export const cacheStore = new CacheStore();

// Cached API functions
export const getCachedProducts = cache(
  async (filters?: {
    category?: string;
    search?: string;
    page?: number;
    sortBy?: string;
    limit?: number;
  }) => {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = cacheStore.get(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    if (filters?.category) params.set("categoryId", filters.category);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", filters.page.toString());
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.limit) params.set("limit", filters.limit.toString());

    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products?${params}`,
      {
        next: { revalidate: CACHE_TTL.PRODUCTS / 1000 },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    cacheStore.set(cacheKey, data, CACHE_TTL.PRODUCTS);
    return data;
  },
);

export const getCachedCategories = cache(async () => {
  const cacheKey = "categories";
  const cached = cacheStore.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/categories`,
    {
      next: { revalidate: CACHE_TTL.CATEGORIES / 1000 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  cacheStore.set(cacheKey, data, CACHE_TTL.CATEGORIES);
  return data;
});

export const getCachedProduct = cache(async (id: string) => {
  const cacheKey = `product:${id}`;
  const cached = cacheStore.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products/${id}`,
    {
      next: { revalidate: CACHE_TTL.PRODUCT_DETAIL / 1000 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();
  cacheStore.set(cacheKey, data, CACHE_TTL.PRODUCT_DETAIL);
  return data;
});

// Cache invalidation utilities
export const invalidateCache = (pattern: string) => {
  if (pattern === "all") {
    cacheStore.clear();
    return;
  }

  // Simple pattern matching (could be enhanced with regex)
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
};

export const invalidateProductCache = (productId?: string) => {
  if (productId) {
    cacheStore.delete(`product:${productId}`);
    invalidateCache("products");
  } else {
    invalidateCache("products");
  }
};

export const invalidateCategoriesCache = () => {
  invalidateCache("categories");
};
