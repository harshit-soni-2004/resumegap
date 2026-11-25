'use client';

import React, { useEffect, useState } from 'react';
import { FileSearch, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface StagedLoaderProps {
  isAnalyzing: boolean;
}

const STAGES = [
  {
    id: 1,
    title: 'Extracting & Sanitizing Resume',
    subtitle: 'Checking text density, ATS sections, and quantified metrics...',
    icon: FileSearch,
  },
  {
    id: 2,
    title: 'Stage 1: Matching Keywords & Seniority',
    subtitle: 'Cross-referencing 400+ tech skills against target Job Description...',
    icon: Target,
  },
  {
    id: 3,
    title: 'Stage 2: Gemini Flash XYZ Rewriter',
    subtitle: 'Synthesizing "Accomplished [X] measured by [Y]" bullet points...',
    icon: Sparkles,
  },
];

export default function StagedLoader({ isAnalyzing }: StagedLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;

    const timer0 = setTimeout(() => setCurrentStep(0), 0);
    const timer1 = setTimeout(() => setCurrentStep(1), 900);
    const timer2 = setTimeout(() => setCurrentStep(2), 2200);

    return () => {
      clearTimeout(timer0);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 bg-[#11111C] rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-2xl animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(124,92,255,0.15)] text-[#22D3EE] mb-3 animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin text-[#22D3EE]" />
        </div>
        <h3 className="text-lg font-bold text-[#F5F5FA]">Analyzing Resume & Target JD</h3>
        <p className="text-xs text-[#8A8AA3] mt-1">Running two-stage pipeline in usually under 5 seconds...</p>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 border ${
                isActive
                  ? 'bg-[#181826] border-[#7C5CFF]/40 text-[#F5F5FA] shadow-sm'
                  : isDone
                  ? 'bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.2)] text-[#F5F5FA]'
                  : 'bg-[#181826]/40 border-transparent text-[#8A8AA3] opacity-60'
              }`}
            >
              <div
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isDone
                    ? 'bg-[#34D399] text-[#0A0A12]'
                    : isActive
                    ? 'bg-accent-gradient text-[#0A0A12] animate-bounce'
                    : 'bg-[rgba(255,255,255,0.1)] text-[#8A8AA3]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-tight">{stage.title}</h4>
                  {isActive && (
                    <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8A8AA3] mt-0.5">{stage.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
