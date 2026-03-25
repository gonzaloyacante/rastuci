import { createContext, useContext } from "react";

import { Agency } from "@/lib/correo-argentino-service";
import { Product } from "@/types";
import {
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: {
    (product: Product, quantity: number, size: string, color: string): void;
    (product: Product, size: string, color: string): void;
  };
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    newQuantity: number
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;

  availableShippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: (option: ShippingOption) => void;
  calculateShippingCost: (
    postalCode: string,
    deliveredType?: "D" | "S"
  ) => Promise<ShippingOption[]>;

  selectedAgency: Agency | null;
  setSelectedAgency: (agency: Agency | null) => void;
  getAgencies: (provinceCode: string) => Promise<Agency[]>;

  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;

  availableBillingOptions: BillingOption[];
  selectedBillingOption: BillingOption | null;
  setSelectedBillingOption: (option: BillingOption) => void;

  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  customerInfo: CustomerInfo | null;
  updateCustomerInfo: (info: CustomerInfo) => void;

  getOrderSummary: () => {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    customer: CustomerInfo | null;
    shippingOption: ShippingOption | null;
    payment: PaymentMethod | null;
    billing: BillingOption | null;
  };
  placeOrder: () => Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
    redirectUrl?: string;
    paymentMethod?: string;
  }>;
  loadCheckoutSettings: () => Promise<void>;
}

const _defaultCart: CartContextType = {
  cartItems: [],
  addToCart: (() => {}) as unknown as CartContextType["addToCart"],
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getItemCount: () => 0,
  availableShippingOptions: [],
  selectedShippingOption: null,
  setSelectedShippingOption: () => {},
  calculateShippingCost: async () => [],
  selectedAgency: null,
  setSelectedAgency: () => {},
  getAgencies: async () => [],
  availablePaymentMethods: [],
  selectedPaymentMethod: null,
  setSelectedPaymentMethod: () => {},
  availableBillingOptions: [],
  selectedBillingOption: null,
  setSelectedBillingOption: () => {},
  appliedCoupon: null,
  applyCoupon: async () => false,
  removeCoupon: () => {},
  customerInfo: null,
  updateCustomerInfo: () => {},
  getOrderSummary: () => ({
    items: [],
    subtotal: 0,
    shippingCost: 0,
    discount: 0,
    total: 0,
    customer: null,
    shippingOption: null,
    payment: null,
    billing: null,
  }),
  placeOrder: async () => ({ success: false, error: "CartProvider missing" }),
  loadCheckoutSettings: async () => {},
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  return context === undefined ? _defaultCart : context;
};

// Re-exportar tipos de @/types/cart para compatibilidad hacia atrás
export type {
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";
export type { PlaceOrderResult } from "@/types/cart";
export {
  AVAILABLE_BILLING_OPTIONS,
  DEFAULT_PAYMENT_METHOD,
} from "@/types/cart";
