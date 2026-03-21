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
    type: "desktop" | "mobile" | "tablet";
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
