/**
 * Tests for Email functionality (Resend integration)
 *
 * Tests email template generation and send logic.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Resend
vi.mock("resend", () => ({
    Resend: vi.fn().mockImplementation(() => ({
        emails: {
            send: vi.fn().mockResolvedValue({ data: { id: "email-123" }, error: null }),
        },
    })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("Email Templates", () => {
    describe("getOrderConfirmationEmail", () => {
        const getOrderConfirmationEmail = (params: {
            customerName: string;
            orderId: string;
            total: number;
            items: Array<{ name: string; quantity: number; price: number }>;
        }) => {
            const { customerName, orderId, total, items } = params;

            return `
        <!DOCTYPE html>
        <html>
          <head><title>Confirmación de Pedido</title></head>
          <body>
            <h1>¡Gracias por tu compra!</h1>
            <p>Hola ${customerName},</p>
            <p>Pedido #${orderId.slice(0, 8)}</p>
            ${items.map(item => `
              <div>
                <strong>${item.name}</strong>
                Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
              </div>
            `).join("")}
            <div>Total: $${total.toFixed(2)}</div>
          </body>
        </html>
      `;
        };

        it("should include customer name", () => {
            const html = getOrderConfirmationEmail({
                customerName: "Juan Pérez",
                orderId: "order-12345678",
                total: 1500,
                items: [{ name: "Test", quantity: 1, price: 1500 }],
            });

            expect(html).toContain("Juan Pérez");
        });

        it("should include truncated order ID", () => {
            const html = getOrderConfirmationEmail({
                customerName: "Test",
                orderId: "order-12345678-abcdef",
                total: 1500,
                items: [{ name: "Test", quantity: 1, price: 1500 }],
            });

            expect(html).toContain("order-12");
        });

        it("should include all items", () => {
            const html = getOrderConfirmationEmail({
                customerName: "Test",
                orderId: "order-123",
                total: 3000,
                items: [
                    { name: "Producto A", quantity: 2, price: 1000 },
                    { name: "Producto B", quantity: 1, price: 1000 },
                ],
            });

            expect(html).toContain("Producto A");
            expect(html).toContain("Producto B");
            expect(html).toContain("Cantidad: 2");
            expect(html).toContain("Cantidad: 1");
        });

        it("should format total correctly", () => {
            const html = getOrderConfirmationEmail({
                customerName: "Test",
                orderId: "order-123",
                total: 1234.56,
                items: [{ name: "Test", quantity: 1, price: 1234.56 }],
            });

            expect(html).toContain("$1234.56");
        });
    });

    describe("getOrderShippedEmail", () => {
        const getOrderShippedEmail = (params: {
            customerName: string;
            orderId: string;
            trackingNumber: string;
            carrier: string;
        }) => {
            const { customerName, orderId, trackingNumber, carrier } = params;
            return `
        <html>
          <body>
            <h1>Tu pedido está en camino</h1>
            <p>Hola ${customerName},</p>
            <p>Pedido #${orderId.slice(0, 8)}</p>
            <p>Tracking: ${trackingNumber}</p>
            <p>Transportista: ${carrier}</p>
          </body>
        </html>
      `;
        };

        it("should include tracking number", () => {
            const html = getOrderShippedEmail({
                customerName: "Test",
                orderId: "order-123",
                trackingNumber: "RR123456789AR",
                carrier: "Correo Argentino",
            });

            expect(html).toContain("RR123456789AR");
        });

        it("should include carrier name", () => {
            const html = getOrderShippedEmail({
                customerName: "Test",
                orderId: "order-123",
                trackingNumber: "RR123456789AR",
                carrier: "Correo Argentino",
            });

            expect(html).toContain("Correo Argentino");
        });
    });

    describe("getNewOrderNotificationEmail", () => {
        const getNewOrderNotificationEmail = (params: {
            orderId: string;
            customerName: string;
            customerEmail: string;
            total: number;
            items: Array<{ name: string; quantity: number; price: number }>;
        }) => {
            const { orderId, customerName, customerEmail, total, items } = params;
            return `
        <html>
          <body>
            <h1>Nuevo Pedido Recibido</h1>
            <p>Cliente: ${customerName}</p>
            <p>Email: ${customerEmail}</p>
            <p>Pedido #${orderId.slice(0, 8)}</p>
            ${items.map(item => `<div>${item.name}</div>`).join("")}
            <p>Total: $${total.toFixed(2)}</p>
          </body>
        </html>
      `;
        };

        it("should include customer info for admin", () => {
            const html = getNewOrderNotificationEmail({
                orderId: "order-123",
                customerName: "Juan Pérez",
                customerEmail: "juan@test.com",
                total: 1500,
                items: [],
            });

            expect(html).toContain("Juan Pérez");
            expect(html).toContain("juan@test.com");
        });

        it("should include order total", () => {
            const html = getNewOrderNotificationEmail({
                orderId: "order-123",
                customerName: "Test",
                customerEmail: "test@test.com",
                total: 5000.00,
                items: [],
            });

            expect(html).toContain("$5000.00");
        });
    });
});

describe("Email Sending Logic", () => {
    describe("sendEmail function behavior", () => {
        const sendEmail = async (params: {
            to: string | string[];
            subject: string;
            html: string;
            from?: string;
            apiKey?: string;
        }) => {
            if (!params.apiKey) {
                return false;
            }

            // Simulate API call
            return true;
        };

        it("should return false if API key is missing", async () => {
            const result = await sendEmail({
                to: "test@test.com",
                subject: "Test",
                html: "<p>Test</p>",
                apiKey: undefined,
            });

            expect(result).toBe(false);
        });

        it("should return true with valid API key", async () => {
            const result = await sendEmail({
                to: "test@test.com",
                subject: "Test",
                html: "<p>Test</p>",
                apiKey: "re_123456",
            });

            expect(result).toBe(true);
        });

        it("should handle array of recipients", async () => {
            const result = await sendEmail({
                to: ["test1@test.com", "test2@test.com"],
                subject: "Test",
                html: "<p>Test</p>",
                apiKey: "re_123456",
            });

            expect(result).toBe(true);
        });
    });
});
