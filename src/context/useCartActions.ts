import { useCallback, useState } from "react";

import { analytics } from "@/lib/analytics";
import { Product } from "@/types";
import { CartItem, Coupon } from "@/types/cart";

import { CartContextType } from "./cartContextDef";
import { getEffectivePrice, upsertCartItem } from "./cartHelpers";

interface UseCartActionsReturn {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: React.Dispatch<React.SetStateAction<Coupon | null>>;
  addToCart: CartContextType["addToCart"];
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
}

export function useCartActions(): UseCartActionsReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const addToCart = useCallback(
    (product: Product, a: number | string, b?: string, c?: string) => {
      const isQuantityForm = typeof a === "number";
      const quantity = isQuantityForm ? (a as number) : 1;
      const size = isQuantityForm ? (b as string) : (a as string);
      const color = isQuantityForm ? (c as string) : (b as string);
      if (!size) return;
      analytics.trackAddToCart(
        product.id,
        getEffectivePrice(product) * quantity
      );
      setCartItems((prev) =>
        upsertCartItem(prev, product, quantity, size, color)
      );
    },
    []
  ) as unknown as CartContextType["addToCart"];

  const removeFromCart = useCallback(
    (productId: string, size: string, color: string) => {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.size === size &&
              item.color === color
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId, size, color);
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          item.size === size &&
          item.color === color
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
  }, []);

  const getCartTotal = useCallback(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + getEffectivePrice(item.product) * item.quantity,
        0
      ),
    [cartItems]
  );

  const getItemCount = useCallback(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  return {
    cartItems,
    setCartItems,
    appliedCoupon,
    setAppliedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };
}
