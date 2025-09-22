import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const analyticsEventSchema = z.object({
  name: z.string(),
  properties: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string().transform(str => new Date(str)),
});

const analyticsRequestSchema = z.object({
  events: z.array(analyticsEventSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = analyticsRequestSchema.parse(body);

    // Here you would typically save to your analytics database
    // For demo purposes, we'll just log the events
    console.log('Analytics events received:', events);

    // In a real implementation, you might:
    // 1. Save to a time-series database like InfluxDB or TimescaleDB
    // 2. Send to external analytics services
    // 3. Process for real-time dashboards
    // 4. Queue for batch processing

    // Example: Save to database
    // await saveAnalyticsEvents(events);

    // Example: Send to external service
    // await sendToExternalAnalytics(events);

    return NextResponse.json({ 
      success: true, 
      eventsProcessed: events.length 
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
}
