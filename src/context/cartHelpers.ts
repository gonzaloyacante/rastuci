import { analytics } from "@/lib/analytics/index";
import { Agency } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { Product } from "@/types";
import {
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";
import { formatCurrency } from "@/utils/formatters";

export function getEffectivePrice(product: Product): number {
  return product.onSale && product.salePrice != null
    ? product.salePrice
    : product.price;
}

export function upsertCartItem(
  prevItems: CartItem[],
  product: Product,
  quantity: number,
  size: string,
  color: string
): CartItem[] {
  const existingIdx = prevItems.findIndex(
    (item) =>
      item.product.id === product.id &&
      item.size === size &&
      item.color === color
  );

  if (existingIdx > -1) {
    const updated = [...prevItems];
    updated[existingIdx] = {
      ...updated[existingIdx],
      quantity: updated[existingIdx].quantity + quantity,
    };
    return updated;
  }

  const variant = product.variants?.find(
    (v) => v.color === color && v.size === size
  );
  return [
    ...prevItems,
    {
      product,
      quantity,
      size,
      color,
      variantId: variant?.id,
      sku: variant?.sku ?? undefined,
    },
  ];
}

export function validatePlaceOrder(
  customerInfo: CustomerInfo | null,
  selectedPaymentMethod: PaymentMethod | null,
  selectedShippingOption: ShippingOption | null
): string | null {
  if (!customerInfo) return "Falta información del cliente";
  if (!selectedPaymentMethod) return "Por favor selecciona un método de pago";
  if (selectedPaymentMethod.id === "cash") {
    if (!selectedShippingOption || selectedShippingOption.id !== "pickup") {
      return "Para pago en efectivo debe seleccionar retiro en tienda";
    }
  } else if (!selectedShippingOption) {
    return "Por favor selecciona un método de envío";
  }
  return null;
}

export async function validateCouponResponse(
  result: { success: boolean; coupon?: Record<string, unknown> },
  getCurrentTotal: () => number
): Promise<Coupon | null> {
  if (!result.success || !result.coupon) return null;
  const coupon = result.coupon as unknown as Coupon & {
    minOrderTotal?: number;
  };
  if (
    coupon.minOrderTotal != null &&
    getCurrentTotal() < coupon.minOrderTotal
  ) {
    throw new Error(
      `El monto mínimo para este cupón es ${formatCurrency(coupon.minOrderTotal)}`
    );
  }
  return coupon;
}

export async function fetchCheckout(body: unknown): Promise<Response> {
  return fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export interface PlaceOrderDeps {
  cartItems: CartItem[];
  customerInfo: CustomerInfo | null;
  selectedPaymentMethod: PaymentMethod | null;
  selectedShippingOption: ShippingOption | null;
  selectedAgency: Agency | null;
  appliedCoupon: Coupon | null;
  orderSummary: {
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
  };
  clearCart: () => void;
}

export type CartPlaceOrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
  redirectUrl?: string;
  paymentMethod?: string;
};

async function parseCheckoutResponse(
  response: Response
): Promise<CartPlaceOrderResult | null> {
  if (response.ok) return null;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const err = await response.json();
    return {
      success: false,
      error: err.error || "Error al procesar el pedido",
    };
  }
  return { success: false, error: `Error de red: HTTP ${response.status}` };
}

function resolveOrderResult(
  result: Record<string, unknown>,
  total: number,
  clearCart: () => void
): CartPlaceOrderResult {
  analytics.trackPurchase(
    (result.orderId as string) || "temp_id",
    total,
    "ARS",
    result.items as Record<string, unknown>[]
  );

  if (result.paymentMethod === "mercadopago" && result.initPoint) {
    return {
      success: true,
      redirectUrl: result.initPoint as string,
      paymentMethod: "mercadopago",
    };
  }
  if (result.paymentMethod === "cash" || result.paymentMethod === "transfer") {
    clearCart();
    return {
      success: true,
      orderId: result.orderId as string,
      paymentMethod: result.paymentMethod as string,
    };
  }
  return { success: true, orderId: result.orderId as string };
}

export async function executePlaceOrder(
  deps: PlaceOrderDeps
): Promise<CartPlaceOrderResult> {
  const {
    cartItems,
    customerInfo,
    selectedPaymentMethod,
    selectedShippingOption,
    selectedAgency,
    appliedCoupon,
    orderSummary,
    clearCart,
  } = deps;

  try {
    const response = await fetchCheckout({
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: getEffectivePrice(item.product),
        size: item.size,
        color: item.color,
      })),
      customer: customerInfo,
      shippingMethod: selectedShippingOption,
      shippingAgency: selectedAgency,
      paymentMethod: selectedPaymentMethod!.id,
      couponCode: appliedCoupon?.code,
      orderData: orderSummary,
    });

    const httpError = await parseCheckoutResponse(response);
    if (httpError) return httpError;

    const result = await response.json();
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Error al procesar el pedido",
      };
    }

    return resolveOrderResult(result, orderSummary.total, clearCart);
  } catch (error) {
    logger.error("Error al procesar pedido", { error });
    return {
      success: false,
      error: "Error de conexión. Por favor intenta nuevamente.",
    };
  }
}
