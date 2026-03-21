import { useEffect, useRef, useState } from "react";

import { CartItem, Coupon } from "@/types/cart";

const CART_STORAGE_KEY = "rastuci_cart";
const COUPON_STORAGE_KEY = "rastuci_coupon";

/**
 * Maneja la persistencia del carrito y el cupón en localStorage.
 * Extrae los 3 useEffect de persistencia que vivían en CartContext.
 */
export function useCartPersistence(
  cartItems: CartItem[],
  appliedCoupon: Coupon | null,
  setCartItems: (items: CartItem[]) => void,
  setAppliedCoupon: (coupon: Coupon | null) => void
): { hasLoadedStorage: boolean } {
  const hasLoadedStorage = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carga inicial desde localStorage
  useEffect(() => {
    if (hasLoadedStorage.current) return;
    hasLoadedStorage.current = true;

    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      // localStorage no disponible o datos corruptos — ignorar silenciosamente
    }

    try {
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon) as Coupon;
        if (parsed?.code) {
          setAppliedCoupon(parsed);
        }
      }
    } catch {
      // ídem
    }

    setIsLoaded(true);
  }, [setCartItems, setAppliedCoupon]);

  // Persiste carrito cuando cambia (solo después de cargar)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // En modo incógnito puede fallar — ignorar
    }
  }, [cartItems, isLoaded]);

  // Persiste cupón cuando cambia
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ídem
    }
  }, [appliedCoupon, isLoaded]);

  return { hasLoadedStorage: isLoaded };
}
