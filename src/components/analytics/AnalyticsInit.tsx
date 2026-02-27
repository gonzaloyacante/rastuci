"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAnalytics } from "@/lib/analytics";

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
