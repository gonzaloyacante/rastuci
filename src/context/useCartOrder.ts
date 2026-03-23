import { useCallback } from "react";

import { Agency } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { CartItem, Coupon, CustomerInfo, PaymentMethod, ShippingOption } from "@/types/cart";

import {
  executePlaceOrder,
  validateCouponResponse,
  validatePlaceOrder,
} from "./cartHelpers";

interface UseCartOrderDeps {
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  setAppliedCoupon: React.Dispatch<React.SetStateAction<Coupon | null>>;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo | null>>;
  selectedShippingOption: ShippingOption | null;
  selectedPaymentMethod: PaymentMethod | null;
  selectedAgency: Agency | null;
  getCartTotal: () => number;
  clearCart: () => void;
}

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customer: CustomerInfo | null;
  shippingOption: ShippingOption | null;
  payment: PaymentMethod | null;
  billing: unknown;
}

interface UseCartOrderReturn {
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  updateCustomerInfo: (info: CustomerInfo) => void;
  getOrderSummary: () => OrderSummary;
  placeOrder: () => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
}

export function useCartOrder(deps: UseCartOrderDeps): UseCartOrderReturn {
  const {
    cartItems,
    appliedCoupon,
    setAppliedCoupon,
    customerInfo,
    setCustomerInfo,
    selectedShippingOption,
    selectedPaymentMethod,
    selectedAgency,
    getCartTotal,
    clearCart,
  } = deps;

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const err = await response.json();
            throw new Error(err.error || "Error validando cupón");
          }
          throw new Error(`Error validando cupón: HTTP ${response.status}`);
        }
        const result = await response.json();
        const coupon = await validateCouponResponse(result, getCartTotal);
        if (coupon) {
          setAppliedCoupon(coupon);
          return true;
        }
        return false;
      } catch (error) {
        logger.error("Error al aplicar cupón:", { error });
        throw error;
      }
    },
    [getCartTotal, setAppliedCoupon]
  );

  const removeCoupon = useCallback(() => setAppliedCoupon(null), [setAppliedCoupon]);

  const updateCustomerInfo = useCallback(
    (info: CustomerInfo) => setCustomerInfo(info),
    [setCustomerInfo]
  );

  const getOrderSummary = useCallback((): OrderSummary => {
    const subtotal = getCartTotal();
    const shippingCost = selectedShippingOption?.price ?? 0;
    const discount = appliedCoupon
      ? appliedCoupon.discountType === "FIXED"
        ? Math.min(appliedCoupon.discount, subtotal)
        : (subtotal * appliedCoupon.discount) / 100
      : 0;
    return {
      items: cartItems,
      subtotal,
      shippingCost,
      discount,
      total: subtotal + shippingCost - discount,
      customer: customerInfo,
      shippingOption: selectedShippingOption,
      payment: selectedPaymentMethod,
      billing: null,
    };
  }, [
    cartItems,
    getCartTotal,
    selectedShippingOption,
    appliedCoupon,
    customerInfo,
    selectedPaymentMethod,
  ]);

  const placeOrder = useCallback(async () => {
    const validationError = validatePlaceOrder(
      customerInfo,
      selectedPaymentMethod,
      selectedShippingOption
    );
    if (validationError) return { success: false, error: validationError };
    const orderSummary = getOrderSummary();
    return executePlaceOrder({
      cartItems,
      customerInfo,
      selectedPaymentMethod,
      selectedShippingOption,
      selectedAgency,
      appliedCoupon,
      orderSummary,
      clearCart,
    });
  }, [
    customerInfo,
    selectedPaymentMethod,
    selectedShippingOption,
    cartItems,
    getOrderSummary,
    clearCart,
    selectedAgency,
    appliedCoupon,
  ]);

  return { applyCoupon, removeCoupon, updateCustomerInfo, getOrderSummary, placeOrder };
}
