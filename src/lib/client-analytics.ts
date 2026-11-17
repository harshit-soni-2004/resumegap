'use client';

const SESSION_STORAGE_KEY = 'resumegap_anonymous_session_id';
const LAST_VISIT_DATE_KEY = 'resumegap_last_visit_date';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  const today = new Date().toISOString().slice(0, 10);

  if (!sessionId) {
    // New visitor session
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    localStorage.setItem(LAST_VISIT_DATE_KEY, today);
  } else {
    // Existing visitor returning: check if on a different calendar day
    const lastVisitDate = localStorage.getItem(LAST_VISIT_DATE_KEY);
    if (lastVisitDate && lastVisitDate !== today) {
      const prevTime = new Date(lastVisitDate).getTime();
      const currTime = new Date(today).getTime();
      const daysSince = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));

      // Update date before dispatching so we only dispatch once per calendar day
      localStorage.setItem(LAST_VISIT_DATE_KEY, today);

      // Track returning visit
      trackEvent('returning_visit', {
        previousVisitDate: lastVisitDate,
        currentVisitDate: today,
        daysSinceLastVisit: Math.max(1, daysSince),
      });
    } else if (!lastVisitDate) {
      localStorage.setItem(LAST_VISIT_DATE_KEY, today);
    }
  }

  return sessionId;
}

export function trackEvent(
  eventName:
    | 'page_view'
    | 'resume_uploaded'
    | 'analysis_completed'
    | 'bullet_accepted'
    | 'bullet_rejected'
    | 'bullets_copied'
    | 'feedback_submitted'
    | 'gemini_fallback'
    | 'returning_visit',
  data?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();

  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventName,
        timestamp: new Date().toISOString(),
        data,
      }),
    }).catch(() => {
      // Fire-and-forget: do not block UX if offline
    });
  } catch {
    // Silent fail
  }
}
