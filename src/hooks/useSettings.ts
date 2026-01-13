import useSWR, { SWRConfiguration } from "swr";

export type SettingsSection =
  | "store"
  | "stock"
  | "shipping"
  | "contact"
  | "home"
  | "faqs";

// Map sections to endpoints
const ENDPOINT_MAP: Record<string, string> = {
  contact: "/api/contact",
  home: "/api/home",
  // others default to /api/settings/${section}
};

// Generic fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export function useSettings<T>(section: string, config?: SWRConfiguration) {
  const endpoint = ENDPOINT_MAP[section] || `/api/settings/${section}`;

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: T;
    error?: string;
  }>(endpoint, fetcher, {
    revalidateOnFocus: false, // Default to false for forms to prevent overwriting drafts
    ...config,
  });

  return {
    settings: data?.data,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Error") : null,
    mutate,
  };
}
