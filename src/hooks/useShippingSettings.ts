"use client";

import {
  defaultShippingSettings,
  ShippingSettings,
  ShippingSettingsSchema,
} from "@/lib/validation/shipping";
import useSWR from "swr";

const fetcher = async (url: string): Promise<ShippingSettings> => {
  const res = await fetch(url);
  const json = await res.json();

  if (json?.success && json.data) {
    const parsed = ShippingSettingsSchema.safeParse(json.data);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return defaultShippingSettings;
};

export function useShippingSettings() {
  const { data, error, isLoading, mutate } = useSWR<ShippingSettings>(
    "/api/cms?key=shipping",
    fetcher,
    {
      fallbackData: defaultShippingSettings,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const updateShipping = async (settings: Partial<ShippingSettings>) => {
    try {
      const newSettings = { ...data, ...settings };
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "shipping", value: newSettings }),
      });

      if (response.ok) {
        mutate(newSettings as ShippingSettings);
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
