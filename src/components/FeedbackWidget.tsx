'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, Send } from 'lucide-react';
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
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl rounded-3xl border border-[rgba(52,211,153,0.3)] p-6 md:p-8 text-center shadow-2xl animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(52,211,153,0.15)] text-[#34D399] mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-[#F5F5FA]">Thank you for your feedback!</h4>
        <p className="text-xs text-[#8A8AA3] mt-1 max-w-md mx-auto">
          Your input directly guides our ATS model improvements for graduating engineers across India.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(17,17,28,0.60)] backdrop-blur-xl rounded-3xl border border-[rgba(255,255,255,0.08)] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[#F5F5FA]">Did this analysis help your resume?</h4>
          <p className="text-xs text-[#8A8AA3] mt-0.5">
            Your 1-click answer powers our anonymous product evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedHelpful === true
                ? 'bg-[#34D399] text-[#0A0A12] border-[#34D399] font-bold shadow-md shadow-[#34D399]/20'
                : 'bg-[#181826] text-[#34D399] border-[rgba(52,211,153,0.25)] hover:bg-[#34D399] hover:text-[#0A0A12]'
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-[#34D399]" />
            <span>Yes, helpful!</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedHelpful === false
                ? 'bg-[#FB7185] text-[#0A0A12] border-[#FB7185] font-bold shadow-md shadow-[#FB7185]/20'
                : 'bg-[#181826] text-[#FB7185] border-[rgba(251,113,133,0.25)] hover:bg-[#FB7185] hover:text-[#0A0A12]'
            }`}
          >
            <ThumbsDown className="w-4 h-4 text-[#FB7185]" />
            <span>Needs work</span>
          </button>
        </div>
      </div>

      {selectedHelpful !== null && !submitted && (
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-2.5 animate-fade-in">
          <div className="relative flex-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could be improved? (optional)"
              className="w-full min-h-[44px] px-4 text-xs text-[#F5F5FA] bg-[#181826] border border-[rgba(255,255,255,0.08)] rounded-xl focus:outline-none focus:border-[#7C5CFF]/60 placeholder-[#8A8AA3]"
            />
          </div>
          <button
            onClick={() => handleSubmit(selectedHelpful, comment)}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-accent-gradient text-[#0A0A12] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#7C5CFF]/20 hover:brightness-110 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      )}
    </div>
  );
}
