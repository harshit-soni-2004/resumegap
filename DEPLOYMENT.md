# ResumeGap — Vercel Production Deployment Guide

This guide provides the complete, step-by-step process for deploying **ResumeGap** to Vercel with persistent Supabase analytics, Upstash distributed rate limiting, and Google Gemini 2.5 Flash.

---

## 1. Prerequisites & Accounts

- A [Vercel](https://vercel.com/) account
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key
- (Optional but recommended) A [Supabase](https://supabase.com/) account for persistent cloud analytics
- (Optional but recommended) An [Upstash](https://upstash.com/) account for distributed serverless rate limiting

---

## 2. Supabase Setup (Database Schema)

1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation bar.
3. Paste and run the contents of [supabase/schema.sql](file:///c:/Users/ihars/Desktop/Workspace/pm_project/supabase/schema.sql):
   ```sql
   -- 1. Create analytics_events table
   CREATE TABLE IF NOT EXISTS public.analytics_events (
       id TEXT PRIMARY KEY,
       session_id TEXT NOT NULL,
       event_name TEXT NOT NULL,
       timestamp TIMESTAMPTZ NOT NULL,
       data JSONB DEFAULT '{}'::jsonb,
       created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
   );

   CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
   CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
   CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);

   -- 2. Create feedback table
   CREATE TABLE IF NOT EXISTS public.feedback (
       id BIGSERIAL PRIMARY KEY,
       session_id TEXT NOT NULL,
       helpful BOOLEAN NOT NULL,
       comment TEXT,
       score INTEGER,
       created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
   );

   CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON public.feedback(session_id);
   CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_feedback_helpful ON public.feedback(helpful);

   -- 3. Enable Row Level Security (RLS)
   ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
   ```
4. Copy your **Project URL** and **Service Role Secret Key** from `Project Settings > API`.

---

## 3. Upstash Redis Setup (Rate Limiting)

1. Go to your [Upstash Console](https://console.upstash.com/) and create a new Redis database (Global or region closest to your Vercel deployment).
2. Under the **REST API** section, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 4. Environment Variables Checklist

Configure the following environment variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Required? | Example / Value | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | `AIzaSy...` | Official Google Gemini API Key |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Frontier Gemini model for stage 2 rewrites |
| `ADMIN_SECRET_KEY` | **Yes** | `a_strong_random_secret` | Secures the `/admin` PM analytics dashboard (returns 503 if missing) |
| `SUPABASE_URL` | Recommended | `https://xxxx.supabase.co` | Supabase project URL for serverless event persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | `eyJhbGciOi...` | Supabase service role key (bypasses RLS to insert analytics) |
| `UPSTASH_REDIS_REST_URL` | Recommended | `https://xxxx.upstash.io` | Upstash Redis REST endpoint for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | `AXXXX...` | Upstash Redis REST auth token |

---

## 5. Deploying to Vercel

### Option A: Via GitHub (Recommended)
1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete ResumeGap production MVP"
   git push origin main
   ```
2. In Vercel, click **Add New Project**, import the GitHub repository.
3. Under **Environment Variables**, add the keys from the table above.
4. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npx vercel
# Follow prompts to link project
npx vercel --prod
```

---

## 6. Post-Deployment Smoke Test Checklist

Once your production deployment URL is live (e.g. `https://resumegap.vercel.app`):

- [ ] **1. Health Check Probe**:
  - Visit `https://your-domain.vercel.app/api/health`
  - Verify `status: "healthy"` and check `services` booleans:
    - `gemini: { configured: true, reachable: true }`
    - `supabase: { configured: true, reachable: true }`
    - `upstash: { configured: true, reachable: true }`
- [ ] **2. Landing Page Load**:
  - Open `https://your-domain.vercel.app/`
  - Confirm clean mobile and desktop responsive layout.
  - Verify the line: *"🔒 Your resume is processed in memory and never stored."*
- [ ] **3. End-to-End Analysis**:
  - Click **"Load Sample SDE Resume & JD"**
  - Click **"Analyze ATS Match & Rewrite Bullets"**
  - Verify staged loading screen transitions.
  - Verify results show `✨ AI-Powered Analysis (Gemini Flash)` badge with Gemini latency.
- [ ] **4. Bullet Interactions**:
  - Click **Accept** on Bullet #1, **Reject** on Bullet #2.
  - Click **Copy All Accepted Bullets**.
- [ ] **5. Feedback Submission**:
  - Click **"Yes, helpful!"** on the feedback widget.
- [ ] **6. PM Admin Dashboard**:
  - Visit `https://your-domain.vercel.app/admin`
  - Verify unauthenticated visits require the secret key.
  - Enter your `ADMIN_SECRET_KEY` and click **Sync**.
  - Verify the North Star **Bullet Edit Acceptance Rate** and recent activity stream reflect your actions.
- [ ] **7. Security Check**:
  - Try opening `/api/admin/stats` with a wrong key: verify it returns **HTTP 401**.
  - If `ADMIN_SECRET_KEY` is omitted, verify it returns **HTTP 503**.
