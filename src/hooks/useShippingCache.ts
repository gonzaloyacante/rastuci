import { useCallback, useRef, useState } from "react";

import { logger } from "@/lib/logger";
import { Agency, ShippingOption } from "@/types/cart";

/** Cache de opciones de envío y agencias — extraído de CartContext */
export function useShippingCache() {
  const shippingCacheRef = useRef<Record<string, ShippingOption[]>>({});
  const agencyCacheRef = useRef<Record<string, Agency[]>>({});

  // Mantener state solo para re-renders cuando cambian las opciones disponibles
  const [availableShippingOptions, setAvailableShippingOptions] = useState<
    ShippingOption[]
  >([]);

  const calculateShippingCost = useCallback(
    async (
      postalCode: string,
      deliveredType?: "D" | "S"
    ): Promise<ShippingOption[]> => {
      const cacheKey = `${postalCode}-${deliveredType || "D"}`;

      if (shippingCacheRef.current[cacheKey]) {
        logger.info("[useShippingCache] Usando cache para costo de envío", {
          cacheKey,
        });
        return shippingCacheRef.current[cacheKey];
      }

      try {
        const response = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postalCode, deliveredType }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(
              errorData.error ||
                `Error calculando envío (HTTP ${response.status})`
            );
          }
          throw new Error(`Error calculando envío: HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.options) {
          shippingCacheRef.current[cacheKey] = result.options;
          return result.options;
        }
        throw new Error(result.error || "Error calculando envío");
      } catch (error) {
        logger.error("Error calculando costo de envío:", { error });
        throw error;
      }
    },
    []
  );

  const getAgencies = useCallback(
    async (provinceCode: string): Promise<Agency[]> => {
      if (agencyCacheRef.current[provinceCode]) {
        logger.info("[useShippingCache] Usando cache para sucursales", {
          provinceCode,
        });
        return agencyCacheRef.current[provinceCode];
      }

      try {
        const response = await fetch(
          `/api/shipping/agencies?provinceCode=${provinceCode}`
        );

        if (!response.ok) {
          throw new Error(
            `Error obteniendo sucursales: HTTP ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success && result.agencies) {
          agencyCacheRef.current[provinceCode] = result.agencies;
          return result.agencies;
        }
        return [];
      } catch (error) {
        logger.error("Error obteniendo sucursales:", { error });
        return [];
      }
    },
    []
  );

  return {
    availableShippingOptions,
    setAvailableShippingOptions,
    calculateShippingCost,
    getAgencies,
  };
}
