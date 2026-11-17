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
    const bulletsToCopy = accepted.length > 0 ? accepted : suggestions; // If none explicitly clicked, copy all rewritten
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              High-Impact XYZ Bullet Rewrites
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Google XYZ Formula
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reframe weak or unquantified bullets into: <em>&ldquo;Accomplished [X] measured by [Y] by doing [Z]&rdquo;</em>
          </p>
        </div>

        <button
          onClick={handleCopyAllAccepted}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto shrink-0 active:scale-95"
        >
          {copyAllSuccess ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-400" />
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
      <div className="mb-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Zero-Hallucination Guarantee:</span> We never fabricate numbers or experience. Where metrics were missing, we inserted <code className="bg-amber-100/90 text-amber-950 px-1 py-0.5 rounded font-mono font-bold">[X%]</code> placeholders for you to fill with your real impact before submitting.
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
              className={`p-4 rounded-xl border transition-all ${
                isAccepted
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : isRejected
                  ? 'border-slate-200 bg-slate-50/60 opacity-60'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bullet #{index + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySingle(item.id, item.rewritten)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Copy this rewritten bullet"
                  >
                    {copiedId === item.id ? (
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDecision(item.id, 'rejected')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isRejected
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleDecision(item.id, 'accepted')}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isAccepted
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAccepted ? 'Accepted' : 'Accept'}</span>
                  </button>
                </div>
              </div>

              {/* Diff View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                {/* Original */}
                <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-100 text-slate-700">
                  <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">
                    Original Bullet (Weak / Unquantified)
                  </div>
                  <p className="line-through text-slate-500 leading-relaxed">{item.original}</p>
                </div>

                {/* Rewritten XYZ */}
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 text-slate-900">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Rewritten (XYZ Format)
                    </span>
                    {item.hasMetricPlaceholder && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Fill in [X%]
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900 leading-relaxed">
                    {item.rewritten}
                  </p>
                </div>
              </div>

              {/* Explanatory footer */}
              {item.explanation && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
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
