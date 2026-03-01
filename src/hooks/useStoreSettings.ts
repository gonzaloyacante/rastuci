"use strict";

import useSWR from "swr";

import { logger } from "@/lib/logger";
import {
  defaultStoreSettings,
  StoreSettings,
  StoreSettingsSchema,
} from "@/lib/validation/store";

export function useStoreSettings() {
  const { data, error, isLoading, mutate } = useSWR<StoreSettings>(
    "/api/settings/store",
    async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return defaultStoreSettings;
        const json = await res.json();

        if (json.success && json.data) {
          // Merge with defaults to ensure all fields exist
          // We don't strict parse because we want to be resilient to minor schema mismatches
          // or forward compatibility
          return {
            ...defaultStoreSettings,
            ...json.data,
            // Ensure nested objects are merged correctly if they exist in incoming data
            address: {
              ...defaultStoreSettings.address,
              ...(json.data.address || {}),
            },
            shipping: {
              ...defaultStoreSettings.shipping,
              ...(json.data.shipping || {}),
            },
            emails: {
              ...defaultStoreSettings.emails,
              ...(json.data.emails || {}),
            },
            stock: {
              ...defaultStoreSettings.stock,
              ...(json.data.stock || {}),
            },
            // stocksStatuses array is replaced, not merged, if it exists
            stockStatuses:
              json.data.stockStatuses || defaultStoreSettings.stockStatuses,
          };
        }
        return defaultStoreSettings;
      } catch (err) {
        logger.error("Error fetching store settings:", { error: err });
        return defaultStoreSettings;
      }
    },
    {
      fallbackData: defaultStoreSettings,
      revalidateOnFocus: false,
    }
  );

  const updateStoreSettings = async (
    newSettings: Partial<StoreSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Merge current data with new settings, ensuring defaults are present
      // If data is undefined, we start with defaults.
      const currentSettings = data || defaultStoreSettings;
      const mergedSettings = {
        ...currentSettings,
        ...newSettings,
      };

      // Validate before sending
      const parsed = StoreSettingsSchema.safeParse(mergedSettings);
      if (!parsed.success) {
        logger.error("Validation error:", { error: parsed.error });
        return {
          success: false,
          error: "Datos inválidos. Verifica los campos.",
        };
      }

      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedSettings),
      });
      if (!res.ok) throw new Error("Error al guardar la configuración");

      const json = await res.json();

      if (json.success) {
        await mutate(mergedSettings);
        return { success: true };
      } else {
        return { success: false, error: json.error || "Error al guardar" };
      }
    } catch (err) {
      logger.error("Error updating store settings:", { error: err });
      return { success: false, error: "Error de conexión" };
    }
  };

  return {
    settings: data || defaultStoreSettings,
    isLoading,
    error,
    updateStoreSettings,
    mutate,
  };
}
