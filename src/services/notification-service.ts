import { validateWebhookSignature } from "@/lib/mercadopago";
import { logger } from "@/lib/logger";
import { MercadoPagoConfig, Payment } from "mercadopago";

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
    if (!xSignature || !xRequestId || !ts) return true; // Optional validation
    return validateWebhookSignature(xSignature, xRequestId, id, ts);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPayment(id: string): Promise<any> {
    try {
      return await this.payment.get({ id });
    } catch (error) {
      logger.error("[MPWebhookService] Error fetching payment", { id, error });
      throw error;
    }
  }
}

export const mpWebhookService = new MPWebhookService();
