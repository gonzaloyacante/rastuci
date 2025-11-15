// Payment gateway integration utilities
interface PaymentProcessor {
  createPaymentIntent(data: PaymentData): Promise<PaymentResult>;
  confirmPayment?(
    paymentIntentId: string,
    cardData: unknown
  ): Promise<PaymentResult>;
  createOrder?(data: PaymentData): Promise<PaymentResult>;
  captureOrder?(orderId: string): Promise<PaymentResult>;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "stripe" | "bank_transfer";
  name: string;
  icon: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  error?: string;
  redirectUrl?: string;
}

export interface CardData {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  holderName: string;
}

// Stripe integration
export class StripePaymentProcessor {
  private apiKey: string;
  private publishableKey: string;

  constructor(apiKey: string, publishableKey: string) {
    this.apiKey = apiKey;
    this.publishableKey = publishableKey;
  }

  async createPaymentIntent(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch("/api/payments/stripe/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to cents
          currency: data.currency,
          metadata: {
            orderId: data.orderId,
            customerId: data.customerId,
            ...data.metadata,
          },
        }),
      });

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return {
        success: true,
        paymentIntentId: result.id,
        transactionId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed",
      };
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    cardData: CardData
  ): Promise<PaymentResult> {
    try {
      const response = await fetch("/api/payments/stripe/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethod: {
            card: {
              number: cardData.number,
              exp_month: cardData.expiryMonth,
              exp_year: cardData.expiryYear,
              cvc: cardData.cvc,
            },
            billing_details: {
              name: cardData.holderName,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return {
        success: result.status === "succeeded",
        transactionId: result.id,
        paymentIntentId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment confirmation failed",
      };
    }
  }
}

// PayPal integration
export class PayPalPaymentProcessor {
  private clientId: string;
  private clientSecret: string;
  private environment: "sandbox" | "production";

  constructor(
    clientId: string,
    clientSecret: string,
    environment: "sandbox" | "production" = "sandbox"
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.environment = environment;
  }

  async createOrder(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: data.currency.toUpperCase(),
                value: data.amount.toFixed(2),
              },
              description: data.description,
              custom_id: data.orderId,
            },
          ],
          application_context: {
            return_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout/cancel`,
          },
        }),
      });

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error };
      }

      const approvalUrl = result.links?.find(
        (link: { rel: string; href: string }) => link.rel === "approve"
      )?.href;

      return {
        success: true,
        transactionId: result.id,
        redirectUrl: approvalUrl,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PayPal order creation failed",
      };
    }
  }

  async captureOrder(orderId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(
        `/api/payments/paypal/capture-order/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error };
      }

      return {
        success: result.status === "COMPLETED",
        transactionId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "PayPal capture failed",
      };
    }
  }
}

// Payment manager
export class PaymentManager {
  private processors: Map<string, unknown> = new Map();
  private defaultProcessor = "stripe";

  constructor() {
    // Initialize payment processors
    if (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY
    ) {
      this.processors.set(
        "stripe",
        new StripePaymentProcessor(
          process.env.STRIPE_SECRET_KEY,
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        )
      );
    }

    if (
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET
    ) {
      this.processors.set(
        "paypal",
        new PayPalPaymentProcessor(
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
          process.env.NODE_ENV === "production" ? "production" : "sandbox"
        )
      );
    }
  }

  getAvailablePaymentMethods(): PaymentMethod[] {
    const methods: PaymentMethod[] = [];

    if (this.processors.has("stripe")) {
      methods.push({
        id: "stripe",
        type: "card",
        name: "Tarjeta de Crédito/Débito",
        icon: "/icons/card.svg",
        enabled: true,
        config: {},
      });
    }

    if (this.processors.has("paypal")) {
      methods.push({
        id: "paypal",
        type: "paypal",
        name: "PayPal",
        icon: "/icons/paypal.svg",
        enabled: true,
        config: {},
      });
    }

    // Add bank transfer option
    methods.push({
      id: "bank_transfer",
      type: "bank_transfer",
      name: "Transferencia Bancaria",
      icon: "/icons/bank.svg",
      enabled: true,
      config: {
        bankName: "Banco Ejemplo",
        accountNumber: "ES12 3456 7890 1234 5678 9012",
        swift: "EXAMPLEXXX",
      },
    });

    return methods;
  }

  async processPayment(
    method: string,
    data: PaymentData,
    additionalData?: Record<string, unknown>
  ): Promise<PaymentResult> {
    const processor = this.processors.get(method);

    if (!processor) {
      return {
        success: false,
        error: `Payment method ${method} not available`,
      };
    }

    switch (method) {
      case "stripe":
        if (additionalData?.cardData) {
          const intent = await (
            processor as PaymentProcessor
          ).createPaymentIntent(data);
          if (!intent.success) {
            return intent;
          }

          return (processor as PaymentProcessor).confirmPayment!(
            intent.paymentIntentId!,
            additionalData.cardData
          );
        } else {
          return (processor as PaymentProcessor).createPaymentIntent(data);
        }

      case "paypal":
        if (additionalData?.orderId) {
          return (processor as PaymentProcessor).captureOrder!(
            additionalData.orderId as string
          );
        } else {
          return (processor as PaymentProcessor).createOrder!(data);
        }

      case "bank_transfer":
        // For bank transfer, we just create a pending payment record
        return {
          success: true,
          transactionId: `bank_${Date.now()}`,
        };

      default:
        return {
          success: false,
          error: "Unknown payment method",
        };
    }
  }

  async refundPayment(
    transactionId: string,
    amount?: number
  ): Promise<PaymentResult> {
    try {
      const response = await fetch("/api/payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          amount,
        }),
      });

      const result = await response.json();

      return {
        success: result.success,
        transactionId: result.refundId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund failed",
      };
    }
  }

  validateCardNumber(number: string): boolean {
    // Luhn algorithm
    const digits = number.replace(/\D/g, "");
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) {
      return false;
    }
    if (year === currentYear && month < currentMonth) {
      return false;
    }

    return month >= 1 && month <= 12;
  }

  validateCVC(cvc: string, cardType?: string): boolean {
    const digits = cvc.replace(/\D/g, "");

    if (cardType === "amex") {
      return digits.length === 4;
    }

    return digits.length === 3;
  }

  getCardType(number: string): string {
    const digits = number.replace(/\D/g, "");

    if (/^4/.test(digits)) {
      return "visa";
    }
    if (/^5[1-5]/.test(digits)) {
      return "mastercard";
    }
    if (/^3[47]/.test(digits)) {
      return "amex";
    }
    if (/^6/.test(digits)) {
      return "discover";
    }

    return "unknown";
  }

  formatCardNumber(number: string): string {
    const digits = number.replace(/\D/g, "");
    const cardType = this.getCardType(digits);

    if (cardType === "amex") {
      return digits.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    }

    return digits.replace(/(\d{4})/g, "$1 ").trim();
  }

  formatExpiryDate(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  }
}

// Global payment manager instance
export const paymentManager = new PaymentManager();
