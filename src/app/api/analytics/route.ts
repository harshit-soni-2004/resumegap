import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent } from '@/lib/analytics-store';
import { AnalyticsEvent } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyticsEvent;

    if (!body.eventName) {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }

    await logAnalyticsEvent({
      sessionId: body.sessionId || 'anonymous',
      eventName: body.eventName,
      timestamp: body.timestamp || new Date().toISOString(),
      data: body.data || {},
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[Analytics Route Error]:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
