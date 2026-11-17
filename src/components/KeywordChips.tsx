'use client';

import React, { useState } from 'react';
import { MissingKeyword } from '@/lib/types';
import { AlertCircle, CheckCircle2, ChevronRight, Tag } from 'lucide-react';

interface KeywordChipsProps {
  missingKeywords: MissingKeyword[];
  matchedKeywords: string[];
}

export default function KeywordChips({ missingKeywords, matchedKeywords }: KeywordChipsProps) {
  const [activeTab, setActiveTab] = useState<'missing' | 'matched'>('missing');
  const [selectedKeyword, setSelectedKeyword] = useState<MissingKeyword | null>(null);

  const highPriority = missingKeywords.filter((k) => k.priority === 'HIGH');
  const mediumPriority = missingKeywords.filter((k) => k.priority === 'MEDIUM');
  const lowPriority = missingKeywords.filter((k) => k.priority === 'LOW');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            ATS Keyword Coverage Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Keywords extracted from the Job Description and compared against your resume
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center ${
              activeTab === 'missing'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Missing Gaps ({missingKeywords.length})
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center ${
              activeTab === 'matched'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matched Skills ({matchedKeywords.length})
          </button>
        </div>
      </div>

      {activeTab === 'missing' ? (
        <div className="space-y-4">
          {missingKeywords.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Outstanding! No critical keywords are missing from your target Job Description.</span>
            </div>
          ) : (
            <>
              {/* HIGH PRIORITY */}
              {highPriority.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>HIGH PRIORITY (Required for ATS Keyword Gate)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {highPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-rose-50/80 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <span className="font-semibold">{kw.keyword}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${selectedKeyword?.keyword === kw.keyword ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MEDIUM PRIORITY */}
              {mediumPriority.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>MEDIUM PRIORITY (Core Stack & Libraries)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mediumPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span className="font-semibold">{kw.keyword}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${selectedKeyword?.keyword === kw.keyword ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LOW PRIORITY */}
              {lowPriority.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>LOW PRIORITY (Bonus Tools & Concepts)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lowPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-1.5 ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-semibold">{kw.keyword}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${selectedKeyword?.keyword === kw.keyword ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Keyword Detailed Explanation Callout */}
              {selectedKeyword && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 animate-fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                      Why `{selectedKeyword.keyword}` matters:
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-200/60 text-blue-800">
                      {selectedKeyword.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-slate-700">{selectedKeyword.reason}</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* MATCHED SKILLS VIEW */
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Great job! You have already covered these skills in your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
