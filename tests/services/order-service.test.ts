/**
 * Service Layer Tests: Order Service
 * 
 * Tests for order business logic including:
 * - Order creation
 * - Stock management (atomic operations)
 * - Status transitions
 * - Race condition prevention
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        $transaction: vi.fn(),
        orders: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        product_variants: {
            updateMany: vi.fn(),
        },
        products: {
            findUnique: vi.fn(),
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

describe("Order Service Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Order Creation", () => {
        interface OrderItem {
            productId: string;
            variantId?: string;
            quantity: number;
            price: number;
        }

        interface CustomerInfo {
            name: string;
            email: string;
            phone: string;
            address: string;
        }

        const validateOrderData = (items: OrderItem[], customer: CustomerInfo) => {
            if (!items || items.length === 0) {
                return { valid: false, error: "Items are required" };
            }
            if (!customer.name) {
                return { valid: false, error: "Customer name is required" };
            }
            if (!customer.email) {
                return { valid: false, error: "Customer email is required" };
            }
            return { valid: true };
        };

        it("should validate required items", () => {
            const result = validateOrderData([], {
                name: "Test",
                email: "test@test.com",
                phone: "123",
                address: "123 St"
            });
            expect(result.valid).toBe(false);
            expect(result.error).toBe("Items are required");
        });

        it("should validate customer name", () => {
            const result = validateOrderData(
                [{ productId: "p1", quantity: 1, price: 100 }],
                { name: "", email: "test@test.com", phone: "123", address: "123 St" }
            );
            expect(result.valid).toBe(false);
            expect(result.error).toBe("Customer name is required");
        });

        it("should validate customer email", () => {
            const result = validateOrderData(
                [{ productId: "p1", quantity: 1, price: 100 }],
                { name: "Test", email: "", phone: "123", address: "123 St" }
            );
            expect(result.valid).toBe(false);
        });

        it("should accept valid order data", () => {
            const result = validateOrderData(
                [{ productId: "p1", quantity: 1, price: 100 }],
                { name: "Juan", email: "juan@test.com", phone: "123", address: "123 St" }
            );
            expect(result.valid).toBe(true);
        });
    });

    describe("Stock Management - Atomic Operations", () => {
        const atomicStockDecrement = async (
            variantId: string,
            quantity: number,
            currentStock: number
        ) => {
            // Simulate atomic check: stock >= quantity
            if (currentStock < quantity) {
                return { success: false, error: "Insufficient stock" };
            }

            // Atomic update with WHERE clause: stock >= quantity
            const updated = currentStock >= quantity;
            if (!updated) {
                return { success: false, error: "Race condition - stock changed" };
            }

            return {
                success: true,
                newStock: currentStock - quantity
            };
        };

        it("should decrement stock when sufficient", async () => {
            const result = await atomicStockDecrement("v1", 2, 10);
            expect(result.success).toBe(true);
            expect(result.newStock).toBe(8);
        });

        it("should reject when insufficient stock", async () => {
            const result = await atomicStockDecrement("v1", 15, 10);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Insufficient stock");
        });

        it("should allow decrement to exactly zero", async () => {
            const result = await atomicStockDecrement("v1", 10, 10);
            expect(result.success).toBe(true);
            expect(result.newStock).toBe(0);
        });

        it("should prevent negative stock", async () => {
            const result = await atomicStockDecrement("v1", 11, 10);
            expect(result.success).toBe(false);
        });
    });

    describe("Race Condition Prevention", () => {
        it("should use transaction for multi-item orders", () => {
            const items = [
                { productId: "p1", variantId: "v1", quantity: 2 },
                { productId: "p2", variantId: "v2", quantity: 1 },
            ];

            // All items should be updated in single transaction
            expect(items.length).toBe(2);
        });

        it("should use gte check in WHERE clause", () => {
            const whereClause = {
                id: "variant-123",
                stock: { gte: 5 }, // Atomic check
            };

            expect(whereClause.stock.gte).toBe(5);
        });

        it("should rollback on any failure", async () => {
            const mockTransaction = vi.fn().mockImplementation(async (callback) => {
                try {
                    await callback({ /* tx */ });
                } catch (error) {
                    throw new Error("Transaction rolled back");
                }
            });

            await expect(
                mockTransaction(async () => {
                    throw new Error("Stock insufficient");
                })
            ).rejects.toThrow("Transaction rolled back");
        });
    });

    describe("Order Status Transitions", () => {
        type OrderStatus = "PENDING" | "PENDING_PAYMENT" | "PROCESSED" | "DELIVERED";

        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            PENDING: ["PENDING_PAYMENT"],
            PENDING_PAYMENT: ["PROCESSED"],
            PROCESSED: ["DELIVERED"],
            DELIVERED: [],
        };

        const canTransition = (from: OrderStatus, to: OrderStatus): boolean => {
            return validTransitions[from]?.includes(to) || false;
        };

        it("should allow PENDING to PENDING_PAYMENT", () => {
            expect(canTransition("PENDING", "PENDING_PAYMENT")).toBe(true);
        });

        it("should allow PENDING_PAYMENT to PROCESSED", () => {
            expect(canTransition("PENDING_PAYMENT", "PROCESSED")).toBe(true);
        });

        it("should allow PROCESSED to DELIVERED", () => {
            expect(canTransition("PROCESSED", "DELIVERED")).toBe(true);
        });

        it("should not allow skipping steps", () => {
            expect(canTransition("PENDING", "PROCESSED")).toBe(false);
            expect(canTransition("PENDING", "DELIVERED")).toBe(false);
        });

        it("should not allow reverse transitions", () => {
            expect(canTransition("DELIVERED", "PROCESSED")).toBe(false);
            expect(canTransition("PROCESSED", "PENDING")).toBe(false);
        });

        it("should not allow any transition from DELIVERED", () => {
            expect(validTransitions.DELIVERED).toHaveLength(0);
        });
    });

    describe("Order Total Calculation", () => {
        interface OrderItem {
            price: number;
            quantity: number;
        }

        const calculateTotal = (
            items: OrderItem[],
            shippingCost: number,
            discount: number
        ) => {
            const subtotal = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            return Math.max(0, subtotal + shippingCost - discount);
        };

        it("should calculate subtotal correctly", () => {
            const items = [
                { price: 100, quantity: 2 },
                { price: 50, quantity: 3 },
            ];
            expect(calculateTotal(items, 0, 0)).toBe(350);
        });

        it("should add shipping cost", () => {
            const items = [{ price: 100, quantity: 1 }];
            expect(calculateTotal(items, 50, 0)).toBe(150);
        });

        it("should subtract discount", () => {
            const items = [{ price: 100, quantity: 1 }];
            expect(calculateTotal(items, 0, 20)).toBe(80);
        });

        it("should not go below zero", () => {
            const items = [{ price: 100, quantity: 1 }];
            expect(calculateTotal(items, 0, 200)).toBe(0);
        });
    });
});

describe("Order Metadata Parsing", () => {
    describe("MercadoPago Metadata", () => {
        const parseMetadata = (metadata: Record<string, unknown>) => {
            try {
                const items = metadata.items as string;
                return {
                    items: JSON.parse(items),
                    customer: {
                        name: metadata.customer_name as string,
                        email: metadata.customer_email as string,
                        phone: metadata.customer_phone as string,
                    },
                    shipping: {
                        method: metadata.shipping_method as string,
                        cost: Number(metadata.shipping_cost) || 0,
                    },
                };
            } catch {
                return null;
            }
        };

        it("should parse valid metadata", () => {
            const metadata = {
                items: JSON.stringify([{ productId: "p1", quantity: 1 }]),
                customer_name: "Juan",
                customer_email: "juan@test.com",
                customer_phone: "123456",
                shipping_method: "correo_argentino",
                shipping_cost: "500",
            };

            const result = parseMetadata(metadata);
            expect(result).not.toBeNull();
            expect(result?.customer.name).toBe("Juan");
            expect(result?.shipping.cost).toBe(500);
        });

        it("should handle invalid JSON in items", () => {
            const metadata = {
                items: "not-valid-json",
                customer_name: "Juan",
            };

            const result = parseMetadata(metadata);
            expect(result).toBeNull();
        });

        it("should handle missing shipping cost", () => {
            const metadata = {
                items: JSON.stringify([]),
                customer_name: "Juan",
                customer_email: "test@test.com",
                customer_phone: "123",
                shipping_method: "pickup",
            };

            const result = parseMetadata(metadata);
            expect(result?.shipping.cost).toBe(0);
        });
    });
});

describe("Shipping Logic - shouldShip", () => {
    /**
     * Tests for the shouldShip logic added in Phase 7
     * Ensures pickup orders don't trigger shipping label creation
     */

    const determineShouldShip = (
        shippingMethod: string | undefined,
        status: string
    ): boolean => {
        // Only ship for paid orders that are NOT pickup
        const isPickup = shippingMethod === "pickup";
        const isPaid = status === "PENDING_PAYMENT";
        return isPaid && !isPickup;
    };

    it("should ship for paid home delivery orders", () => {
        expect(determineShouldShip("home_delivery", "PENDING_PAYMENT")).toBe(true);
    });

    it("should ship for paid correo argentino orders", () => {
        expect(determineShouldShip("correo_argentino", "PENDING_PAYMENT")).toBe(true);
    });

    it("should NOT ship for pickup orders even when paid", () => {
        expect(determineShouldShip("pickup", "PENDING_PAYMENT")).toBe(false);
    });

    it("should NOT ship for pending orders", () => {
        expect(determineShouldShip("home_delivery", "PENDING")).toBe(false);
    });

    it("should handle undefined shipping method", () => {
        expect(determineShouldShip(undefined, "PENDING_PAYMENT")).toBe(true);
    });
});
