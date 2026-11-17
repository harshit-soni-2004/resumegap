import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent, logFeedback } from '@/lib/analytics-store';
import { FeedbackPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FeedbackPayload;

    if (typeof body.helpful !== 'boolean') {
      return NextResponse.json({ error: 'helpful field (boolean) is required' }, { status: 400 });
    }

    const payload: FeedbackPayload = {
      sessionId: body.sessionId || 'anonymous',
      helpful: body.helpful,
      comment: (body.comment || '').trim().slice(0, 500),
      score: body.score,
      createdAt: new Date().toISOString(),
    };

    await logFeedback(payload);

    // Also record an analytics event for the funnel
    await logAnalyticsEvent({
      sessionId: payload.sessionId,
      eventName: 'feedback_submitted',
      timestamp: payload.createdAt,
      data: {
        helpful: payload.helpful,
        hasComment: Boolean(payload.comment),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[Feedback Route Error]:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
