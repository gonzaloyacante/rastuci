import { PAYMENT_METHODS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { StoreSettings } from "@/lib/validation/store";

type CheckoutPayments = StoreSettings["payments"];
export type ShowFn = (config: {
  type: string;
  title?: string;
  message: string;
}) => void;

export function getPaymentDiscount(
  method: string,
  payments: CheckoutPayments | undefined
): number {
  if (!payments) return 0;
  const discounts: Record<string, number | undefined> = {
    [PAYMENT_METHODS.CASH]: payments.cashDiscount,
    [PAYMENT_METHODS.TRANSFER]: payments.transferDiscount,
    [PAYMENT_METHODS.MERCADOPAGO]: payments.mpDiscount,
  };
  return discounts[method] ?? 0;
}

export function getPaymentMethodName(method: string): string {
  if (method === PAYMENT_METHODS.MERCADOPAGO) return "Mercado Pago";
  if (method === PAYMENT_METHODS.CASH) return "Efectivo";
  if (method === PAYMENT_METHODS.TRANSFER) return "Transferencia Bancaria";
  return "No seleccionado";
}

const VALID_MP_HOSTS = [
  "www.mercadopago.com.ar",
  "mercadopago.com.ar",
  "www.mercadopago.com",
  "mercadopago.com",
  "www.mercadolibre.com",
  "mercadolibre.com",
];

export function isValidMercadoPagoUrl(initPoint: string): boolean {
  try {
    const url = new URL(initPoint);
    return VALID_MP_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function isCheckoutCustomerValid(data: {
  email: string;
  firstName: string;
  lastName: string;
}): boolean {
  return !!(data.email && data.firstName && data.lastName);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error procesando el pago";
}

export function buildCheckoutCustomer(
  formData: { firstName: string; lastName: string; email: string },
  contextInfo:
    | {
        phone?: string;
        address?: string;
        city?: string;
        province?: string;
        postalCode?: string;
      }
    | null
    | undefined
) {
  return {
    name: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    phone: contextInfo?.phone ?? "",
    address: contextInfo?.address ?? "",
    city: contextInfo?.city ?? "",
    province: contextInfo?.province ?? "",
    postalCode: contextInfo?.postalCode ?? "",
  };
}

export async function parseCheckoutError(response: Response): Promise<Error> {
  const errorData = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };
  return new Error(
    errorData.error || errorData.message || "Error al procesar el pedido"
  );
}

export function handleCheckoutSuccess(
  data: {
    paymentMethod?: string;
    initPoint?: string;
    orderId?: string;
    message?: string;
  },
  show: ShowFn
): void {
  if (data.paymentMethod === PAYMENT_METHODS.MERCADOPAGO && data.initPoint) {
    if (isValidMercadoPagoUrl(data.initPoint)) {
      window.location.href = data.initPoint;
      return;
    }
    logger.error("[Checkout] Blocked suspicious redirect URL", {
      initPoint: data.initPoint,
    });
    show({
      type: "error",
      title: "Error",
      message: "Error al procesar el pago. Contacta al soporte.",
    });
    return;
  }
  if (data.orderId) {
    window.location.href = `/checkout/success?orderId=${data.orderId}&method=${data.paymentMethod}`;
    return;
  }
  show({
    type: "success",
    title: "Pedido Creado",
    message: data.message ?? "",
  });
}
