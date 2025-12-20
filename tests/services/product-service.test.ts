/**
 * Service Layer Tests: Product Service
 * 
 * Tests for product business logic including:
 * - Stock management
 * - Variant handling
 * - Price calculations
 * - Search/filtering
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
    default: {
        products: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        product_variants: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("Product Service Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Stock Management", () => {
        interface StockUpdate {
            variantId: string;
            quantity: number;
            operation: "add" | "subtract" | "set";
        }

        const calculateNewStock = (
            currentStock: number,
            update: Omit<StockUpdate, "variantId">
        ): number => {
            switch (update.operation) {
                case "add":
                    return currentStock + update.quantity;
                case "subtract":
                    return Math.max(0, currentStock - update.quantity);
                case "set":
                    return Math.max(0, update.quantity);
                default:
                    return currentStock;
            }
        };

        it("should add stock correctly", () => {
            expect(calculateNewStock(10, { quantity: 5, operation: "add" })).toBe(15);
        });

        it("should subtract stock correctly", () => {
            expect(calculateNewStock(10, { quantity: 3, operation: "subtract" })).toBe(7);
        });

        it("should not go below zero when subtracting", () => {
            expect(calculateNewStock(5, { quantity: 10, operation: "subtract" })).toBe(0);
        });

        it("should set stock correctly", () => {
            expect(calculateNewStock(10, { quantity: 25, operation: "set" })).toBe(25);
        });

        it("should not set negative stock", () => {
            expect(calculateNewStock(10, { quantity: -5, operation: "set" })).toBe(0);
        });
    });

    describe("Variant Stock Aggregation", () => {
        interface ProductVariant {
            id: string;
            color: string;
            size: string;
            stock: number;
            sku: string;
        }

        const getTotalStock = (variants: ProductVariant[]): number => {
            return variants.reduce((total, v) => total + v.stock, 0);
        };

        const getStockByColor = (variants: ProductVariant[]): Record<string, number> => {
            return variants.reduce((acc, v) => {
                acc[v.color] = (acc[v.color] || 0) + v.stock;
                return acc;
            }, {} as Record<string, number>);
        };

        const getAvailableColors = (variants: ProductVariant[]): string[] => {
            const colorsWithStock = variants.filter((v) => v.stock > 0);
            return [...new Set(colorsWithStock.map((v) => v.color))];
        };

        const getAvailableSizes = (variants: ProductVariant[], color: string): string[] => {
            return variants
                .filter((v) => v.color === color && v.stock > 0)
                .map((v) => v.size);
        };

        const variants: ProductVariant[] = [
            { id: "v1", color: "Red", size: "S", stock: 5, sku: "PROD-RED-S" },
            { id: "v2", color: "Red", size: "M", stock: 10, sku: "PROD-RED-M" },
            { id: "v3", color: "Red", size: "L", stock: 0, sku: "PROD-RED-L" },
            { id: "v4", color: "Blue", size: "S", stock: 8, sku: "PROD-BLUE-S" },
            { id: "v5", color: "Blue", size: "M", stock: 0, sku: "PROD-BLUE-M" },
        ];

        it("should calculate total stock across variants", () => {
            expect(getTotalStock(variants)).toBe(23);
        });

        it("should calculate stock by color", () => {
            const byColor = getStockByColor(variants);
            expect(byColor.Red).toBe(15);
            expect(byColor.Blue).toBe(8);
        });

        it("should get available colors", () => {
            const colors = getAvailableColors(variants);
            expect(colors).toContain("Red");
            expect(colors).toContain("Blue");
            expect(colors).toHaveLength(2);
        });

        it("should get available sizes for color", () => {
            const redSizes = getAvailableSizes(variants, "Red");
            expect(redSizes).toContain("S");
            expect(redSizes).toContain("M");
            expect(redSizes).not.toContain("L"); // Out of stock
        });

        it("should handle empty variants", () => {
            expect(getTotalStock([])).toBe(0);
            expect(getAvailableColors([])).toHaveLength(0);
        });
    });

    describe("Price Calculations", () => {
        interface Product {
            price: number;
            salePrice?: number | null;
            onSale: boolean;
            cost?: number;
        }

        const getDisplayPrice = (product: Product): number => {
            if (product.onSale && product.salePrice) {
                return product.salePrice;
            }
            return product.price;
        };

        const getDiscountPercent = (product: Product): number => {
            if (!product.onSale || !product.salePrice) return 0;
            return Math.round(((product.price - product.salePrice) / product.price) * 100);
        };

        const getMargin = (product: Product): number | null => {
            if (!product.cost) return null;
            const displayPrice = getDisplayPrice(product);
            return Math.round(((displayPrice - product.cost) / displayPrice) * 100);
        };

        it("should return regular price when not on sale", () => {
            const product: Product = { price: 1000, onSale: false };
            expect(getDisplayPrice(product)).toBe(1000);
        });

        it("should return sale price when on sale", () => {
            const product: Product = { price: 1000, salePrice: 800, onSale: true };
            expect(getDisplayPrice(product)).toBe(800);
        });

        it("should return regular price if sale price missing", () => {
            const product: Product = { price: 1000, onSale: true };
            expect(getDisplayPrice(product)).toBe(1000);
        });

        it("should calculate discount percent", () => {
            const product: Product = { price: 1000, salePrice: 800, onSale: true };
            expect(getDiscountPercent(product)).toBe(20);
        });

        it("should return 0 discount when not on sale", () => {
            const product: Product = { price: 1000, onSale: false };
            expect(getDiscountPercent(product)).toBe(0);
        });

        it("should calculate margin correctly", () => {
            const product: Product = { price: 1000, cost: 500, onSale: false };
            expect(getMargin(product)).toBe(50);
        });

        it("should return null margin if no cost", () => {
            const product: Product = { price: 1000, onSale: false };
            expect(getMargin(product)).toBeNull();
        });
    });

    describe("Product Search & Filtering", () => {
        interface Product {
            id: string;
            name: string;
            categoryId: string;
            price: number;
            stock: number;
            isActive: boolean;
        }

        interface ProductFilters {
            categoryId?: string;
            minPrice?: number;
            maxPrice?: number;
            inStock?: boolean;
            search?: string;
        }

        const filterProducts = (products: Product[], filters: ProductFilters): Product[] => {
            return products.filter((p) => {
                if (!p.isActive) return false;
                if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
                if (filters.minPrice && p.price < filters.minPrice) return false;
                if (filters.maxPrice && p.price > filters.maxPrice) return false;
                if (filters.inStock && p.stock <= 0) return false;
                if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
                return true;
            });
        };

        const products: Product[] = [
            { id: "p1", name: "Vestido Rojo", categoryId: "cat1", price: 5000, stock: 10, isActive: true },
            { id: "p2", name: "Vestido Azul", categoryId: "cat1", price: 6000, stock: 0, isActive: true },
            { id: "p3", name: "Pantalón Negro", categoryId: "cat2", price: 3000, stock: 5, isActive: true },
            { id: "p4", name: "Blusa Blanca", categoryId: "cat3", price: 2500, stock: 3, isActive: false },
        ];

        it("should filter by category", () => {
            const result = filterProducts(products, { categoryId: "cat1" });
            expect(result).toHaveLength(2);
        });

        it("should filter by price range", () => {
            const result = filterProducts(products, { minPrice: 4000, maxPrice: 7000 });
            expect(result).toHaveLength(2);
        });

        it("should filter by in-stock only", () => {
            const result = filterProducts(products, { inStock: true });
            expect(result).toHaveLength(2); // p1 and p3 (p4 inactive)
        });

        it("should filter by search term", () => {
            const result = filterProducts(products, { search: "vestido" });
            expect(result).toHaveLength(2);
        });

        it("should exclude inactive products", () => {
            const result = filterProducts(products, {});
            expect(result).toHaveLength(3);
            expect(result.find((p) => p.id === "p4")).toBeUndefined();
        });

        it("should combine multiple filters", () => {
            const result = filterProducts(products, {
                categoryId: "cat1",
                inStock: true,
            });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("p1");
        });
    });

    describe("SKU Generation", () => {
        const generateSKU = (
            productName: string,
            color: string,
            size: string
        ): string => {
            const namePart = productName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 4);
            const colorPart = color.toUpperCase().slice(0, 3);
            const sizePart = size.toUpperCase();
            return `${namePart}-${colorPart}-${sizePart}`;
        };

        it("should generate valid SKU", () => {
            expect(generateSKU("Vestido Largo", "Rojo", "M")).toBe("VEST-ROJ-M");
        });

        it("should handle special characters", () => {
            expect(generateSKU("Vestido $pecial!", "Azul", "L")).toBe("VEST-AZU-L");
        });

        it("should handle short names", () => {
            expect(generateSKU("Top", "Negro", "S")).toBe("TOP-NEG-S");
        });
    });
});

describe("Product Image Handling", () => {
    describe("Image URL Validation", () => {
        const isValidImageUrl = (url: string): boolean => {
            try {
                const parsed = new URL(url);
                const validProtocols = ["http:", "https:"];
                const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

                if (!validProtocols.includes(parsed.protocol)) return false;

                const hasValidExtension = validExtensions.some((ext) =>
                    parsed.pathname.toLowerCase().endsWith(ext)
                );

                // Allow Cloudinary URLs without extension
                if (parsed.hostname === "res.cloudinary.com") return true;

                return hasValidExtension;
            } catch {
                return false;
            }
        };

        it("should accept valid HTTPS image URLs", () => {
            expect(isValidImageUrl("https://example.com/image.jpg")).toBe(true);
        });

        it("should accept Cloudinary URLs", () => {
            expect(isValidImageUrl("https://res.cloudinary.com/demo/image/upload/sample")).toBe(true);
        });

        it("should accept WebP images", () => {
            expect(isValidImageUrl("https://example.com/image.webp")).toBe(true);
        });

        it("should reject non-image URLs", () => {
            expect(isValidImageUrl("https://example.com/file.pdf")).toBe(false);
        });

        it("should reject invalid URLs", () => {
            expect(isValidImageUrl("not-a-url")).toBe(false);
        });

        it("should reject FTP protocol", () => {
            expect(isValidImageUrl("ftp://example.com/image.jpg")).toBe(false);
        });
    });

    describe("Image Array Parsing", () => {
        const parseImages = (images: unknown): string[] => {
            if (!images) return [];
            if (Array.isArray(images)) return images;
            if (typeof images === "string") {
                try {
                    const parsed = JSON.parse(images);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [images];
                }
            }
            return [];
        };

        it("should parse array directly", () => {
            expect(parseImages(["img1.jpg", "img2.jpg"])).toEqual(["img1.jpg", "img2.jpg"]);
        });

        it("should parse JSON string", () => {
            expect(parseImages('["img1.jpg", "img2.jpg"]')).toEqual(["img1.jpg", "img2.jpg"]);
        });

        it("should handle single URL string", () => {
            expect(parseImages("https://example.com/img.jpg")).toEqual(["https://example.com/img.jpg"]);
        });

        it("should handle null/undefined", () => {
            expect(parseImages(null)).toEqual([]);
            expect(parseImages(undefined)).toEqual([]);
        });

        it("should handle empty array", () => {
            expect(parseImages([])).toEqual([]);
        });
    });
});
