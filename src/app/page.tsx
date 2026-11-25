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

  // Synchronize results view mood and motion calming without remounting
  useEffect(() => {
    if (analysisResult) {
      document.body.setAttribute('data-results', 'true');
      const score = analysisResult.score.overallScore;
      let tint = 'rgba(251, 113, 133, 0.10)'; // <50 soft rose
      if (score >= 75) {
        tint = 'rgba(52, 211, 153, 0.12)'; // 75+ cyan-green
      } else if (score >= 50) {
        tint = 'rgba(251, 191, 36, 0.10)'; // 50-74 amber
      }
      document.documentElement.style.setProperty('--fluid-tier-tint', tint);
    } else {
      document.body.removeAttribute('data-results');
      document.documentElement.style.setProperty('--fluid-tier-tint', 'transparent');
    }
  }, [analysisResult]);

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
    <div className="min-h-screen text-[#F8F8FC] flex flex-col font-sans selection:bg-[#8B6CFF]/30">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-4 pb-8 md:pt-6 md:pb-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full surface-2 text-[#2DD4F5] text-xs font-semibold border border-[rgba(45,212,245,0.25)] mb-3 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#2DD4F5] fill-[#2DD4F5]" />
            <span>Built for 2026 off-campus drives</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8F8FC] leading-[1.12]">
            Stop Getting Filtered by{' '}
            <span className="text-accent-gradient drop-shadow-[0_0_24px_rgba(45,212,245,0.38)]">
              ATS Bots
            </span>
            .
          </h1>

          <p className="mt-3.5 text-sm sm:text-base md:text-lg text-[#C4C4D6] max-w-[60ch] mx-auto leading-relaxed">
            Upload your resume PDF and paste the target Job Description. Get a transparent ATS score, missing keywords by priority, and AI-rewritten Google XYZ bullet points in seconds.
          </p>

          {/* Feature Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-[#C4C4D6] font-medium">
            <span className="surface-1 px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              Transparent 0-100 Score Formula
            </span>
            <span className="surface-1 px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              Google XYZ Formula Rewrites
            </span>
            <span className="surface-1 px-3.5 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4F5]" />
              No sign-up needed
            </span>
          </div>

          {/* Slim 3-Step "How it works" Strip */}
          <div className="mt-6 max-w-xl mx-auto surface-1 rounded-2xl p-2.5 sm:p-3 border border-[rgba(255,255,255,0.08)] shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-1 text-xs text-[#C4C4D6]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="w-5 h-5 rounded-full bg-[rgba(139,108,255,0.2)] text-[#8B6CFF] border border-[rgba(139,108,255,0.35)] flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <span className="font-medium text-[#F8F8FC]">Upload Resume</span>
              </div>
              <div className="hidden sm:block h-[1px] flex-1 bg-[rgba(255,255,255,0.12)] mx-2" />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="w-5 h-5 rounded-full bg-[rgba(45,212,245,0.2)] text-[#2DD4F5] border border-[rgba(45,212,245,0.35)] flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <span className="font-medium text-[#F8F8FC]">Paste Target JD</span>
              </div>
              <div className="hidden sm:block h-[1px] flex-1 bg-[rgba(255,255,255,0.12)] mx-2" />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="w-5 h-5 rounded-full bg-[rgba(52,211,153,0.2)] text-[#34D399] border border-[rgba(52,211,153,0.35)] flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <span className="font-medium text-[#F8F8FC]">Get Score & Rewrites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form or Active Analyzer */}
        {!analysisResult && (
          <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 md:p-8 shadow-2xl">
            <UploadDropzone onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
          </div>
        )}

        {/* Staged Loading State */}
        <StagedLoader isAnalyzing={isAnalyzing} />

        {/* Global Error Banner */}
        {apiError && (
          <div className="my-6 p-4 rounded-2xl bg-[rgba(251,113,133,0.1)] border border-[rgba(251,113,133,0.25)] text-[#FB7185] text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div>
              <p className="font-semibold">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-xs font-bold px-4 py-2 min-h-[44px] bg-[#181826] text-[#FB7185] border border-[rgba(251,113,133,0.3)] rounded-xl shrink-0 hover:bg-[#FB7185] hover:text-[#0A0A12] flex items-center justify-center cursor-pointer transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Mode Badge & Reset Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 bg-[rgba(17,17,28,0.60)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl shadow-2xl">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {!analysisResult.metadata.isLLMFallback ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[rgba(52,211,153,0.1)] text-[#34D399] border border-[rgba(52,211,153,0.25)] shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                      AI-Powered Analysis (Gemini Flash)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[rgba(251,191,36,0.1)] text-[#FBBF24] border border-[rgba(251,191,36,0.25)] shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-[#FBBF24]" />
                      {analysisResult.metadata.fallbackReason === 'quota'
                        ? 'AI is busy, showing basic analysis'
                        : 'Basic analysis (AI unavailable)'}
                    </span>
                  )}

                  <span className="text-[11px] font-medium text-[#8A8AA3] bg-[#181826] border border-[rgba(255,255,255,0.06)] px-3 py-1 rounded-full">
                    Total: {analysisResult.metadata.latencyMs}ms
                    {analysisResult.metadata.geminiLatencyMs ? ` • Gemini: ${analysisResult.metadata.geminiLatencyMs}ms` : ''}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[#F5F5FA]">
                  ATS Audit Complete for Target Role
                </h2>

                {analysisResult.metadata.isLLMFallback && (
                  <p className="text-xs text-[#FBBF24] bg-[rgba(251,191,36,0.1)] p-3 rounded-2xl border border-[rgba(251,191,36,0.25)] mt-1">
                    {analysisResult.metadata.fallbackReason === 'quota'
                      ? '⚡ AI is busy right now. We generated your keywords and rewrites instantly using our deterministic ATS rules.'
                      : 'ℹ️ AI stage unavailable. Analysis and rewrites were generated using our deterministic rule engine.'}
                  </p>
                )}
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#181826] hover:bg-[#181826]/80 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] text-[#F5F5FA] text-xs font-semibold shadow-sm transition-all self-start sm:self-auto shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#22D3EE]" />
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
      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,18,0.7)] backdrop-blur-md py-8 mt-16 text-center text-xs text-[#8A8AA3]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ResumeGap — AI ATS & Resume Gap Copilot for Off-Campus Grads</p>
          <div className="flex items-center gap-4 text-[#8A8AA3]">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Zero PII Stored</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
