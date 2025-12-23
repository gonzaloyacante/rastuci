import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const analyticsEventSchema = z.object({
  name: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string().transform((str) => new Date(str)),
  // Extended fields for better tracking
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  timezone: z.string().optional(),
});

const analyticsRequestSchema = z.object({
  events: z.array(analyticsEventSchema),
  session: z
    .object({
      id: z.string(),
      userId: z.string().optional(),
      deviceType: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      screenWidth: z.number().optional(),
      screenHeight: z.number().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      timezone: z.string().optional(),
      entryPage: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 60 requests per minute per IP for analytics
    const rl = await checkRateLimit(request, {
      key: "analytics:events",
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json({ success: true, warning: "Rate limited" });
    }

    const body = await request.json();
    const { events, session } = analyticsRequestSchema.parse(body);

    // Ensure session exists in database
    if (session?.id) {
      await prisma.analytics_sessions.upsert({
        where: { id: session.id },
        create: {
          id: session.id,
          userId: session.userId,
          deviceType: session.deviceType,
          browser: session.browser,
          os: session.os,
          screenWidth: session.screenWidth,
          screenHeight: session.screenHeight,
          country: session.country,
          city: session.city,
          timezone: session.timezone,
          entryPage: session.entryPage,
          pageViews: 0,
        },
        update: {
          // Update last activity info
          pageViews: {
            increment: events.filter((e) => e.name === "page_view").length,
          },
          exitPage: events.find((e) => e.name === "page_view")?.pageUrl,
        },
      });
    }

    // Insert all events
    if (events.length > 0 && session?.id) {
      await prisma.analytics_events.createMany({
        data: events.map((event) => ({
          sessionId: session.id,
          userId: event.userId,
          eventName: event.name,
          eventData: (event.properties || {}) as Prisma.InputJsonValue,
          pageUrl: event.pageUrl,
          referrer: event.referrer,
          deviceType: event.deviceType,
          browser: event.browser,
          os: event.os,
          country: event.country,
          city: event.city,
        })),
        skipDuplicates: true,
      });

      // Handle special events
      for (const event of events) {
        // Track search queries
        if (event.name === "search" && event.properties) {
          const props = event.properties as Record<string, unknown>;
          await prisma.search_analytics.create({
            data: {
              sessionId: session.id,
              userId: event.userId,
              query: String(props.query || ""),
              resultsCount:
                typeof props.results === "number" ? props.results : null,
            },
          });
        }

        // Track purchase conversion
        if (event.name === "purchase") {
          const props = event.properties as Record<string, unknown>;
          await prisma.analytics_sessions.update({
            where: { id: session.id },
            data: {
              isConverted: true,
              conversionValue:
                typeof props.value === "number" ? props.value : null,
            },
          });
        }
      }
    }

    logger.info("Analytics events persisted:", { count: events.length });

    return NextResponse.json({
      success: true,
      eventsProcessed: events.length,
    });
  } catch (error) {
    logger.error("Analytics API error:", { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
