import { MercadoPagoConfig, Payment } from "mercadopago";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

import { logger } from "@/lib/logger";
import { validateWebhookSignature } from "@/lib/mercadopago";

export class MPWebhookService {
  private client: MercadoPagoConfig;
  private payment: Payment;

  constructor() {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN required");

    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 10000 },
    });
    this.payment = new Payment(this.client);
  }

  validateSignature(
    xSignature: string,
    xRequestId: string,
    id: string,
    ts: string
  ): boolean {
    if (!xSignature || !xRequestId || !ts) return false; // Fail-closed: missing headers = invalid
    return validateWebhookSignature(xSignature, xRequestId, id, ts);
  }

  async getPayment(id: string): Promise<PaymentResponse> {
    try {
      return await this.payment.get({ id });
    } catch (error) {
      logger.error("[MPWebhookService] Error fetching payment", { id, error });
      throw error;
    }
  }
}

export const mpWebhookService = new MPWebhookService();
