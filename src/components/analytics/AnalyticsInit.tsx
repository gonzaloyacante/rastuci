"use client";

import { useAnalytics } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsInit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view on route change
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    trackPageView(url);
  }, [pathname, searchParams, trackPageView]);

  return null;
}
