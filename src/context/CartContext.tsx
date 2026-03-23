"use client";

// Re-exportar tipos y constantes para compatibilidad hacia atrás
export type {
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  PlaceOrderResult,
  ShippingOption,
} from "@/types/cart";
export {
  AVAILABLE_BILLING_OPTIONS,
  DEFAULT_PAYMENT_METHOD,
} from "@/types/cart";
export { useCart } from "./cartContextDef";
export { CartProvider } from "./CartProvider";
