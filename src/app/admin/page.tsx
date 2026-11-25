'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { AdminStats } from '@/lib/types';
import {
  Lock,
  Target,
  FileCheck,
  Clock,
  ThumbsUp,
  RotateCw,
  Activity,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Users
} from 'lucide-react';

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);

  const fetchStats = async (key: string) => {
    if (!key.trim()) {
      setError('Please enter the Admin Secret Key.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsServiceUnavailable(false);

    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(key.trim())}`);
      const data = await res.json();

      if (res.status === 503) {
        setIsServiceUnavailable(true);
        throw new Error(data.error || 'Admin dashboard is disabled: ADMIN_SECRET_KEY is not set on the server.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate admin key.');
      }

      setStats(data);
    } catch (err: unknown) {
      console.error('Admin stats error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin stats.';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (res.status === 503) {
          setIsServiceUnavailable(true);
          setError('Admin dashboard is unavailable (503): ADMIN_SECRET_KEY is not configured in the server environment.');
        }
      })
      .catch(() => { });
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(adminKey);
  };

  return (
    <div className="min-h-screen bg-[#0A0A12] text-[#F5F5FA] flex flex-col font-sans selection:bg-[#7C5CFF]/30">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-10">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[rgba(255,255,255,0.08)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(124,92,255,0.15)] text-[#22D3EE] border border-[rgba(124,92,255,0.3)]">
                PM Analytics & Evaluation
              </span>
              <span className="text-xs text-[#8A8AA3] font-mono">/admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5FA] mt-1">
              ResumeGap Product Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8AA3] mt-0.5">
              Live funnel metrics, adoption KPIs, and the North Star: Bullet Edit Acceptance Rate.
            </p>
          </div>

          {/* Key authentication form */}
          <form onSubmit={handleKeySubmit} className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="relative">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Admin Secret Key"
                className="w-48 pl-9 pr-3 py-2 min-h-[44px] text-xs bg-[#181826] border border-[rgba(255,255,255,0.08)] text-[#F5F5FA] placeholder-[#8A8AA3] rounded-xl focus:outline-none focus:border-[#7C5CFF]/60 font-mono"
              />
              <Lock className="w-4 h-4 text-[#8A8AA3] absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 min-h-[44px] bg-accent-gradient text-[#0A0A12] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#7C5CFF]/20 hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Sync</span>
            </button>
          </form>
        </div>

        {/* Service Unavailable 503 Screen */}
        {isServiceUnavailable && (
          <div className="mb-6 p-6 rounded-2xl bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#FBBF24] text-xs sm:text-sm">
            <h3 className="font-bold text-base flex items-center gap-2 text-[#F5F5FA]">
              <Lock className="w-5 h-5 text-[#FBBF24]" />
              Admin Dashboard Locked (HTTP 503)
            </h3>
            <p className="mt-1 text-[#B4B4C8]">
              ADMIN_SECRET_KEY is not configured on the server. To access product analytics, configure ADMIN_SECRET_KEY in your environment variables.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && !isServiceUnavailable && (
          <div className="mb-6 p-4 rounded-2xl bg-[rgba(251,113,133,0.1)] border border-[rgba(251,113,133,0.25)] text-[#FB7185] text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0" />
            <span>{error} — Verify that your ADMIN_SECRET_KEY matches .env.local</span>
          </div>
        )}

        {/* Storage Persistence Banner */}
        {stats && !stats.isPersistent && (
          <div className="mb-6 p-4 rounded-2xl bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)] text-[#FBBF24] text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#F5F5FA]">Warning: Running on Non-Persistent In-Memory Storage</p>
              <p className="text-xs text-[#B4B4C8] mt-0.5">
                On Vercel serverless functions, in-memory data resets across function recycles. To persist analytics and feedback permanently in production, configure <code className="bg-[#181826] text-[#22D3EE] px-1.5 py-0.5 rounded font-mono font-semibold">SUPABASE_URL</code> and <code className="bg-[#181826] text-[#22D3EE] px-1.5 py-0.5 rounded font-mono font-semibold">SUPABASE_SERVICE_ROLE_KEY</code>.
              </p>
            </div>
          </div>
        )}

        {stats && stats.storageProvider === 'supabase' && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.25)] text-[#34D399] text-xs flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              Connected to Persistent Supabase Production Database
            </span>
            <span className="text-[11px] text-[#34D399] font-mono">analytics_events + feedback tables</span>
          </div>
        )}

        {stats && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* NORTH STAR CARD */}
              <div className="sm:col-span-2 lg:col-span-1 p-6 rounded-3xl bg-[#181826] border border-[#7C5CFF]/30 text-[#F5F5FA] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#7C5CFF]/20 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#22D3EE]" />
                      PM North Star Metric
                    </span>
                    <span className="text-[10px] bg-[rgba(124,92,255,0.2)] text-[#22D3EE] px-2.5 py-0.5 rounded-full border border-[#7C5CFF]/30 font-semibold">
                      Quality Bar
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#B4B4C8]">
                    Bullet Edit Acceptance Rate
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold tracking-tight text-[#F5F5FA]">
                      {stats.bulletAcceptanceRate}%
                    </span>
                    <span className="text-xs text-[#8A8AA3]">
                      ({stats.acceptedBullets} accepted / {stats.totalBulletDecisions} decisions)
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8A8AA3] mt-4 leading-relaxed">
                  Measures whether students perceive AI rewrites as authentic and recruiter-ready. Target: &gt;65%.
                </p>
              </div>

              {/* Total Analyses */}
              <div className="p-6 rounded-3xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#8A8AA3]">Funnel Volume</span>
                    <div className="w-8 h-8 rounded-xl bg-[rgba(124,92,255,0.15)] text-[#22D3EE] flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#8A8AA3] uppercase tracking-wider">
                    Total Resumes Analyzed
                  </h3>
                  <div className="text-3xl font-extrabold text-[#F5F5FA] mt-1">
                    {stats.totalAnalyses}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8A8AA3] mt-4">
                  <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Target: ~500 graduating engineers</span>
                </div>
              </div>

              {/* Average ATS Score */}
              <div className="p-6 rounded-3xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#8A8AA3]">ATS Quality Baseline</span>
                    <div className="w-8 h-8 rounded-xl bg-[rgba(52,211,153,0.15)] text-[#34D399] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#8A8AA3] uppercase tracking-wider">
                    Average ATS Match Score
                  </h3>
                  <div className="text-3xl font-extrabold text-[#F5F5FA] mt-1">
                    {stats.avgScore} <span className="text-sm font-semibold text-[#8A8AA3]">/ 100</span>
                  </div>
                </div>
                <p className="text-xs text-[#8A8AA3] mt-4">
                  Deterministic 4-pillar benchmark across all tests.
                </p>
              </div>

              {/* End-to-End & Gemini Latency */}
              <div className="p-6 rounded-3xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#8A8AA3]">Pipeline Performance</span>
                    <div className="w-8 h-8 rounded-xl bg-[rgba(251,191,36,0.15)] text-[#FBBF24] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#8A8AA3] uppercase tracking-wider">
                    Pipeline Latency (AI Runs)
                  </h3>
                  <div className="text-3xl font-extrabold text-[#F5F5FA] mt-1">
                    {stats.avgLatencyMs} <span className="text-sm font-semibold text-[#8A8AA3]">ms</span>
                  </div>
                  <div className="mt-2 text-xs text-[#B4B4C8] flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-2">
                    <span>Gemini AI Latency:</span>
                    <span className="font-bold text-[#F5F5FA]">{stats.avgGeminiLatencyMs || 0} ms</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-[rgba(255,255,255,0.08)] pt-2.5">
                  <div className="flex items-center justify-between text-xs text-[#8A8AA3]">
                    <span className={stats.avgLatencyMs > 0 && stats.avgLatencyMs < 5000 ? 'text-[#34D399] font-medium' : 'text-[#FBBF24] font-medium'}>
                      {stats.avgLatencyMs > 0 && stats.avgLatencyMs < 5000 ? '✓ Under 5.0s SLA' : 'Active monitoring'}
                    </span>
                    <span className="text-[11px] text-[#8A8AA3]">
                      {stats.aiAnalysesCount} AI / {stats.fallbackAnalysesCount} fallback runs
                    </span>
                  </div>
                  {stats.fallbackAnalysesCount > 0 && (
                    <p className="text-[10px] text-[#8A8AA3] mt-1">
                      Avg fallback latency: {stats.avgFallbackLatencyMs}ms
                    </p>
                  )}
                </div>
              </div>

              {/* User Feedback Positivity */}
              <div className="p-6 rounded-3xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#8A8AA3]">User Satisfaction</span>
                    <div className="w-8 h-8 rounded-xl bg-[rgba(52,211,153,0.15)] text-[#34D399] flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#8A8AA3] uppercase tracking-wider">
                    Feedback Positive %
                  </h3>
                  <div className="text-3xl font-extrabold text-[#F5F5FA] mt-1">
                    {stats.feedbackPositiveRate}%
                  </div>
                </div>
                <p className="text-xs text-[#8A8AA3] mt-4">
                  {stats.positiveFeedbackCount} of {stats.totalFeedback} users found results helpful.
                </p>
              </div>

              {/* Cohort Retention: 1-Day & 7-Day Return Rate */}
              <div className="p-6 rounded-3xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#8A8AA3]">Cohort Retention</span>
                    <div className="w-8 h-8 rounded-xl bg-[rgba(124,92,255,0.15)] text-[#22D3EE] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-[#8A8AA3] uppercase tracking-wider">
                    Return Rate by Cohort
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-3 rounded-2xl bg-[#181826] border border-[rgba(255,255,255,0.08)]">
                      <span className="text-[11px] font-semibold text-[#22D3EE]">1-Day Return</span>
                      <div className="text-2xl font-extrabold text-[#F5F5FA] mt-0.5">
                        {stats.oneDayReturnRate}%
                      </div>
                      <p className="text-[10px] text-[#8A8AA3] mt-0.5">
                        {stats.oneDayReturnedSessions}/{stats.oneDayCohortSize} in cohort
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#181826] border border-[rgba(255,255,255,0.08)]">
                      <span className="text-[11px] font-semibold text-[#B4B4C8]">7-Day Return</span>
                      <div className="text-2xl font-extrabold text-[#F5F5FA] mt-0.5">
                        {stats.sevenDayReturnRate}%
                      </div>
                      <p className="text-[10px] text-[#8A8AA3] mt-0.5">
                        {stats.sevenDayReturnedSessions}/{stats.sevenDayCohortSize} in cohort
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-[rgba(255,255,255,0.08)] pt-2">
                  <p className="text-[11px] text-[#8A8AA3]">
                    Total tracked unique sessions: <span className="font-semibold text-[#F5F5FA]">{stats.totalSessions}</span>
                  </p>
                  {stats.retentionCohortSql && (
                    <details className="mt-1 text-[10px] text-[#8A8AA3] cursor-pointer">
                      <summary className="hover:text-[#F5F5FA]">View PostgreSQL Cohort Retention Query</summary>
                      <pre className="mt-2 p-3 bg-[#0A0A12] text-[#22D3EE] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-x-auto font-mono text-[9px] leading-tight">
                        {stats.retentionCohortSql}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Activity Stream & User Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Activity Stream */}
              <div className="bg-[#11111C] rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#22D3EE]" />
                  <h3 className="text-sm font-bold text-[#F5F5FA]">Recent Anonymous Activity Stream</h3>
                </div>

                {stats.recentEvents.length === 0 ? (
                  <p className="text-xs text-[#8A8AA3] py-6 text-center">No events logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentEvents.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 text-xs p-3 rounded-2xl bg-[#181826] border border-[rgba(255,255,255,0.06)]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#F5F5FA] truncate">{ev.summary}</p>
                          <span className="text-[10px] text-[#8A8AA3] font-mono">
                            Session: {ev.sessionId}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8A8AA3] whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Comments */}
              <div className="bg-[#11111C] rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-4 h-4 text-[#34D399]" />
                  <h3 className="text-sm font-bold text-[#F5F5FA]">Recent Student Feedback & Comments</h3>
                </div>

                {stats.recentFeedback.length === 0 ? (
                  <p className="text-xs text-[#8A8AA3] py-6 text-center">No feedback recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentFeedback.map((fb, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#181826] text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
                              fb.helpful
                                ? 'bg-[rgba(52,211,153,0.15)] text-[#34D399] border border-[rgba(52,211,153,0.3)]'
                                : 'bg-[rgba(251,113,133,0.15)] text-[#FB7185] border border-[rgba(251,113,133,0.3)]'
                            }`}
                          >
                            {fb.helpful ? '👍 Helpful' : '👎 Needs Work'}
                          </span>
                          <span className="text-[10px] text-[#8A8AA3]">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {fb.comment ? (
                          <p className="text-[#B4B4C8] italic mt-1 leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                        ) : (
                          <p className="text-[#8A8AA3] text-[11px] mt-1">No comment provided</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
