"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to sync tab state with URL query params.
 * Allows tab state to persist across page refreshes.
 *
 * @param defaultTab - The default tab to show if none is specified in URL
 * @param paramName - The query param name to use (default: "tab")
 * @returns [activeTab, setActiveTab] - Current tab and setter function
 */
export function useTabWithUrl(
  defaultTab: string,
  paramName: string = "tab"
): [string, (tab: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial value from URL or use default
  const [activeTab, setActiveTabState] = useState(() => {
    const urlTab = searchParams.get(paramName);
    return urlTab || defaultTab;
  });

  // Sync state from URL on mount and when searchParams change
  useEffect(() => {
    const urlTab = searchParams.get(paramName);
    if (urlTab && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [searchParams, paramName, activeTab]);

  // Update URL when tab changes
  const setActiveTab = useCallback(
    (newTab: string) => {
      setActiveTabState(newTab);

      // Create new URLSearchParams with current params
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, newTab);

      // Update URL without full page reload
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName]
  );

  return [activeTab, setActiveTab];
}
