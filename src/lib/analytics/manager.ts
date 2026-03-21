import { logger } from "@/lib/logger";

import {
  AnalyticsProvider,
  CustomAnalyticsProvider,
  GoogleAnalyticsProvider,
} from "./providers";
import type { AnalyticsEvent, PageView, UserSession } from "./types";

export class AnalyticsManager {
  private session: UserSession | null = null;
  private pageStartTime: Date | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;
  private providers: AnalyticsProvider[] = [];
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    void this.init();
  }

  private async init() {
    if (typeof window === "undefined") {
      return;
    }

    await this.initSession();
    this.trackPageView();
    this.setupEventListeners();
    await this.initProviders();

    // Store interval id to allow cleanup
    this.flushIntervalId = setInterval(() => this.flushEvents(), 30000);
  }

  destroy() {
    if (this.flushIntervalId !== null) {
      clearInterval(this.flushIntervalId);
      this.flushIntervalId = null;
    }
  }

  private async initSession() {
    const sessionId = this.getOrCreateSessionId();
    const userId = this.getUserId();

    this.session = {
      id: sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      events: [],
      device: this.getDeviceInfo(),
      location: await this.getLocationInfo(),
    };
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        sessionStorage.setItem("analytics_session_id", sessionId);
      } catch {
        /* noop — QuotaExceededError */
      }
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    return localStorage.getItem("user_id") || undefined;
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
      type: this.getDeviceType(),
      os: this.getOS(ua),
      browser: this.getBrowser(ua),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  private getDeviceType(): "desktop" | "mobile" | "tablet" {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  private getOS(ua: string): string {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Unknown";
  }

  private getBrowser(ua: string): string {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private async getLocationInfo() {
    try {
      const response = await fetch("/api/analytics/location");
      return await response.json();
    } catch {
      return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    }
  }

  private setupEventListeners() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackEvent("page_hidden");
      } else {
        this.trackEvent("page_visible");
      }
    });

    let scrollDepth = 0;
    const trackScroll = () => {
      const depth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (depth > scrollDepth && depth % 25 === 0) {
        scrollDepth = depth;
        this.trackEvent("scroll_depth", { depth });
      }
    };
    window.addEventListener("scroll", trackScroll, { passive: true });

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "A" || target.closest("a")) {
        const link = target.closest("a");
        this.trackEvent("link_click", {
          url: link?.href,
          text: link?.textContent?.trim(),
          external: link?.hostname !== window.location.hostname,
        });
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent("form_submit", {
        formId: form.id,
        action: form.action,
      });
    });

    window.addEventListener("error", (event) => {
      this.trackEvent("javascript_error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.trackEvent("unhandled_promise_rejection", {
        reason: event.reason?.toString(),
      });
    });
  }

  private async initProviders() {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      this.providers.push(
        new GoogleAnalyticsProvider(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
      );
    }

    const customProvider = new CustomAnalyticsProvider("/api/analytics/events");
    customProvider.setSessionGetter(() => this.session);
    this.providers.push(customProvider);

    await Promise.all(this.providers.map((provider) => provider.init()));
  }

  setUserId(userId: string) {
    try {
      localStorage.setItem("user_id", userId);
    } catch {
      /* noop — QuotaExceededError */
    }
    if (this.session) {
      this.session.userId = userId;
    }
    this.trackEvent("user_identified", { userId });
  }

  trackEvent(name: string, properties?: Record<string, unknown> | object) {
    if (!this.isEnabled || !this.session) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      userId: this.session.userId,
      sessionId: this.session.id,
      timestamp: new Date(),
    };

    this.eventQueue.push(event);
    this.session.events.push(event);
    this.session.lastActivity = new Date();

    if (this.isImportantEvent(name)) {
      void this.flushEvents();
    }
  }

  trackPageView(url?: string, title?: string) {
    if (!this.isEnabled || !this.session) {
      return;
    }

    if (this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime.getTime();
      this.trackEvent("page_duration", { duration });
    }

    const pageView: PageView = {
      url: url || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date(),
      userId: this.session.userId,
      sessionId: this.session.id,
    };

    this.session.pageViews++;
    this.pageStartTime = new Date();
    this.trackEvent("page_view", pageView);
  }

  trackConversion(step: string, properties?: Record<string, unknown>) {
    this.trackEvent("conversion_funnel", { step, ...properties });
  }

  trackPurchase(
    orderId: string,
    value: number,
    currency = "ARS",
    items?: Array<Record<string, unknown>>
  ) {
    this.trackEvent("purchase", { orderId, value, currency, items });
  }

  trackAddToCart(productId: string, value: number, currency = "ARS") {
    this.trackEvent("add_to_cart", { productId, value, currency });
  }

  trackSearch(query: string, results?: number) {
    this.trackEvent("search", { query, results });
  }

  trackProductView(
    productId: string,
    productName: string,
    category?: string,
    value?: number
  ) {
    this.trackEvent("view_item", { productId, productName, category, value });
  }

  private isImportantEvent(name: string): boolean {
    const importantEvents = [
      "purchase",
      "add_to_cart",
      "begin_checkout",
      "user_identified",
    ];
    return importantEvents.includes(name);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    await Promise.all(
      this.providers.map((provider) =>
        provider
          .sendEvents(events)
          .catch((err) =>
            logger.error("Provider sendEvents failed", { error: err })
          )
      )
    );
  }

  trackPerformance() {
    if (!("performance" in window)) {
      return;
    }

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.trackEvent("page_performance", {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      });
    }
  }

  private getFirstPaint(): number | undefined {
    const paint = performance
      .getEntriesByType("paint")
      .find((entry) => entry.name === "first-paint");
    return paint?.startTime;
  }

  private getFirstContentfulPaint(): number | undefined {
    const paint = performance
      .getEntriesByType("paint")
      .find((entry) => entry.name === "first-contentful-paint");
    return paint?.startTime;
  }

  getVariant(experimentId: string, variants: string[]): string {
    const key = `experiment_${experimentId}`;
    let variant = localStorage.getItem(key);

    if (!variant) {
      variant = variants[Math.floor(Math.random() * variants.length)];
      try {
        localStorage.setItem(key, variant);
      } catch {
        /* noop — QuotaExceededError */
      }
      this.trackEvent("experiment_assignment", { experimentId, variant });
    }

    return variant;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem("analytics_enabled", enabled.toString());
    } catch {
      /* noop — QuotaExceededError */
    }
  }

  isAnalyticsEnabled(): boolean {
    const stored = localStorage.getItem("analytics_enabled");
    return stored !== "false";
  }

  clearData() {
    this.eventQueue = [];
    sessionStorage.removeItem("analytics_session_id");
    localStorage.removeItem("user_id");
  }
}
