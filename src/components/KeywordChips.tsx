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
    <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#F5F5FA] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#22D3EE]" />
            ATS Keyword Coverage Analysis
          </h3>
          <p className="text-xs text-[#8A8AA3] mt-0.5">
            Keywords extracted from the Job Description and compared against your resume
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#181826] p-1.5 rounded-2xl border border-[rgba(255,255,255,0.08)] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-4 py-2 min-h-[44px] text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'missing'
                ? 'bg-accent-gradient text-[#0A0A12] font-bold shadow-md shadow-[#7C5CFF]/20'
                : 'text-[#B4B4C8] hover:text-[#F5F5FA]'
            }`}
          >
            Missing Gaps ({missingKeywords.length})
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`px-4 py-2 min-h-[44px] text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              activeTab === 'matched'
                ? 'bg-[#34D399] text-[#0A0A12] font-bold shadow-md shadow-[#34D399]/20'
                : 'text-[#B4B4C8] hover:text-[#F5F5FA]'
            }`}
          >
            Matched Skills ({matchedKeywords.length})
          </button>
        </div>
      </div>

      {activeTab === 'missing' ? (
        <div className="space-y-6">
          {missingKeywords.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.25)] text-[#34D399] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>Outstanding! No critical keywords are missing from your target Job Description.</span>
            </div>
          ) : (
            <>
              {/* HIGH PRIORITY */}
              {highPriority.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FB7185] mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>HIGH PRIORITY (Required for ATS Keyword Gate)</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {highPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 cursor-pointer ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-[#FB7185] text-[#0A0A12] border-[#FB7185] font-bold shadow-md shadow-[#FB7185]/20'
                            : 'bg-[rgba(251,113,133,0.1)] text-[#FB7185] border-[rgba(251,113,133,0.25)] hover:border-[#FB7185]/50'
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
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FBBF24] mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>MEDIUM PRIORITY (Core Stack & Libraries)</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {mediumPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 cursor-pointer ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-[#FBBF24] text-[#0A0A12] border-[#FBBF24] font-bold shadow-md shadow-[#FBBF24]/20'
                            : 'bg-[rgba(251,191,36,0.1)] text-[#FBBF24] border-[rgba(251,191,36,0.25)] hover:border-[#FBBF24]/50'
                        }`}
                      >
                        <span className="font-semibold">{kw.keyword}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${selectedKeyword?.keyword === kw.keyword ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LOW PRIORITY / NICE TO HAVE */}
              {lowPriority.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#22D3EE] mb-2.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>NICE TO HAVE (Complementary Tools & Methodologies)</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {lowPriority.map((kw, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedKeyword(selectedKeyword?.keyword === kw.keyword ? null : kw)}
                        className={`group px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 cursor-pointer ${
                          selectedKeyword?.keyword === kw.keyword
                            ? 'bg-[#22D3EE] text-[#0A0A12] border-[#22D3EE] font-bold shadow-md shadow-[#22D3EE]/20'
                            : 'bg-[rgba(124,92,255,0.12)] text-[#22D3EE] border-[rgba(124,92,255,0.25)] hover:border-[#22D3EE]/50'
                        }`}
                      >
                        <span className="font-semibold">{kw.keyword}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${selectedKeyword?.keyword === kw.keyword ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drawer: Detailed context on clicked keyword */}
              {selectedKeyword && (
                <div className="mt-4 p-4 rounded-2xl bg-[#181826] border border-[rgba(255,255,255,0.08)] text-xs text-[#B4B4C8] space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F5F5FA] text-sm">{selectedKeyword.keyword}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[rgba(255,255,255,0.08)] text-[#22D3EE]">
                        {selectedKeyword.priority} PRIORITY
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedKeyword(null)}
                      className="text-xs text-[#8A8AA3] hover:text-[#F5F5FA] min-h-[44px] px-2 flex items-center cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="leading-relaxed">
                    <strong className="text-[#F5F5FA]">Why it matters:</strong> {selectedKeyword.reason}
                  </p>
                  {selectedKeyword.category && (
                    <p className="text-[11px] text-[#8A8AA3]">
                      Category: <strong className="text-[#22D3EE] capitalize">{selectedKeyword.category}</strong>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* MATCHED SKILLS TAB */
        <div>
          {matchedKeywords.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#181826] border border-[rgba(255,255,255,0.08)] text-xs text-[#8A8AA3] text-center">
              No overlapping skills were matched with the target job description.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {matchedKeywords.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium bg-[rgba(52,211,153,0.1)] text-[#34D399] border border-[rgba(52,211,153,0.25)]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
