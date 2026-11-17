import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminStats, AnalyticsEvent, FeedbackPayload } from './types';

const isDevelopment = process.env.NODE_ENV === 'development';
const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

// In-memory fallback if filesystem write is restricted (e.g. Vercel serverless production)
const memoryEvents: AnalyticsEvent[] = [];
const memoryFeedback: FeedbackPayload[] = [];

// Initialize Supabase if environment variables are provided
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('[AnalyticsStore] Failed to initialize Supabase, using local fallback:', err instanceof Error ? err.message : 'Unknown');
  }
}

function ensureDataDir() {
  if (!isDevelopment) return; // Strict Vercel safety: never touch disk in production
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore in read-only environments
  }
}

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  if (!isDevelopment) return defaultVal; // Strict Vercel safety: no disk read in prod
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`[AnalyticsStore] Error reading ${filePath}:`, err instanceof Error ? err.message : 'Unknown');
  }
  return defaultVal;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  if (!isDevelopment) return; // Strict Vercel safety: no disk write in prod
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[AnalyticsStore] Error writing to ${filePath}, using in-memory store:`, err instanceof Error ? err.message : 'Unknown');
  }
}

/**
 * Logs an anonymous product analytics event without any PII or resume text.
 * Persists to Supabase in production or local JSON/memory in development.
 */
export async function logAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const eventWithId: AnalyticsEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  memoryEvents.push(eventWithId);

  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { error } = await supabase.from('analytics_events').insert({
        id: eventWithId.id,
        session_id: eventWithId.sessionId,
        event_name: eventWithId.eventName,
        timestamp: eventWithId.timestamp,
        data: eventWithId.data || {},
      });
      if (error) {
        // Redacted log: never output payload contents
        console.error('[AnalyticsStore] Supabase insert event failed:', error.message || error.code);
      } else {
        return;
      }
    } catch (err) {
      console.error('[AnalyticsStore] Supabase event write error:', err instanceof Error ? err.message : 'Unknown');
    }
  }

  // 2. Local filesystem fallback (strictly in development only)
  if (isDevelopment) {
    try {
      const existing = readJsonFile<AnalyticsEvent[]>(EVENTS_FILE, []);
      existing.push(eventWithId);
      const trimmed = existing.slice(-20000);
      writeJsonFile(EVENTS_FILE, trimmed);
    } catch (err) {
      console.warn('[AnalyticsStore] Fallback to in-memory events:', err instanceof Error ? err.message : 'Unknown');
    }
  }
}

/**
 * Logs a 1-click feedback submission.
 */
export async function logFeedback(feedback: FeedbackPayload): Promise<void> {
  memoryFeedback.push(feedback);

  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { error } = await supabase.from('feedback').insert({
        session_id: feedback.sessionId,
        helpful: feedback.helpful,
        comment: feedback.comment || null,
        score: feedback.score || null,
        created_at: feedback.createdAt,
      });
      if (error) {
        // Redacted log: never output payload contents
        console.error('[AnalyticsStore] Supabase insert feedback failed:', error.message || error.code);
      } else {
        return;
      }
    } catch (err) {
      console.error('[AnalyticsStore] Supabase feedback write error:', err instanceof Error ? err.message : 'Unknown');
    }
  }

  // 2. Local filesystem fallback (strictly in development only)
  if (isDevelopment) {
    try {
      const existing = readJsonFile<FeedbackPayload[]>(FEEDBACK_FILE, []);
      existing.push(feedback);
      writeJsonFile(FEEDBACK_FILE, existing.slice(-5000));
    } catch (err) {
      console.warn('[AnalyticsStore] Fallback to in-memory feedback:', err instanceof Error ? err.message : 'Unknown');
    }
  }
}

/**
 * Cohort retention calculation result.
 */
export interface CohortRetentionResult {
  cohortSize: number;
  returnedCount: number;
  returnRate: number; // 0 - 100
}

/**
 * Computes cohort return rate for a given window in days.
 * Definition:
 * - Cohort = unique non-anonymous sessions whose FIRST activity was at least `windowDays` ago (i.e. firstSeenTime <= now - windowDays * 24h).
 * - Returned = cohort sessions that had subsequent activity on a later calendar day (distinct calendar days > 1 or lastDay > firstDay)
 *              or triggered an explicit 'returning_visit' event.
 */
export function calculateCohortRetention(
  events: AnalyticsEvent[],
  windowDays: number,
  referenceDate: Date = new Date()
): CohortRetentionResult {
  const refTimeMs = referenceDate.getTime();
  const windowThresholdMs = refTimeMs - windowDays * 24 * 60 * 60 * 1000;

  // Track session first timestamp, last timestamp, distinct calendar days, and returning_visit flags
  const sessionData = new Map<
    string,
    {
      firstTimeMs: number;
      lastTimeMs: number;
      firstDay: string;
      lastDay: string;
      days: Set<string>;
      hasReturningVisit: boolean;
    }
  >();

  for (const ev of events) {
    if (!ev.sessionId || ev.sessionId === 'anonymous') continue;
    const t = new Date(ev.timestamp).getTime();
    if (isNaN(t)) continue;

    const day = ev.timestamp.slice(0, 10);
    const existing = sessionData.get(ev.sessionId);
    if (!existing) {
      sessionData.set(ev.sessionId, {
        firstTimeMs: t,
        lastTimeMs: t,
        firstDay: day,
        lastDay: day,
        days: new Set([day]),
        hasReturningVisit: ev.eventName === 'returning_visit',
      });
    } else {
      if (t < existing.firstTimeMs) {
        existing.firstTimeMs = t;
        existing.firstDay = day;
      }
      if (t > existing.lastTimeMs) {
        existing.lastTimeMs = t;
        existing.lastDay = day;
      }
      existing.days.add(day);
      if (ev.eventName === 'returning_visit') {
        existing.hasReturningVisit = true;
      }
    }
  }

  let cohortSize = 0;
  let returnedCount = 0;

  for (const [, data] of sessionData.entries()) {
    // Session is eligible for cohort only if it was first seen at least windowDays ago
    if (data.firstTimeMs <= windowThresholdMs) {
      cohortSize++;
      // A user is retained if they returned on a subsequent calendar day or triggered returning_visit
      if (data.days.size > 1 || data.lastDay > data.firstDay || data.hasReturningVisit) {
        returnedCount++;
      }
    }
  }

  const returnRate = cohortSize > 0 ? Math.round((returnedCount / cohortSize) * 100) : 0;
  return { cohortSize, returnedCount, returnRate };
}

/**
 * Computes aggregated product metrics for the /admin dashboard.
 */
export async function getAdminStats(): Promise<AdminStats> {
  let events: AnalyticsEvent[] = [];
  let feedbacks: FeedbackPayload[] = [];
  let storageProvider: 'supabase' | 'filesystem' | 'memory' = 'memory';

  // Try Supabase first if available
  if (supabase) {
    try {
      const { data: dbEvents, error: evError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(2000);

      const { data: dbFeedback, error: fbError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!evError && dbEvents && dbEvents.length > 0) {
        events = dbEvents.map((row) => ({
          id: row.id,
          sessionId: row.session_id,
          eventName: row.event_name,
          timestamp: row.timestamp,
          data: row.data,
        }));
        storageProvider = 'supabase';
      }

      if (!fbError && dbFeedback && dbFeedback.length > 0) {
        feedbacks = dbFeedback.map((row) => ({
          sessionId: row.session_id,
          helpful: row.helpful,
          comment: row.comment,
          score: row.score,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.error('[AnalyticsStore] Supabase query failed:', err instanceof Error ? err.message : 'Unknown');
    }
  }

  // Fallback to local files & in-memory if Supabase was empty or unavailable
  if (events.length === 0) {
    if (isDevelopment) {
      events = readJsonFile<AnalyticsEvent[]>(EVENTS_FILE, []);
      if (events.length > 0) storageProvider = 'filesystem';
    }
    if (events.length === 0 && memoryEvents.length > 0) {
      events = memoryEvents;
      storageProvider = 'memory';
    }
  }

  if (feedbacks.length === 0) {
    if (isDevelopment) {
      feedbacks = readJsonFile<FeedbackPayload[]>(FEEDBACK_FILE, []);
    }
    if (feedbacks.length === 0 && memoryFeedback.length > 0) {
      feedbacks = memoryFeedback;
    }
  }

  const analysisEvents = events.filter((e) => e.eventName === 'analysis_completed');
  const bulletAcceptEvents = events.filter((e) => e.eventName === 'bullet_accepted');
  const bulletRejectEvents = events.filter((e) => e.eventName === 'bullet_rejected');
  const fallbackEvents = events.filter((e) => e.eventName === 'gemini_fallback');

  const totalAnalyses = analysisEvents.length;

  // Separate AI-powered analyses from fallback analyses
  const aiAnalyses = analysisEvents.filter((e) => !e.data?.isLLMFallback);
  const fallbackAnalyses = analysisEvents.filter((e) => Boolean(e.data?.isLLMFallback));

  // Compute average score across all completed analyses
  let totalScore = 0;
  for (const ev of analysisEvents) {
    if (typeof ev.data?.atsScore === 'number') {
      totalScore += ev.data.atsScore;
    }
  }
  const avgScore = totalAnalyses > 0 ? Math.round(totalScore / totalAnalyses) : 0;

  // FIX: Compute pipeline latency and Gemini latency strictly over the SAME set of non-fallback AI runs!
  let totalAiPipelineLatency = 0;
  let totalAiGeminiLatency = 0;

  for (const ev of aiAnalyses) {
    if (typeof ev.data?.latencyMs === 'number') {
      totalAiPipelineLatency += ev.data.latencyMs;
    }
    if (typeof ev.data?.geminiLatencyMs === 'number') {
      totalAiGeminiLatency += ev.data.geminiLatencyMs;
    }
  }

  const avgLatencyMs = aiAnalyses.length > 0 ? Math.round(totalAiPipelineLatency / aiAnalyses.length) : 0;
  const avgGeminiLatencyMs = aiAnalyses.length > 0 ? Math.round(totalAiGeminiLatency / aiAnalyses.length) : 0;

  // Fallback runs latency
  let totalFallbackLatency = 0;
  for (const ev of fallbackAnalyses) {
    if (typeof ev.data?.latencyMs === 'number') {
      totalFallbackLatency += ev.data.latencyMs;
    }
  }
  const avgFallbackLatencyMs =
    fallbackAnalyses.length > 0 ? Math.round(totalFallbackLatency / fallbackAnalyses.length) : 0;

  // North Star: Bullet Edit Acceptance Rate
  const acceptedBullets = bulletAcceptEvents.length;
  const rejectedBullets = bulletRejectEvents.length;
  const totalBulletDecisions = acceptedBullets + rejectedBullets;
  const bulletAcceptanceRate =
    totalBulletDecisions > 0
      ? Math.round((acceptedBullets / totalBulletDecisions) * 100)
      : 0;

  // Feedback Metrics
  const totalFeedback = feedbacks.length;
  const positiveFeedbackCount = feedbacks.filter((f) => f.helpful).length;
  const feedbackPositiveRate =
    totalFeedback > 0
      ? Math.round((positiveFeedbackCount / totalFeedback) * 100)
      : 0;

  // Cohort Return Rate: 1-Day and 7-Day cohorts
  const oneDayCohort = calculateCohortRetention(events, 1);
  const sevenDayCohort = calculateCohortRetention(events, 7);

  // Total unique sessions
  const allUniqueSessions = new Set<string>();
  for (const ev of events) {
    if (ev.sessionId && ev.sessionId !== 'anonymous') {
      allUniqueSessions.add(ev.sessionId);
    }
  }

  const retentionCohortSql = `WITH session_summary AS (
  SELECT
    session_id,
    MIN(timestamp) AS first_seen_at,
    MIN(DATE(timestamp)) AS first_day,
    MAX(DATE(timestamp)) AS last_day,
    COUNT(DISTINCT DATE(timestamp)) AS active_days,
    BOOL_OR(event_name = 'returning_visit') AS has_returning_event
  FROM analytics_events
  WHERE session_id IS NOT NULL AND session_id != 'anonymous'
  GROUP BY session_id
),
cohort AS (
  SELECT
    session_id,
    (last_day > first_day OR active_days > 1 OR has_returning_event) AS is_returned
  FROM session_summary
  WHERE first_seen_at <= NOW() - INTERVAL '1 day' -- configurable: '1 day' or '7 days'
)
SELECT
  COUNT(*) AS cohort_size,
  COUNT(*) FILTER (WHERE is_returned) AS returned_count,
  COALESCE(
    ROUND(COUNT(*) FILTER (WHERE is_returned) * 100.0 / NULLIF(COUNT(*), 0), 1),
    0.0
  ) AS return_rate_percent
FROM cohort;`;

  // Recent activity stream
  const recentEvents = [...events].reverse().slice(0, 15).map((e) => {
    let summary: string = e.eventName;
    if (e.eventName === 'analysis_completed' && e.data) {
      const isFallback = Boolean(e.data.isLLMFallback);
      summary = `${isFallback ? '[Fallback] ' : ''}Analyzed resume (Score: ${e.data.atsScore}, Total: ${e.data.latencyMs}ms${
        e.data.geminiLatencyMs ? `, Gemini: ${e.data.geminiLatencyMs}ms` : ''
      })`;
    } else if (e.eventName === 'gemini_fallback') {
      summary = `Gemini fallback triggered (${e.data?.reason || 'unreachable'})`;
    } else if (e.eventName === 'returning_visit') {
      summary = `Returning user session active (${e.data?.daysSinceLastVisit ? `${e.data.daysSinceLastVisit}d since last visit` : 'revisited'})`;
    } else if (e.eventName === 'bullet_accepted') {
      summary = 'User accepted an XYZ rewritten bullet';
    } else if (e.eventName === 'bullet_rejected') {
      summary = 'User rejected a bullet suggestion';
    } else if (e.eventName === 'bullets_copied') {
      summary = 'User copied accepted bullets to clipboard';
    }
    return {
      eventName: e.eventName,
      timestamp: e.timestamp,
      sessionId: e.sessionId.slice(0, 8),
      summary,
    };
  });

  return {
    storageProvider,
    isPersistent: Boolean(supabase || isDevelopment),
    totalAnalyses,
    aiAnalysesCount: aiAnalyses.length,
    fallbackAnalysesCount: fallbackAnalyses.length,
    avgScore,
    avgLatencyMs,
    avgGeminiLatencyMs,
    avgFallbackLatencyMs,
    geminiFallbackCount: fallbackEvents.length,
    totalBulletDecisions,
    acceptedBullets,
    rejectedBullets,
    bulletAcceptanceRate,
    totalFeedback,
    positiveFeedbackCount,
    feedbackPositiveRate,
    totalSessions: allUniqueSessions.size,
    oneDayCohortSize: oneDayCohort.cohortSize,
    oneDayReturnedSessions: oneDayCohort.returnedCount,
    oneDayReturnRate: oneDayCohort.returnRate,
    sevenDayCohortSize: sevenDayCohort.cohortSize,
    sevenDayReturnedSessions: sevenDayCohort.returnedCount,
    sevenDayReturnRate: sevenDayCohort.returnRate,
    retentionQueryDescription: 'Cohort return rate: % of sessions first active >= N days ago that returned on a subsequent date.',
    retentionCohortSql,
    recentEvents,
    recentFeedback: [...feedbacks].reverse().slice(0, 10),
  };
}
