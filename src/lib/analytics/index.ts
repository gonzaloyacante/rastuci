import { AnalyticsManager } from "./manager";

export { AnalyticsManager } from "./manager";
export { AnalyticsProvider, CustomAnalyticsProvider,GoogleAnalyticsProvider } from "./providers";
export type { AnalyticsEvent, ConversionFunnel,PageView, UserSession } from "./types";

// Global singleton — created only once per module load
export const analytics = new AnalyticsManager();

export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackProductView: analytics.trackProductView.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getVariant: analytics.getVariant.bind(analytics),
  };
}

export function withAnalytics<T extends (...args: unknown[]) => unknown>(
  fn: T,
  eventName: string,
  getProperties?: (...args: Parameters<T>) => Record<string, unknown>
): T {
  return ((...args: Parameters<T>) => {
    const properties = getProperties?.(...args);
    analytics.trackEvent(eventName, properties);
    return fn(...args);
  }) as T;
}
