import { logger } from "@/lib/logger";
import crypto from "crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Clean, single implementation of MercadoPago helper for server-side use.
// Includes diagnostic logging for SDK errors to help triage 500s from /api/checkout.

export type MPItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
};

// Local minimal types to satisfy SDK call shapes without using `any`.
type PreferenceRequestLike = {
  items: {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }[];
  payer?: Record<string, unknown>;
  back_urls?: Record<string, string>;
  notification_url?: string;
  auto_return?: string;
  binary_mode?: boolean;
  external_reference?: string;
  metadata?: Record<string, unknown>;
};
type PaymentCreateLike = Record<string, unknown>;
type PaymentGetDataLike = { id: string };

function genIdempotency() {
  return `rastuci_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getNotificationUrl() {
  const candidate = process.env.MP_WEBHOOK_URL;
  if (candidate) {
    return candidate;
  }
  return `${getBaseUrl()}/api/payments/mercadopago/webhook`;
}

async function safeCreate<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // capture and log SDK error details if present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    try {
      logger.error("[mercadopago] SDK error", { message: e?.message ?? e });
      if (e?.response) {
        logger.error("[mercadopago] SDK response status", {
          status: e.response.status,
        });
        logger.error("[mercadopago] SDK response data", {
          data: e.response.data ?? e.response,
        });
      }
    } catch (logErr) {
      logger.error("[mercadopago] error while logging SDK error", {
        error: logErr,
      });
    }

    const parts: string[] = [];
    if (e?.message) {
      parts.push(String(e.message));
    }
    if (e?.response?.status) {
      parts.push(`status:${e.response.status}`);
    }
    if (e?.response?.data) {
      try {
        parts.push(`response:${JSON.stringify(e.response.data)}`);
      } catch {
        parts.push("response:(unserializable)");
      }
    }

    throw new Error(
      parts.length ? parts.join(" | ") : "Unknown MercadoPago error"
    );
  }
}

export async function createPreference(
  items: MPItem[],
  payer?: Record<string, unknown>,
  idempotencyKey?: string
) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MP_ACCESS_TOKEN is not set");
  }

  const client = new MercadoPagoConfig({
    accessToken: token,
    options: {
      timeout: 10000,
      idempotencyKey: idempotencyKey || genIdempotency(),
    },
  });
  const pref = new Preference(client);

  const baseUrl = getBaseUrl();
  const body = {
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
      currency_id: i.currency_id || "ARS",
    })),
    payer: payer || undefined,
    back_urls: {
      success: `${baseUrl}/checkout/success`,
      failure: `${baseUrl}/checkout/failure`,
      pending: `${baseUrl}/checkout/pending`,
    },
    notification_url: getNotificationUrl(),
    auto_return: "approved",
    binary_mode: false,
  } as Record<string, unknown>;

  return await safeCreate(
    async () => await pref.create({ body: body as PreferenceRequestLike })
  );
}

export async function createPayment(
  paymentBody: Record<string, unknown>,
  idempotencyKey?: string
) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MP_ACCESS_TOKEN is not set");
  }

  const client = new MercadoPagoConfig({
    accessToken: token,
    options: {
      timeout: 10000,
      idempotencyKey: idempotencyKey || genIdempotency(),
    },
  });
  const pay = new Payment(client);

  const candidate =
    process.env.MP_WEBHOOK_URL ||
    `${getBaseUrl()}/api/payments/mercadopago/webhook`;
  try {
    new URL(candidate);
    (paymentBody as unknown as Record<string, unknown>).notification_url =
      candidate;
  } catch {
    /* empty */
  }

  return await safeCreate(
    async () => await pay.create({ body: paymentBody as PaymentCreateLike })
  );
}

export async function getPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MP_ACCESS_TOKEN is not set");
  }

  const client = new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 10000 },
  });
  const pay = new Payment(client);

  try {
    return await pay.get({ id: paymentId } as PaymentGetDataLike);
  } catch (err) {
    logger.error("[mercadopago] getPayment error", { error: err });
    throw err;
  }
}

export function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  ts: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  } // allow if secret not configured (dev)

  try {
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const h = crypto.createHmac("sha256", secret);
    h.update(manifest);
    const expected = h.digest("hex");
    const signature = xSignature
      .split(",")
      .find((s) => s.trim().startsWith("v1="))
      ?.split("=")[1];
    return signature === expected;
  } catch (e) {
    logger.error("[mercadopago] validateWebhookSignature error", { error: e });
    return false;
  }
}

export const mercadoPagoConfig = {
  publicKey: process.env.MP_PUBLIC_KEY || "",
  locale: "es-AR" as const,
};
