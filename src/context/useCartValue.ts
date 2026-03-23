import { Dispatch, SetStateAction, useMemo } from "react";

import { useShippingCache } from "@/hooks/useShippingCache";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { Agency } from "@/lib/correo-argentino-service";
import {
  AVAILABLE_BILLING_OPTIONS,
  BillingOption,
  CartItem,
  Coupon,
  CustomerInfo,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";

import { CartContextType } from "./cartContextDef";

interface UseCartValueParams {
  cartItems: CartItem[];
  addToCart: CartContextType["addToCart"];
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: Dispatch<SetStateAction<ShippingOption | null>>;
  selectedAgency: Agency | null;
  setSelectedAgency: Dispatch<SetStateAction<Agency | null>>;
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
  selectedBillingOption: BillingOption | null;
  setSelectedBillingOption: Dispatch<SetStateAction<BillingOption | null>>;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  customerInfo: CustomerInfo | null;
  updateCustomerInfo: (info: CustomerInfo) => void;
  getOrderSummary: () => unknown;
  placeOrder: () => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  shippingCache: ReturnType<typeof useShippingCache>;
  checkoutSettings: ReturnType<typeof useCheckoutSettings>;
}

export function useCartValue(p: UseCartValueParams): CartContextType {
  return useMemo(
    (): CartContextType => ({
      cartItems: p.cartItems,
      addToCart: p.addToCart,
      removeFromCart: p.removeFromCart,
      updateQuantity: p.updateQuantity,
      clearCart: p.clearCart,
      getCartTotal: p.getCartTotal,
      getItemCount: p.getItemCount,
      availableShippingOptions: p.shippingCache.availableShippingOptions,
      selectedShippingOption: p.selectedShippingOption,
      setSelectedShippingOption: p.setSelectedShippingOption,
      calculateShippingCost: p.shippingCache.calculateShippingCost,
      selectedAgency: p.selectedAgency,
      setSelectedAgency: p.setSelectedAgency,
      getAgencies: p.shippingCache.getAgencies,
      availablePaymentMethods: p.checkoutSettings.availablePaymentMethods,
      selectedPaymentMethod: p.selectedPaymentMethod,
      setSelectedPaymentMethod: p.setSelectedPaymentMethod,
      availableBillingOptions: AVAILABLE_BILLING_OPTIONS,
      selectedBillingOption: p.selectedBillingOption,
      setSelectedBillingOption: p.setSelectedBillingOption,
      appliedCoupon: p.appliedCoupon,
      applyCoupon: p.applyCoupon,
      removeCoupon: p.removeCoupon,
      customerInfo: p.customerInfo,
      updateCustomerInfo: p.updateCustomerInfo,
      getOrderSummary: p.getOrderSummary as CartContextType["getOrderSummary"],
      placeOrder: p.placeOrder as CartContextType["placeOrder"],
      loadCheckoutSettings: p.checkoutSettings.loadCheckoutSettings,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      p.cartItems,
      p.addToCart,
      p.removeFromCart,
      p.updateQuantity,
      p.clearCart,
      p.getCartTotal,
      p.getItemCount,
      p.shippingCache.availableShippingOptions,
      p.selectedShippingOption,
      p.shippingCache.calculateShippingCost,
      p.selectedAgency,
      p.shippingCache.getAgencies,
      p.checkoutSettings.availablePaymentMethods,
      p.selectedPaymentMethod,
      p.selectedBillingOption,
      p.appliedCoupon,
      p.applyCoupon,
      p.removeCoupon,
      p.customerInfo,
      p.updateCustomerInfo,
      p.getOrderSummary,
      p.placeOrder,
      p.checkoutSettings.loadCheckoutSettings,
    ]
  );
}
