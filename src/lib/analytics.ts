// Analytics and user behavior tracking utilities
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown> | object;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  events: AnalyticsEvent[];
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screen: { width: number; height: number };
  };
  location?: {
    country?: string;
    city?: string;
    timezone: string;
  };
}

export interface PageView {
  url: string;
  title: string;
  referrer?: string;
  timestamp: Date;
  duration?: number;
  userId?: string;
  sessionId: string;
}

export interface ConversionFunnel {
  step: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  properties?: Record<string, unknown>;
}

class AnalyticsManager {
  private session: UserSession | null = null;
  private pageStartTime: Date | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;
  private providers: AnalyticsProvider[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Initialize session
    await this.initSession();

    // Track page views
    this.trackPageView();

    // Set up event listeners
    this.setupEventListeners();

    // Initialize providers
    await this.initProviders();

    // Flush events periodically
    setInterval(() => this.flushEvents(), 30000); // Every 30 seconds
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
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('user_id') || undefined;
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

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private getOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private async getLocationInfo() {
    try {
      const response = await fetch('/api/analytics/location');
      return await response.json();
    } catch {
      return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    }
  }

  private setupEventListeners() {
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });

    // Scroll tracking
    let scrollDepth = 0;
    const trackScroll = () => {
      const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (depth > scrollDepth && depth % 25 === 0) {
        scrollDepth = depth;
        this.trackEvent('scroll_depth', { depth });
      }
    };
    window.addEventListener('scroll', trackScroll, { passive: true });

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        this.trackEvent('link_click', {
          url: link?.href,
          text: link?.textContent?.trim(),
          external: link?.hostname !== window.location.hostname,
        });
      }
    });

    // Form interactions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        action: form.action,
      });
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
      });
    });
  }

  private async initProviders() {
    // Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      this.providers.push(new GoogleAnalyticsProvider(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID));
    }

    // Custom analytics endpoint
    this.providers.push(new CustomAnalyticsProvider('/api/analytics/events'));

    // Initialize all providers
    await Promise.all(this.providers.map(provider => provider.init()));
  }

  // Public methods
  setUserId(userId: string) {
    localStorage.setItem('user_id', userId);
    if (this.session) {
      this.session.userId = userId;
    }
    this.trackEvent('user_identified', { userId });
  }

  trackEvent(name: string, properties?: Record<string, unknown> | object) {
    if (!this.isEnabled || !this.session) return;

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

    // Send to providers immediately for important events
    if (this.isImportantEvent(name)) {
      this.flushEvents();
    }
  }

  trackPageView(url?: string, title?: string) {
    if (!this.isEnabled || !this.session) return;

    // Track previous page duration
    if (this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime.getTime();
      this.trackEvent('page_duration', { duration });
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

    this.trackEvent('page_view', pageView);
  }

  trackConversion(step: string, properties?: Record<string, unknown>) {
    this.trackEvent('conversion_funnel', {
      step,
      ...properties,
    });
  }

  trackPurchase(orderId: string, value: number, currency: string = 'EUR', items?: Array<Record<string, unknown>>) {
    this.trackEvent('purchase', {
      orderId,
      value,
      currency,
      items,
    });
  }

  trackAddToCart(productId: string, value: number, currency: string = 'EUR') {
    this.trackEvent('add_to_cart', {
      productId,
      value,
      currency,
    });
  }

  trackSearch(query: string, results?: number) {
    this.trackEvent('search', {
      query,
      results,
    });
  }

  trackProductView(productId: string, productName: string, category?: string, value?: number) {
    this.trackEvent('view_item', {
      productId,
      productName,
      category,
      value,
    });
  }

  private isImportantEvent(name: string): boolean {
    const importantEvents = ['purchase', 'add_to_cart', 'begin_checkout', 'user_identified'];
    return importantEvents.includes(name);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Send to all providers
    await Promise.all(
      this.providers.map(provider => 
        provider.sendEvents(events).catch(console.error)
      )
    );
  }

  // Performance tracking
  trackPerformance() {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.trackEvent('page_performance', {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      });
    }
  }

  private getFirstPaint(): number | undefined {
    const paint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint');
    return paint?.startTime;
  }

  private getFirstContentfulPaint(): number | undefined {
    const paint = performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint');
    return paint?.startTime;
  }

  // A/B Testing
  getVariant(experimentId: string, variants: string[]): string {
    const key = `experiment_${experimentId}`;
    let variant = localStorage.getItem(key);
    
    if (!variant) {
      variant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(key, variant);
      
      this.trackEvent('experiment_assignment', {
        experimentId,
        variant,
      });
    }
    
    return variant;
  }

  // Privacy controls
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('analytics_enabled', enabled.toString());
  }

  isAnalyticsEnabled(): boolean {
    const stored = localStorage.getItem('analytics_enabled');
    return stored !== 'false';
  }

  clearData() {
    this.eventQueue = [];
    sessionStorage.removeItem('analytics_session_id');
    localStorage.removeItem('user_id');
  }
}

// Analytics providers
abstract class AnalyticsProvider {
  abstract init(): Promise<void>;
  abstract sendEvents(events: AnalyticsEvent[]): Promise<void>;
}

class GoogleAnalyticsProvider extends AnalyticsProvider {
  constructor(private measurementId: string) {
    super();
  }

  async init() {
    // Load Google Analytics
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    interface WindowWithDataLayer extends Window {
      dataLayer: unknown[];
      gtag: (...args: unknown[]) => void;
    }
    
    const windowWithDataLayer = window as unknown as WindowWithDataLayer;
    windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer || [];
    const gtag = (...args: unknown[]) => windowWithDataLayer.dataLayer.push(args);
    windowWithDataLayer.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId);
  }

  async sendEvents(events: AnalyticsEvent[]) {
    const windowWithGtag = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (!windowWithGtag.gtag) return;

    events.forEach(event => {
      windowWithGtag.gtag!('event', event.name, {
        ...event.properties,
        custom_parameter_user_id: event.userId,
        custom_parameter_session_id: event.sessionId,
      });
    });
  }
}

class CustomAnalyticsProvider extends AnalyticsProvider {
  constructor(private endpoint: string) {
    super();
  }

  async init() {
    // No initialization needed for custom endpoint
  }

  async sendEvents(events: AnalyticsEvent[]) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
    }
  }
}

// Global analytics instance
export const analytics = new AnalyticsManager();

// React hooks
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

// Utility functions
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
