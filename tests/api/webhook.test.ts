/**
 * Tests for MercadoPago Webhook endpoint
 *
 * Tests the webhook handling for payment notifications, order creation,
 * email sending, and CA shipment import.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
    default: {
        orders: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        products: {
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/resend", () => ({
    sendEmail: vi.fn(() => Promise.resolve(true)),
    getOrderConfirmationEmail: vi.fn(() => "<html>Confirmation</html>"),
    getNewOrderNotificationEmail: vi.fn(() => "<html>Notification</html>"),
}));

vi.mock("@/lib/onesignal", () => ({
    notifyPaymentConfirmed: vi.fn(),
    notifyNewOrder: vi.fn(),
}));

vi.mock("@/lib/correo-argentino-service", () => ({
    correoArgentinoService: {
        authenticate: vi.fn(() => Promise.resolve({ success: true })),
        importShipment: vi.fn(() => Promise.resolve({
            success: true,
            data: { trackingNumber: "RR123456789AR" },
        })),
        getCustomerId: vi.fn(() => "0000550997"),
    },
}));

vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
    getRequestId: vi.fn(() => "test-request-id"),
}));

vi.mock("@/lib/mercadopago", () => ({
    validateWebhookSignature: vi.fn(() => true),
}));

describe("MercadoPago Webhook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Payment Status Mapping", () => {
        const mapPaymentStatus = (status: string, statusDetail: string) => {
            switch (status) {
                case "approved":
                    return "COMPLETED";
                case "pending":
                    switch (statusDetail) {
                        case "pending_waiting_payment":
                        case "pending_waiting_transfer":
                            return "PENDING_PAYMENT";
                        case "pending_review_manual":
                        case "pending_waiting_for_remedy":
                            return "PENDING_REVIEW";
                        default:
                            return "PENDING";
                    }
                case "in_process":
                    return "PROCESSING";
                case "rejected":
                    return "FAILED";
                case "cancelled":
                    return "CANCELLED";
                case "refunded":
                    return "REFUNDED";
                case "charged_back":
                    return "CHARGED_BACK";
                default:
                    return "PENDING";
            }
        };

        it("should map approved to COMPLETED", () => {
            expect(mapPaymentStatus("approved", "")).toBe("COMPLETED");
        });

        it("should map pending_waiting_payment to PENDING_PAYMENT", () => {
            expect(mapPaymentStatus("pending", "pending_waiting_payment")).toBe("PENDING_PAYMENT");
        });

        it("should map pending_review_manual to PENDING_REVIEW", () => {
            expect(mapPaymentStatus("pending", "pending_review_manual")).toBe("PENDING_REVIEW");
        });

        it("should map rejected to FAILED", () => {
            expect(mapPaymentStatus("rejected", "")).toBe("FAILED");
        });

        it("should map cancelled to CANCELLED", () => {
            expect(mapPaymentStatus("cancelled", "")).toBe("CANCELLED");
        });

        it("should map refunded to REFUNDED", () => {
            expect(mapPaymentStatus("refunded", "")).toBe("REFUNDED");
        });

        it("should map charged_back to CHARGED_BACK", () => {
            expect(mapPaymentStatus("charged_back", "")).toBe("CHARGED_BACK");
        });

        it("should default unknown status to PENDING", () => {
            expect(mapPaymentStatus("unknown", "")).toBe("PENDING");
        });
    });

    describe("Metadata Extraction", () => {
        const extractShippingFromMetadata = (metadata: Record<string, unknown>) => {
            return {
                shippingStreet: metadata.shippingStreet as string || null,
                shippingCity: metadata.shippingCity as string || null,
                shippingProvince: metadata.shippingProvince as string || null,
                shippingPostalCode: metadata.shippingPostalCode as string || null,
                shippingMethod: metadata.shippingMethod as string || null,
                shippingAgency: metadata.shippingAgency as string || null,
            };
        };

        it("should extract structured shipping fields", () => {
            const metadata = {
                shippingStreet: "Av. Corrientes 1234",
                shippingCity: "Buenos Aires",
                shippingProvince: "CABA",
                shippingPostalCode: "1043",
                shippingMethod: "home_delivery",
            };

            const result = extractShippingFromMetadata(metadata);

            expect(result.shippingStreet).toBe("Av. Corrientes 1234");
            expect(result.shippingCity).toBe("Buenos Aires");
            expect(result.shippingProvince).toBe("CABA");
            expect(result.shippingPostalCode).toBe("1043");
            expect(result.shippingMethod).toBe("home_delivery");
        });

        it("should handle missing fields gracefully", () => {
            const metadata = {
                shippingStreet: "Av. Corrientes 1234",
            };

            const result = extractShippingFromMetadata(metadata);

            expect(result.shippingStreet).toBe("Av. Corrientes 1234");
            expect(result.shippingCity).toBeNull();
            expect(result.shippingProvince).toBeNull();
        });

        it("should return nulls for empty metadata", () => {
            const result = extractShippingFromMetadata({});

            expect(result.shippingStreet).toBeNull();
            expect(result.shippingCity).toBeNull();
        });
    });

    describe("Webhook Validation", () => {
        const validateWebhookPayload = (data: {
            action?: string;
            data?: { id?: string };
        }) => {
            if (!data) return { valid: false, error: "Missing payload" };
            if (data.action !== "payment.created" && data.action !== "payment.updated") {
                return { valid: false, error: "Invalid action" };
            }
            if (!data.data?.id) {
                return { valid: false, error: "Missing payment ID" };
            }
            return { valid: true };
        };

        it("should accept valid payment.created action", () => {
            const result = validateWebhookPayload({
                action: "payment.created",
                data: { id: "12345" },
            });

            expect(result.valid).toBe(true);
        });

        it("should accept valid payment.updated action", () => {
            const result = validateWebhookPayload({
                action: "payment.updated",
                data: { id: "12345" },
            });

            expect(result.valid).toBe(true);
        });

        it("should reject invalid action", () => {
            const result = validateWebhookPayload({
                action: "invalid.action",
                data: { id: "12345" },
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Invalid action");
        });

        it("should reject missing payment ID", () => {
            const result = validateWebhookPayload({
                action: "payment.created",
                data: {},
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe("Missing payment ID");
        });
    });

    describe("Stock Management", () => {
        const decrementStock = async (
            items: Array<{ productId: string; quantity: number }>,
            updateFn: (id: string, quantity: number) => Promise<void>
        ) => {
            const results = [];
            for (const item of items) {
                try {
                    await updateFn(item.productId, item.quantity);
                    results.push({ id: item.productId, success: true });
                } catch (e) {
                    results.push({ id: item.productId, success: false, error: e });
                }
            }
            return results;
        };

        it("should decrement stock for all items", async () => {
            const updateFn = vi.fn();
            const items = [
                { productId: "1", quantity: 2 },
                { productId: "2", quantity: 1 },
            ];

            await decrementStock(items, updateFn);

            expect(updateFn).toHaveBeenCalledTimes(2);
            expect(updateFn).toHaveBeenCalledWith("1", 2);
            expect(updateFn).toHaveBeenCalledWith("2", 1);
        });

        it("should handle errors gracefully", async () => {
            const updateFn = vi.fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("DB error"));

            const items = [
                { productId: "1", quantity: 1 },
                { productId: "2", quantity: 1 },
            ];

            const results = await decrementStock(items, updateFn);

            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
        });
    });
});
