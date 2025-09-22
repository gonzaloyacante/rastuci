'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics, useAnalytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

interface AnalyticsContextType {
  trackEvent: (name: string, properties?: Record<string, any>) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackConversion: (step: string, properties?: Record<string, any>) => void;
  trackPurchase: (orderId: string, value: number, currency?: string, items?: any[]) => void;
  trackAddToCart: (productId: string, value: number, currency?: string) => void;
  trackSearch: (query: string, results?: number) => void;
  trackProductView: (productId: string, productName: string, category?: string, value?: number) => void;
  setUserId: (userId: string) => void;
  getVariant: (experimentId: string, variants: string[]) => string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const router = useRouter();
  const analyticsHook = useAnalytics();

  useEffect(() => {
    // Set user ID if provided
    if (userId) {
      analytics.setUserId(userId);
    }

    // Track performance metrics
    analytics.trackPerformance();

    // Track initial page view
    analytics.trackPageView();
  }, [userId]);

  // Track route changes
  useEffect(() => {
    const handleRouteChange = () => {
      analytics.trackPageView();
    };

    // Listen for route changes (Next.js App Router)
    const originalPush = router.push;
    router.push = (...args) => {
      const result = originalPush.apply(router, args);
      setTimeout(handleRouteChange, 100);
      return result;
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  return (
    <AnalyticsContext.Provider value={analyticsHook}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

// HOC for tracking component interactions
export function withAnalyticsTracking<P extends object>(
  Component: React.ComponentType<P>,
  eventName: string,
  getProperties?: (props: P) => Record<string, any>
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackEvent } = useAnalyticsContext();

    useEffect(() => {
      const properties = getProperties?.(props);
      trackEvent(eventName, properties);
    }, [props, trackEvent]);

    return <Component {...props} />;
  };
}
