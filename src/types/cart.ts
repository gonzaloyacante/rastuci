// Tipos del carrito y checkout — exportados desde CartContext para compatibilidad
// Este archivo centraliza las interfaces para evitar que vivan en el contexto

import { Agency } from "@/lib/correo-argentino-service";
import { Product } from "@/types";

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  originalRate?: Record<string, unknown>;
  isFallback?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresShipping?: boolean;
}

export interface BillingOption {
  id: string;
  name: string;
  requiresDocument: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: "PERCENTAGE" | "FIXED";
  isValid: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  variantId?: string;
  sku?: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customer: CustomerInfo | null;
  shippingOption: ShippingOption | null;
  payment: PaymentMethod | null;
  billing: BillingOption | null;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  redirectUrl?: string;
  paymentMethod?: string;
}

export const AVAILABLE_BILLING_OPTIONS: BillingOption[] = [
  { id: "consumer", name: "Consumidor Final", requiresDocument: false },
  { id: "invoiceA", name: "Factura A", requiresDocument: true },
  { id: "invoiceB", name: "Factura B", requiresDocument: true },
];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = {
  id: "mercadopago",
  name: "MercadoPago",
  icon: "wallet",
  description: "Paga con Mercado Pago usando tu cuenta o billetera",
};

// Re-export Agency for convenience
export type { Agency };
