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

    // Simulating deterministic step progression while network call executes
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
    <div className="w-full max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/5 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3 animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Analyzing Resume & Target JD</h3>
        <p className="text-xs text-slate-500 mt-1">Running two-stage pipeline in under 5 seconds...</p>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-300 border ${
                isActive
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-sm'
                  : isDone
                  ? 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                  : 'bg-slate-50 border-transparent text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white animate-bounce'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-tight">{stage.title}</h4>
                  {isActive && (
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{stage.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
