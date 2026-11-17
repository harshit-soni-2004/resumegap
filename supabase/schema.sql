-- ==============================================================================
-- ResumeGap Production Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- 1. Analytics Events Table (Anonymous Product Telemetry, Zero PII)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for high-performance aggregate queries on /admin dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);

-- 2. User Feedback Table (1-Click Student Survey)
CREATE TABLE IF NOT EXISTS public.feedback (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    helpful BOOLEAN NOT NULL,
    comment TEXT,
    score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for feedback analytics
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON public.feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_helpful ON public.feedback(helpful);

-- 3. Row Level Security (RLS)
-- Enable RLS to prevent public / anonymous direct reads or writes via Supabase public anon key
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Intentionally NO public policies created:
-- Data access is strictly restricted to serverless Next.js route handlers
-- authenticated via the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS securely.

-- 4. Cohort Retention Query Reference (1-Day and 7-Day Window)
-- To evaluate user retention in Supabase SQL editor:
-- WITH session_summary AS (
--   SELECT
--     session_id,
--     MIN(timestamp) AS first_seen_at,
--     MIN(DATE(timestamp)) AS first_day,
--     MAX(DATE(timestamp)) AS last_day,
--     COUNT(DISTINCT DATE(timestamp)) AS active_days,
--     BOOL_OR(event_name = 'returning_visit') AS has_returning_event
--   FROM public.analytics_events
--   WHERE session_id IS NOT NULL AND session_id != 'anonymous'
--   GROUP BY session_id
-- ),
-- cohort AS (
--   SELECT
--     session_id,
--     (last_day > first_day OR active_days > 1 OR has_returning_event) AS is_returned
--   FROM session_summary
--   WHERE first_seen_at <= NOW() - INTERVAL '1 day' -- or INTERVAL '7 days'
-- )
-- SELECT
--   COUNT(*) AS cohort_size,
--   COUNT(*) FILTER (WHERE is_returned) AS returned_count,
--   COALESCE(
--     ROUND(COUNT(*) FILTER (WHERE is_returned) * 100.0 / NULLIF(COUNT(*), 0), 1),
--     0.0
--   ) AS return_rate_percent
-- FROM cohort;
