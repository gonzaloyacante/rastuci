import { logger } from "@/lib/logger";

import type { AnalyticsEvent, UserSession } from "./types";

export abstract class AnalyticsProvider {
  abstract init(): Promise<void>;
  abstract sendEvents(events: AnalyticsEvent[]): Promise<void>;
}

export class GoogleAnalyticsProvider extends AnalyticsProvider {
  constructor(private measurementId: string) {
    super();
  }

  async init() {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    interface WindowWithDataLayer extends Window {
      dataLayer: unknown[];
      gtag: (...args: unknown[]) => void;
    }

    const windowWithDataLayer = window as unknown as WindowWithDataLayer;
    windowWithDataLayer.dataLayer = windowWithDataLayer.dataLayer || [];
    const gtag = (...args: unknown[]) =>
      windowWithDataLayer.dataLayer.push(args);
    windowWithDataLayer.gtag = gtag;

    gtag("js", new Date());
    gtag("config", this.measurementId);
  }

  async sendEvents(events: AnalyticsEvent[]) {
    const windowWithGtag = window as unknown as {
      gtag?: (...args: unknown[]) => void;
    };
    if (!windowWithGtag.gtag) {
      return;
    }

    events.forEach((event) => {
      const gaParams: Record<string, unknown> = {
        ...event.properties,
        custom_parameter_user_id: event.userId,
        custom_parameter_session_id: event.sessionId,
      };

      if (["purchase", "add_to_cart"].includes(event.name)) {
        if (event.properties && typeof event.properties === "object") {
          const props = event.properties as Record<string, unknown>;
          if (props.value) gaParams.value = props.value;
          if (props.currency) gaParams.currency = props.currency;
          if (props.items) gaParams.items = props.items;
        }
      }

      windowWithGtag.gtag!("event", event.name, gaParams);
    });
  }
}

export class CustomAnalyticsProvider extends AnalyticsProvider {
  private sessionGetter: (() => UserSession | null) | null = null;

  constructor(private endpoint: string) {
    super();
  }

  setSessionGetter(getter: () => UserSession | null) {
    this.sessionGetter = getter;
  }

  async init() {
    // No initialization needed for custom endpoint
  }

  async sendEvents(events: AnalyticsEvent[]) {
    try {
      const session = this.sessionGetter?.();
      const sessionData = session
        ? {
            id: session.id,
            userId: session.userId,
            deviceType: session.device.type,
            browser: session.device.browser,
            os: session.device.os,
            screenWidth: session.device.screen.width,
            screenHeight: session.device.screen.height,
            country: session.location?.country,
            city: session.location?.city,
            timezone: session.location?.timezone,
            entryPage: events.find((e) => e.name === "page_view")?.properties
              ? ((
                  events.find((e) => e.name === "page_view")
                    ?.properties as Record<string, unknown>
                )?.url as string)
              : undefined,
          }
        : undefined;

      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: events.map((e) => ({
            ...e,
            pageUrl:
              (e.properties as Record<string, unknown>)?.url ||
              window.location.pathname,
            referrer: document.referrer,
            deviceType: session?.device.type,
            browser: session?.device.browser,
            os: session?.device.os,
          })),
          session: sessionData,
        }),
      });
    } catch (error) {
      logger.error("Failed to send analytics events", { error });
    }
  }
}
