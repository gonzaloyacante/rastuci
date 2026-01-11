"use client";

import {
  defaultShippingSettings,
  ShippingSettings,
} from "@/lib/validation/shipping";
import useSWR from "swr";

// const fetcher = async (url: string): Promise<ShippingSettings> => {
//   try {
//     const res = await fetch(url);
//
//     // Si es 404 u otro error, usar defaults
//     if (!res.ok) {
//       return defaultShippingSettings;
//     }
//
//     const json = await res.json();
//
//     if (json?.success && json.data) {
//       const parsed = ShippingSettingsSchema.safeParse(json.data);
//       if (parsed.success) {
//         return parsed.data;
//       }
//     }
//
//     return defaultShippingSettings;
//   } catch {
//     return defaultShippingSettings;
//   }
// };

export function useShippingSettings() {
  const { data, error, isLoading, mutate } = useSWR<ShippingSettings>(
    "/api/settings/store",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) return defaultShippingSettings;
      const json = await res.json();

      // Merge: El admin controla freeShipping, los labels vienen de defaults
      // StoreSettings.shipping solo tiene { freeShipping: boolean }
      // ShippingSettings tiene labels, descriptions, etc.
      const adminShipping = json.data?.shipping;

      return {
        ...defaultShippingSettings,
        // Override con el valor del admin si existe
        freeShipping:
          adminShipping?.freeShipping ?? defaultShippingSettings.freeShipping,
      };
    },
    {
      fallbackData: defaultShippingSettings,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const updateShipping = async (settings: Partial<ShippingSettings>) => {
    try {
      // First get current store settings
      const currentRes = await fetch("/api/settings/store");
      const currentData = await currentRes.json();

      if (!currentData.success)
        throw new Error("Error fetching store settings");

      const newStoreSettings = {
        ...currentData.data,
        shipping: {
          ...(currentData.data.shipping || defaultShippingSettings),
          ...settings,
        },
      };

      const response = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStoreSettings),
      });

      if (response.ok) {
        mutate({ ...data, ...settings } as ShippingSettings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    shipping: data || defaultShippingSettings,
    isLoading,
    error,
    updateShipping,
    mutate,
  };
}
