'use client';

import React, { useState } from 'react';
import { ATSScoreBreakdown } from '@/lib/types';
import { ChevronDown, ChevronUp, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface ScoreGaugeProps {
  score: ATSScoreBreakdown;
  latencyMs: number;
  geminiLatencyMs?: number;
  isLLMFallback: boolean;
}

export default function ScoreGauge({ score, latencyMs, geminiLatencyMs, isLLMFallback }: ScoreGaugeProps) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const overall = score.overallScore;

  // Determine score color tier
  let badgeClass = 'bg-red-50 text-red-700 border-red-200';
  let gradeText = 'Needs Urgent Gap Fixes';

  if (overall >= 80) {
    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    gradeText = 'Strong ATS Match';
  } else if (overall >= 60) {
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    gradeText = 'Moderate Fit (A few key gaps)';
  }

  // Calculate stroke dashoffset for radial circle gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Left: Animated Radial Gauge */}
        <div className="flex flex-col items-center" data-testid="score-gauge">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-100"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  overall >= 80 ? 'text-emerald-500' : overall >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span data-testid="score-value" className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {overall}
              </span>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
              {gradeText}
            </span>
          </div>
        </div>

        {/* Right: Transparent 4-Pillar Breakdown Bars */}
        <div className="flex-1 w-full space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">1. Keyword Overlap</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  50% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{score.keywordScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${score.keywordScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Matched {score.details.matchedKeywordsCount} of {score.details.totalJdKeywords} target skills in the job description
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">2. Quantified Impact Ratio</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  25% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{score.quantifiedScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${score.quantifiedScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {score.details.quantifiedBulletsDetected} of {score.details.totalBulletsDetected} experience bullets have hard metrics (%, $, numbers)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">3. Seniority & Role Match</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  15% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{score.seniorityScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-700"
                style={{ width: `${score.seniorityScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Target Level: <span className="font-medium text-slate-700">{score.details.detectedSeniority.jdLevel}</span> • Candidate: <span className="font-medium text-slate-700">{score.details.detectedSeniority.resumeLevel}</span>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">4. Section Completeness</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  10% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">{score.sectionsScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-700"
                style={{ width: `${score.sectionsScore}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] mt-1 text-slate-600">
              <span className="flex items-center gap-0.5">
                {score.details.detectedSections.hasExperience ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-red-500" />} Experience
              </span>
              <span className="flex items-center gap-0.5">
                {score.details.detectedSections.hasEducation ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-red-500" />} Education
              </span>
              <span className="flex items-center gap-0.5">
                {score.details.detectedSections.hasSkills ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-red-500" />} Skills
              </span>
              <span className="flex items-center gap-0.5">
                {score.details.detectedSections.hasProjects ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-red-500" />} Projects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion: Full Formula Transparency */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-3 min-h-[44px]"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            How was this ATS score calculated? (Transparent Formula)
          </span>
          {showFormulaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulaDetails && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-200 animate-fade-in">
            <p className="font-mono text-slate-800 bg-white p-2 rounded border border-slate-200">
              ATS Score = (0.50 × Keyword Match) + (0.25 × Quantified Impact) + (0.15 × Seniority Match) + (0.10 × Section Completeness)
            </p>
            <p>
              <strong>Why code-driven scoring?</strong> Real ATS systems (Taleo, Workday, Greenhouse) do not run subjective LLM scores. They compute deterministic keyword frequency, boolean logic, and structural completeness. ResumeGap mirrors this transparently.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
              <span>Total Pipeline: <strong>{latencyMs} ms</strong></span>
              {typeof geminiLatencyMs === 'number' && geminiLatencyMs > 0 && (
                <span>Gemini Flash Latency: <strong>{geminiLatencyMs} ms</strong></span>
              )}
              {isLLMFallback && (
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Basic Analysis (Deterministic Engine Fallback)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
