'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UploadDropzone from '@/components/UploadDropzone';
import StagedLoader from '@/components/StagedLoader';
import ScoreGauge from '@/components/ScoreGauge';
import KeywordChips from '@/components/KeywordChips';
import BulletDiffView from '@/components/BulletDiffView';
import FeedbackWidget from '@/components/FeedbackWidget';
import { AnalysisResult } from '@/lib/types';
import { trackEvent } from '@/lib/client-analytics';
import { RotateCcw, Zap, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('page_view', { path: '/' });
  }, []);

  const handleAnalyze = async (payload: {
    file?: File;
    resumeText?: string;
    jobDescription: string;
  }) => {
    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisResult(null);

    try {
      let res: Response;

      if (payload.file) {
        const formData = new FormData();
        formData.append('resume', payload.file);
        formData.append('jobDescription', payload.jobDescription);
        res = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText: payload.resumeText,
            jobDescription: payload.jobDescription,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume.');
      }

      setAnalysisResult(data);

      // Scroll smoothly to results
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please check inputs and retry.';
      setApiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-semibold border border-blue-200 mb-4 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Built for 2025/2026 Off-Campus Engineering Drives</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Stop Getting Filtered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ATS Bots</span>.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your resume PDF and paste the target Job Description. Get a transparent ATS score, missing keywords by priority, and AI-rewritten Google XYZ bullet points in seconds.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Transparent 0-100 Score Formula
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Google XYZ Formula Rewrites
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Zero Sign-Up & No Data Stored
            </span>
          </div>
        </div>

        {/* Upload Form or Active Analyzer */}
        {!analysisResult && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
            <UploadDropzone onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
          </div>
        )}

        {/* Staged Loading State */}
        <StagedLoader isAnalyzing={isAnalyzing} />

        {/* Global Error Banner */}
        {apiError && (
          <div className="my-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-shake">
            <div>
              <p className="font-semibold">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-xs font-bold px-3.5 py-2 min-h-[44px] bg-white text-rose-700 border border-rose-300 rounded-xl shrink-0 hover:bg-rose-100 flex items-center justify-center"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Mode Badge & Reset Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {!analysisResult.metadata.isLLMFallback ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI-Powered Analysis (Gemini Flash)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      {analysisResult.metadata.fallbackReason === 'quota'
                        ? 'AI is busy, showing basic analysis'
                        : 'Basic analysis (AI unavailable)'}
                    </span>
                  )}

                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Total: {analysisResult.metadata.latencyMs}ms
                    {analysisResult.metadata.geminiLatencyMs ? ` • Gemini: ${analysisResult.metadata.geminiLatencyMs}ms` : ''}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  ATS Audit Complete for Target Role
                </h2>

                {analysisResult.metadata.isLLMFallback && (
                  <p className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 mt-1">
                    {analysisResult.metadata.fallbackReason === 'quota'
                      ? '⚡ AI is busy right now. We generated your keywords and rewrites instantly using our deterministic ATS rules.'
                      : 'ℹ️ AI stage unavailable. Analysis and rewrites were generated using our deterministic rule engine.'}
                  </p>
                )}
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Analyze Another Resume</span>
              </button>
            </div>

            {/* 1. Transparent ATS Score Gauge & 4-Pillar Breakdown */}
            <ScoreGauge
              score={analysisResult.score}
              latencyMs={analysisResult.metadata.latencyMs}
              geminiLatencyMs={analysisResult.metadata.geminiLatencyMs}
              isLLMFallback={analysisResult.metadata.isLLMFallback}
            />

            {/* 2. Keyword Gap Analysis (High / Med / Low) */}
            <KeywordChips
              missingKeywords={analysisResult.missingKeywords}
              matchedKeywords={analysisResult.score.details.matchedKeywords}
            />

            {/* 3. Interactive Diff View: Original vs Rewritten XYZ Bullets */}
            <BulletDiffView bulletSuggestions={analysisResult.bulletSuggestions} />

            {/* 4. 1-Click User Feedback Survey */}
            <FeedbackWidget score={analysisResult.score.overallScore} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ResumeGap — AI ATS & Resume Gap Copilot for Off-Campus Grads</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Zero PII Stored</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
