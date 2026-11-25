'use client';

import React, { useState, useEffect } from 'react';
import { ATSScoreBreakdown } from '@/lib/types';
import { ChevronDown, ChevronUp, HelpCircle, Check, AlertCircle, Briefcase, FileCheck2 } from 'lucide-react';

interface ScoreGaugeProps {
  score: ATSScoreBreakdown;
  latencyMs: number;
  geminiLatencyMs?: number;
  isLLMFallback: boolean;
}

export default function ScoreGauge({ score, latencyMs, geminiLatencyMs, isLLMFallback }: ScoreGaugeProps) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const overall = score.overallScore;

  // Animated count-up effect
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = overall / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= overall) {
        setDisplayScore(overall);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [overall]);

  // Derived sub-scores for "Role fit" & "Resume quality"
  const roleFitScore = score.roleFitScore ?? Math.min(100, Math.round((score.keywordScore * 0.50 + score.seniorityScore * 0.15) / 0.65));
  const resumeQualityScore = score.resumeQualityScore ?? Math.min(100, Math.round((score.quantifiedScore * 0.25 + score.sectionsScore * 0.10) / 0.35));

  // Determine score color tier & glow
  let badgeBorder = 'border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.1)] text-[#FB7185]';
  let gradeText = 'Needs Urgent Gap Fixes';
  let tierGlowClass = 'shadow-[0_0_24px_rgba(251,113,133,0.25)]';

  if (overall >= 75) {
    badgeBorder = 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[#34D399]';
    gradeText = 'Strong ATS Match';
    tierGlowClass = 'shadow-[0_0_24px_rgba(52,211,153,0.25)]';
  } else if (overall >= 50) {
    badgeBorder = 'border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.1)] text-[#FBBF24]';
    gradeText = 'Moderate Fit (A few key gaps)';
    tierGlowClass = 'shadow-[0_0_24px_rgba(251,191,36,0.25)]';
  }

  // Radial gauge geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
        {/* Left Column: Radial Gauge + Companion Sub-scores */}
        <div className="flex flex-col items-center shrink-0 w-full lg:w-auto" data-testid="score-gauge">
          <div className={`relative w-44 h-44 rounded-full flex items-center justify-center p-2 transition-all duration-700 ${tierGlowClass}`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C5CFF" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-[#181826]"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#gaugeGradient)"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span data-testid="score-value" className="text-4xl md:text-5xl font-extrabold text-[#F5F5FA] tracking-tight">
                {displayScore}
              </span>
              <span className="text-[11px] uppercase font-bold text-[#8A8AA3] tracking-widest mt-0.5">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border ${badgeBorder}`}>
              {gradeText}
            </span>
          </div>

          {/* Room for Two Extra Scores: "Role fit" and "Resume quality" */}
          <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="bg-[#181826] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#8A8AA3] mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Role Fit</span>
              </div>
              <div className="text-xl font-bold text-[#F5F5FA]">{roleFitScore}%</div>
              <span className="text-[10px] text-[#8A8AA3]">Keywords + Level</span>
            </div>

            <div className="bg-[#181826] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#8A8AA3] mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>Quality</span>
              </div>
              <div className="text-xl font-bold text-[#F5F5FA]">{resumeQualityScore}%</div>
              <span className="text-[10px] text-[#8A8AA3]">Metrics + Sections</span>
            </div>
          </div>
        </div>

        {/* Right Column: Transparent 4-Pillar Breakdown Bars (All same accent gradient) */}
        <div className="flex-1 w-full space-y-4">
          {/* Pillar 1 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F5F5FA]">1. Keyword Overlap</span>
                <span className="text-[11px] font-semibold text-[#22D3EE] bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.3)] px-2 py-0.5 rounded-full">
                  50% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-[#F5F5FA]">{score.keywordScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#181826] rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <div
                className="h-full bg-accent-gradient rounded-full transition-all duration-700"
                style={{ width: `${score.keywordScore}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8A8AA3] mt-1">
              Matched {score.details.matchedKeywordsCount} of {score.details.totalJdKeywords} target skills in the job description
            </p>
          </div>

          {/* Pillar 2 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F5F5FA]">2. Quantified Impact Ratio</span>
                <span className="text-[11px] font-semibold text-[#22D3EE] bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.3)] px-2 py-0.5 rounded-full">
                  25% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-[#F5F5FA]">{score.quantifiedScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#181826] rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <div
                className="h-full bg-accent-gradient rounded-full transition-all duration-700"
                style={{ width: `${score.quantifiedScore}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8A8AA3] mt-1">
              {score.details.quantifiedBulletsDetected} of {score.details.totalBulletsDetected} experience bullets have hard metrics (%, $, numbers)
            </p>
          </div>

          {/* Pillar 3 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F5F5FA]">3. Seniority & Role Match</span>
                <span className="text-[11px] font-semibold text-[#22D3EE] bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.3)] px-2 py-0.5 rounded-full">
                  15% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-[#F5F5FA]">{score.seniorityScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#181826] rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <div
                className="h-full bg-accent-gradient rounded-full transition-all duration-700"
                style={{ width: `${score.seniorityScore}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8A8AA3] mt-1">
              Target Level: <span className="font-semibold text-[#F5F5FA]">{score.details.detectedSeniority.jdLevel}</span> • Candidate: <span className="font-semibold text-[#F5F5FA]">{score.details.detectedSeniority.resumeLevel}</span>
            </p>
          </div>

          {/* Pillar 4 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F5F5FA]">4. Section Completeness</span>
                <span className="text-[11px] font-semibold text-[#22D3EE] bg-[rgba(124,92,255,0.15)] border border-[rgba(124,92,255,0.3)] px-2 py-0.5 rounded-full">
                  10% Weight
                </span>
              </div>
              <span className="text-sm font-bold text-[#F5F5FA]">{score.sectionsScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#181826] rounded-full overflow-hidden border border-[rgba(255,255,255,0.06)]">
              <div
                className="h-full bg-accent-gradient rounded-full transition-all duration-700"
                style={{ width: `${score.sectionsScore}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] mt-1.5 text-[#B4B4C8]">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181826] border border-[rgba(255,255,255,0.06)]">
                {score.details.detectedSections.hasExperience ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />} Experience
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181826] border border-[rgba(255,255,255,0.06)]">
                {score.details.detectedSections.hasEducation ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />} Education
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181826] border border-[rgba(255,255,255,0.06)]">
                {score.details.detectedSections.hasSkills ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />} Skills
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181826] border border-[rgba(255,255,255,0.06)]">
                {score.details.detectedSections.hasProjects ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />} Projects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion: Full Formula Transparency */}
      <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#B4B4C8] hover:text-[#F5F5FA] transition-colors py-3 min-h-[44px] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#22D3EE]" />
            How was this ATS score calculated? (Transparent Formula)
          </span>
          {showFormulaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulaDetails && (
          <div className="mt-3 p-5 bg-[#181826] rounded-2xl text-xs text-[#B4B4C8] space-y-3 border border-[rgba(255,255,255,0.08)] animate-fade-in">
            <p className="font-mono text-[#22D3EE] bg-[#0A0A12] p-3 rounded-xl border border-[rgba(255,255,255,0.08)]">
              ATS Score = (0.50 × Keyword Match) + (0.25 × Quantified Impact) + (0.15 × Seniority Match) + (0.10 × Section Completeness)
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#F5F5FA]">Why code-driven scoring?</strong> Real ATS systems (Taleo, Workday, Greenhouse) do not run subjective LLM scores. They compute deterministic keyword frequency, boolean logic, and structural completeness. ResumeGap mirrors this transparently.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#8A8AA3] pt-1">
              <span>Total Pipeline: <strong className="text-[#F5F5FA]">{latencyMs} ms</strong></span>
              {typeof geminiLatencyMs === 'number' && geminiLatencyMs > 0 && (
                <span>Gemini Flash Latency: <strong className="text-[#F5F5FA]">{geminiLatencyMs} ms</strong></span>
              )}
              {isLLMFallback && (
                <span className="text-[#FBBF24] font-semibold bg-[rgba(251,191,36,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(251,191,36,0.25)]">
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
