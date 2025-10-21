import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import crypto from "crypto";

// Configuración del cliente de MercadoPago con manejo de errores
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN is required in environment variables");
}

const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 10000, // Incrementado para mejor estabilidad
    idempotencyKey: undefined, // Se generará dinámicamente por transacción
  },
});

// Instancias de los servicios
export const payment = new Payment(client);
export const preference = new Preference(client);

// Enums para estados y tipos
export enum PaymentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  CHARGED_BACK = "charged_back",
}

export enum PaymentMethod {
  CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  TICKET = "ticket",
  WALLET_PURCHASE = "wallet_purchase",
}

// Tipos para TypeScript extendidos
export interface PaymentData {
  token: string;
  installments: number;
  payment_method_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
    first_name?: string;
    last_name?: string;
  };
  transaction_amount: number;
  description: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
  additional_info?: {
    items?: Array<{
      id: string;
      title: string;
      description?: string;
      picture_url?: string;
      category_id?: string;
      quantity: number;
      unit_price: number;
    }>;
    payer?: {
      first_name?: string;
      last_name?: string;
      phone?: {
        area_code?: string;
        number?: string;
      };
      address?: {
        street_name?: string;
        street_number?: string;
        zip_code?: string;
      };
    };
    shipments?: {
      receiver_address?: {
        zip_code?: string;
        state_name?: string;
        city_name?: string;
        street_name?: string;
        street_number?: string;
      };
    };
  };
}

export interface PreferenceData {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    picture_url?: string;
    category_id?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: string;
      zip_code?: string;
      city_name?: string;
      state_name?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: "approved" | "all";
  external_reference?: string;
  notification_url?: string;
  metadata?: Record<string, unknown>;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
    default_installments?: number;
  };
  shipments?: {
    mode?: string;
    local_pickup?: boolean;
    dimensions?: string;
    default_shipping_method?: number;
    free_methods?: Array<{ id: number }>;
    cost?: number;
    free_shipping?: boolean;
  };
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
  statement_descriptor?: string;
}

export interface WebhookNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: "payment" | "merchant_order" | "chargebacks" | "point_integration_wh";
  user_id: string;
}

// Función para crear un pago con manejo completo de errores
export async function createPayment(
  paymentData: PaymentData,
  idempotencyKey?: string,
) {
  try {
    const enhancedClient = new MercadoPagoConfig({
      accessToken: accessToken as string,
      options: {
        timeout: 10000,
        idempotencyKey: idempotencyKey || generateIdempotencyKey(),
      },
    });

    const paymentInstance = new Payment(enhancedClient);

    // Determine a safe notification_url: prefer env var, fallback to local dev webhook
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const candidateNotificationUrl =
      process.env.MP_WEBHOOK_URL ||
      `${baseUrl}/api/payments/mercadopago/webhook`;
    let notification_url: string | undefined;
    // Validate candidate URL by attempting to construct a URL object
    try {
      new URL(candidateNotificationUrl);
      notification_url = candidateNotificationUrl;
    } catch {
      notification_url = undefined;
    }

    // MercadoPago may reject localhost notification URLs. Only send notification_url
    // if MP_WEBHOOK_URL is explicitly set and is not a localhost URL.
    if (process.env.MP_WEBHOOK_URL) {
      try {
        const parsed = new URL(process.env.MP_WEBHOOK_URL);
        if (
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1"
        ) {
          // don't send localhost webhook URLs to MercadoPago
          notification_url = undefined;
        } else {
          notification_url = process.env.MP_WEBHOOK_URL;
        }
      } catch {
        notification_url = undefined;
      }
    }

    const body: Record<string, unknown> = {
      ...paymentData,
      binary_mode: false, // Permite estados pending
      capture: true, // Captura automática del pago
    };

    if (notification_url) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body as any).notification_url = notification_url;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await paymentInstance.create({ body: body as any });

    return result;
  } catch (error) {
    console.error("Error creating payment:", error);
    const errMsg =
      error instanceof Error
        ? error.message
        : typeof error === "object"
          ? JSON.stringify(error)
          : String(error);
    throw new Error(`Payment creation failed: ${errMsg}`);
  }
}

// Función para crear una preferencia (Checkout Pro) con configuración completa
export async function createPreference(
  preferenceData: PreferenceData,
  idempotencyKey?: string,
) {
  try {
    const enhancedClient = new MercadoPagoConfig({
      accessToken: accessToken as string,
      options: {
        timeout: 10000,
        idempotencyKey: idempotencyKey || generateIdempotencyKey(),
      },
    });

    const preferenceInstance = new Preference(enhancedClient);

    // Configuración base para Argentina
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await preferenceInstance.create({
      body: {
        ...preferenceData,
        notification_url: process.env.MP_WEBHOOK_URL,
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
          ...preferenceData.back_urls,
        },
        auto_return: "approved",
        binary_mode: false,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        statement_descriptor: "RASTUCI",
        // Configurar métodos de pago permitidos
        payment_methods: {
          excluded_payment_methods: [], // Permitir todos
          excluded_payment_types: [], // Permitir todos los tipos
          installments: 12, // Máximo 12 cuotas
          default_installments: 1,
          ...preferenceData.payment_methods,
        },
      },
    });

    return result;
  } catch (error) {
    // Log error detail for diagnostics. Avoid printing full env or tokens.
    try {
      // Some SDK errors include response/data fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = error as any;
      if (anyErr?.response) {
        console.error(
          "Preference creation error response status:",
          anyErr.response?.status,
        );
        console.error(
          "Preference creation error response data:",
          anyErr.response?.data || anyErr.response?.body || anyErr.response,
        );
      } else {
        console.error(
          "Error creating preference:",
          error instanceof Error ? error.message : error,
        );
      }
    } catch (logErr) {
      console.error("Error while logging preference error:", logErr);
    }

    throw new Error(
      `Preference creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Función para obtener información de un pago con reintento
export async function getPayment(paymentId: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await payment.get({ id: paymentId });
      return result;
    } catch (error) {
      console.error(`Error getting payment (attempt ${i + 1}):`, error);
      if (i === retries - 1) {
        throw new Error(
          `Payment retrieval failed after ${retries} attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Función para generar clave de idempotencia única
function generateIdempotencyKey(): string {
  return `rastuci_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Función para validar webhook de MercadoPago
export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  ts: string,
): boolean {
  try {
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("MP_WEBHOOK_SECRET not configured");
      return true; // En desarrollo permitir sin validación
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(manifest);
    const expectedSignature = hmac.digest("hex");

    // Extraer la firma del header x-signature
    const signature = xSignature
      .split(",")
      .find((s: string) => s.trim().startsWith("v1="))
      ?.split("=")[1];

    return signature === expectedSignature;
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
}

// Configuración pública para el frontend
export const mercadoPagoConfig = {
  publicKey: process.env.MP_PUBLIC_KEY || "",
  locale: "es-AR" as const,
  theme: {
    elementsColor: "#e91e63", // Color primario de Rastuci
    headerColor: "#e91e63",
  },
  // URLs para diferentes ambientes
  checkoutUrl:
    process.env.NODE_ENV === "production"
      ? "https://www.mercadopago.com.ar/checkout/v1/redirect"
      : "https://sandbox.mercadopago.com.ar/checkout/v1/redirect",
};
