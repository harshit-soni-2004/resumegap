'use client';

import React, { useState } from 'react';
import { BulletSuggestion } from '@/lib/types';
import { Check, X, Copy, CheckCheck, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/client-analytics';

interface BulletDiffViewProps {
  bulletSuggestions: BulletSuggestion[];
}

export default function BulletDiffView({ bulletSuggestions: initialSuggestions }: BulletDiffViewProps) {
  const [suggestions, setSuggestions] = useState<BulletSuggestion[]>(initialSuggestions);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);

  const handleDecision = (id: string, decision: 'accepted' | 'rejected') => {
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );

    if (decision === 'accepted') {
      trackEvent('bullet_accepted', { bulletId: id });
    } else {
      trackEvent('bullet_rejected', { bulletId: id });
    }
  };

  const handleCopySingle = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      trackEvent('bullets_copied', { count: 1, type: 'single' });
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleCopyAllAccepted = async () => {
    const accepted = suggestions.filter((s) => s.status === 'accepted');
    const bulletsToCopy = accepted.length > 0 ? accepted : suggestions;
    const formatted = bulletsToCopy.map((b) => `• ${b.rewritten}`).join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2500);
      trackEvent('bullets_copied', { count: bulletsToCopy.length, type: 'all' });
    } catch (err) {
      console.error('Failed to copy all bullets', err);
    }
  };

  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;

  return (
    <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#F5F5FA] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22D3EE]" />
              High-Impact XYZ Bullet Rewrites
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(124,92,255,0.15)] text-[#22D3EE] border border-[rgba(124,92,255,0.3)]">
              Google XYZ Formula
            </span>
          </div>
          <p className="text-xs text-[#8A8AA3] mt-1">
            Reframe weak or unquantified bullets into: <em>&ldquo;Accomplished [X] measured by [Y] by doing [Z]&rdquo;</em>
          </p>
        </div>

        <button
          onClick={handleCopyAllAccepted}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-accent-gradient text-[#0A0A12] text-xs font-bold shadow-md shadow-[#7C5CFF]/20 hover:brightness-110 transition-all self-start sm:self-auto shrink-0 active:scale-95 cursor-pointer"
        >
          {copyAllSuccess ? (
            <>
              <CheckCheck className="w-4 h-4 text-[#0A0A12]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>
                {acceptedCount > 0 ? `Copy Accepted (${acceptedCount})` : 'Copy All Rewrites'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Guidelines reminder banner */}
      <div className="mb-6 p-4 rounded-2xl bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] text-[#FBBF24] text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#F5F5FA]">Zero-Hallucination Guarantee:</span> We never fabricate numbers or experience. Where metrics were missing, we inserted <code className="bg-[#181826] text-[#22D3EE] border border-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded font-mono font-bold">[X%]</code> placeholders for you to fill with your real impact before submitting.
        </div>
      </div>

      {/* Bullet Cards */}
      <div className="space-y-4">
        {suggestions.map((item, index) => {
          const isAccepted = item.status === 'accepted';
          const isRejected = item.status === 'rejected';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAccepted
                  ? 'border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.06)]'
                  : isRejected
                  ? 'border-[rgba(255,255,255,0.06)] bg-[#181826]/40 opacity-50'
                  : 'border-[rgba(255,255,255,0.08)] bg-[#181826] hover:border-[rgba(255,255,255,0.18)] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-[#8A8AA3] uppercase tracking-wider">
                  Bullet #{index + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySingle(item.id, item.rewritten)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[#B4B4C8] hover:text-[#F5F5FA] hover:bg-[#11111C] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                    title="Copy this rewritten bullet"
                  >
                    {copiedId === item.id ? (
                      <CheckCheck className="w-4 h-4 text-[#34D399]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDecision(item.id, 'rejected')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isRejected
                        ? 'bg-[#FB7185] text-[#0A0A12] border-[#FB7185] font-bold'
                        : 'bg-[#181826] text-[#FB7185] border-[rgba(251,113,133,0.25)] hover:bg-[#FB7185] hover:text-[#0A0A12]'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleDecision(item.id, 'accepted')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isAccepted
                        ? 'bg-[#34D399] text-[#0A0A12] border-[#34D399] font-bold shadow-md shadow-[#34D399]/20'
                        : 'bg-[#181826] text-[#34D399] border-[rgba(52,211,153,0.25)] hover:bg-[#34D399] hover:text-[#0A0A12]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAccepted ? 'Accepted' : 'Accept'}</span>
                  </button>
                </div>
              </div>

              {/* Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs mt-3">
                {/* Original */}
                <div className="p-3.5 rounded-xl bg-[#0A0A12] border border-[rgba(251,113,133,0.2)] text-[#8A8AA3]">
                  <div className="text-[10px] font-bold text-[#FB7185] uppercase tracking-wider mb-1.5">
                    Original Bullet (Weak / Unquantified)
                  </div>
                  <p className="line-through text-[#8A8AA3] leading-relaxed">{item.original}</p>
                </div>

                {/* Rewritten XYZ */}
                <div className="p-3.5 rounded-xl bg-[#0A0A12] border border-[rgba(52,211,153,0.25)] text-[#F5F5FA]">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#22D3EE]" />
                      Rewritten (XYZ Format)
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(item.isFlaggedOutcome || item.warning) && (
                        <span
                          data-testid="outcome-warning-chip"
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.15)] text-[#FBBF24] border border-[rgba(251,191,36,0.3)] flex items-center gap-1"
                          title={item.warning || 'Check this claim is true before using it'}
                        >
                          <AlertTriangle className="w-3 h-3 text-[#FBBF24] shrink-0" />
                          <span>Check this claim is true before using it</span>
                        </span>
                      )}
                      {item.hasMetricPlaceholder && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(124,92,255,0.15)] text-[#22D3EE] border border-[rgba(124,92,255,0.3)]">
                          Fill in [X%]
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-[#F5F5FA] leading-relaxed">
                    {item.rewritten}
                  </p>
                </div>
              </div>

              {/* Explanatory footer */}
              {item.explanation && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8A8AA3]">
                  <ArrowRight className="w-3 h-3 text-[#8A8AA3] shrink-0" />
                  <span>{item.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
