/**
 * Service Logic: Notification Service
 *
 * Tests for email templates, trigger conditions, and placeholder implementation.
 */

import { describe, it, expect } from "vitest";

describe("Notification Logic Tests", () => {
  describe("Email Templates", () => {
    const renderOrderConfirmation = (
      orderId: string,
      customerName: string
    ): string => {
      return `Hola ${customerName}, tu pedido #${orderId} ha sido confirmado.`;
    };

    const renderShippingUpdate = (tracking: string): string => {
      return `Tu pedido ha sido enviado. Seguimiento: ${tracking}`;
    };

    it("should render order confirmation", () => {
      const email = renderOrderConfirmation("12345", "Juan");
      expect(email).toContain("Juan");
      expect(email).toContain("#12345");
      expect(email).toContain("confirmado");
    });

    it("should render shipping update", () => {
      const email = renderShippingUpdate("CA123456789AR");
      expect(email).toContain("CA123456789AR");
      expect(email).toContain("enviado");
    });
  });

  describe("Trigger Conditions", () => {
    const shouldSendLowStockAlert = (
      stock: number,
      threshold: number,
      lastAlertSent?: Date
    ): boolean => {
      if (stock > threshold) return false;
      if (!lastAlertSent) return true;

      const ONE_DAY = 86400000;
      return Date.now() - lastAlertSent.getTime() > ONE_DAY;
    };

    it("should trigger if stock low and no previous alert", () => {
      expect(shouldSendLowStockAlert(2, 5)).toBe(true);
    });

    it("should not trigger if stock healthy", () => {
      expect(shouldSendLowStockAlert(10, 5)).toBe(false);
    });

    it("should not trigger if alert recently sent", () => {
      const recent = new Date(Date.now() - 10000);
      expect(shouldSendLowStockAlert(2, 5, recent)).toBe(false);
    });

    it("should trigger if alert sent long ago", () => {
      const old = new Date(Date.now() - 90000000); // > 1 day
      expect(shouldSendLowStockAlert(2, 5, old)).toBe(true);
    });
  });

  describe("Placeholder Replacement", () => {
    const replacePlaceholders = (
      template: string,
      data: Record<string, string>
    ): string => {
      return template.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => data[key] || `{{${key}}}`
      );
    };

    it("should replace known keys", () => {
      const tpl = "Hello {{name}}";
      expect(replacePlaceholders(tpl, { name: "World" })).toBe("Hello World");
    });

    it("should ignore unknown keys", () => {
      const tpl = "Hello {{name}}";
      expect(replacePlaceholders(tpl, {})).toBe("Hello {{name}}");
    });

    it("should replace multiple keys", () => {
      const tpl = "{{greeting}} {{name}}";
      expect(replacePlaceholders(tpl, { greeting: "Hi", name: "User" })).toBe(
        "Hi User"
      );
    });
  });
});
