'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BarChart2 } from 'lucide-react';
import ResumeGapLogo from './ResumeGapLogo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 surface-1 backdrop-blur-xl relative">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group focus-ring rounded-xl p-1 -ml-1">
          <ResumeGapLogo size={42} className="group-hover:scale-105 transition-transform duration-300" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#F8F8FC]">
                Resume<span className="text-accent-gradient">Gap</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[rgba(139,108,255,0.15)] text-[#2DD4F5] border border-[rgba(139,108,255,0.3)]">
                AI + ATS Copilot
              </span>
            </div>
            <p className="text-[11px] text-[#C4C4D6] hidden sm:block font-medium">
              Engineered for Off-Campus Indian Engineering Grads
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full surface-2 text-[#C4C4D6] text-xs font-medium border border-[rgba(255,255,255,0.08)] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4F5]" />
            <span>Not stored by ResumeGap</span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium text-[#C4C4D6] hover:text-[#F8F8FC] hover:bg-[rgba(255,255,255,0.06)] rounded-xl transition-all focus-ring"
            title="PM Analytics Dashboard"
          >
            <BarChart2 className="w-4 h-4 text-[#C4C4D6]" />
            <span>PM Metrics</span>
          </Link>
        </div>
      </div>

      {/* Hairline bottom border that softly fades at the edges */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.12)] to-transparent pointer-events-none" />
    </header>
  );
}
