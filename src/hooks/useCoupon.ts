import { useCallback, useState } from "react";

import { logger } from "@/lib/logger";
import { Coupon } from "@/types/cart";

/**
 * Maneja la lógica de cupones de descuento.
 * Extrae `applyCoupon` y `removeCoupon` de CartContext.
 */
export function useCoupon(getCartTotal: () => number) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const total = getCartTotal();
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, total }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          logger.warn("[useCoupon] Cupón inválido:", { code, result });
          return false;
        }

        setAppliedCoupon(result.coupon as Coupon);
        return true;
      } catch (error) {
        logger.error("[useCoupon] Error aplicando cupón:", { error });
        return false;
      }
    },
    [getCartTotal]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return { appliedCoupon, setAppliedCoupon, applyCoupon, removeCoupon };
}
