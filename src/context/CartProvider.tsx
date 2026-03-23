"use client";

import { ReactNode } from "react";

import { useCartPersistence } from "@/hooks/useCartPersistence";
import { useCheckoutSettings } from "@/hooks/useCheckoutSettings";
import { useShippingCache } from "@/hooks/useShippingCache";

import { CartContext } from "./cartContextDef";
import { useCartActions } from "./useCartActions";
import { useCartOrder } from "./useCartOrder";
import { useCartSelections } from "./useCartSelections";
import { useCartValue } from "./useCartValue";

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const sel = useCartSelections();
  const {
    cartItems, setCartItems, appliedCoupon, setAppliedCoupon,
    addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount,
  } = useCartActions();

  const { hasLoadedStorage } = useCartPersistence(cartItems, appliedCoupon, setCartItems, setAppliedCoupon);
  const shippingCache = useShippingCache();
  const checkoutSettings = useCheckoutSettings();
  const { applyCoupon, removeCoupon, updateCustomerInfo, getOrderSummary, placeOrder } =
    useCartOrder({
      cartItems, appliedCoupon, setAppliedCoupon,
      customerInfo: sel.customerInfo, setCustomerInfo: sel.setCustomerInfo,
      selectedShippingOption: sel.selectedShippingOption,
      selectedPaymentMethod: sel.selectedPaymentMethod,
      selectedAgency: sel.selectedAgency,
      getCartTotal, clearCart,
    });

  const value = useCartValue({
    cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
    getCartTotal, getItemCount,
    selectedShippingOption: sel.selectedShippingOption,
    setSelectedShippingOption: sel.setSelectedShippingOption,
    selectedAgency: sel.selectedAgency,
    setSelectedAgency: sel.setSelectedAgency,
    selectedPaymentMethod: sel.selectedPaymentMethod,
    setSelectedPaymentMethod: sel.setSelectedPaymentMethod,
    selectedBillingOption: sel.selectedBillingOption,
    setSelectedBillingOption: sel.setSelectedBillingOption,
    appliedCoupon, applyCoupon, removeCoupon,
    customerInfo: sel.customerInfo,
    updateCustomerInfo, getOrderSummary, placeOrder,
    shippingCache, checkoutSettings,
  });

  if (!hasLoadedStorage) return null;
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
