import { useCallback, useState } from "react";

import { logger } from "@/lib/logger";
import { PaymentMethod, ShippingOption } from "@/types/cart";

interface CheckoutSettings {
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
}

/**
 * Carga y expone las opciones de envío y métodos de pago configurados en el backend.
 * Extrae `loadCheckoutSettings` de CartContext.
 */
export function useCheckoutSettings() {
  const [availableShippingOptions, setAvailableShippingOptions] = useState<
    ShippingOption[]
  >([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  const loadCheckoutSettings = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/checkout/settings");

      if (!response.ok) {
        logger.warn("[useCheckoutSettings] No se pudo cargar configuración", {
          status: response.status,
        });
        return;
      }

      const data = (await response.json()) as CheckoutSettings;

      if (data.shippingOptions) {
        setAvailableShippingOptions(data.shippingOptions);
      }
      if (data.paymentMethods) {
        setAvailablePaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      logger.error("[useCheckoutSettings] Error cargando configuración:", {
        error,
      });
    }
  }, []);

  return {
    availableShippingOptions,
    availablePaymentMethods,
    loadCheckoutSettings,
  };
}
