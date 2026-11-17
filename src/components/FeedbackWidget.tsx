'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { getOrCreateSessionId } from '@/lib/client-analytics';

interface FeedbackWidgetProps {
  score?: number;
}

export default function FeedbackWidget({ score }: FeedbackWidgetProps) {
  const [selectedHelpful, setSelectedHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (helpful: boolean, finalComment: string = comment) => {
    setIsSubmitting(true);
    setSelectedHelpful(helpful);

    try {
      const sessionId = getOrCreateSessionId();
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          helpful,
          comment: finalComment,
          score,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback submit error', err);
      // Still show pleasant submitted state
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">Thank you for your feedback!</h4>
        <p className="text-xs text-slate-500 mt-1">
          Your input directly guides our ATS model improvements for graduating engineers across India.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Did this analysis help your resume?</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Your 1-click answer powers our anonymous product evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all ${
              selectedHelpful === true
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>Yes, helpful!</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all ${
              selectedHelpful === false
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <ThumbsDown className="w-4 h-4 text-rose-500" />
            <span>Needs work</span>
          </button>
        </div>
      </div>

      {selectedHelpful !== null && !submitted && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 animate-fade-in">
          <div className="relative flex-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional: What could we improve or add? (e.g. specific tech stack)"
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[44px]"
            />
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
          </div>
          <button
            onClick={() => handleSubmit(selectedHelpful, comment)}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      )}
    </div>
  );
}
