'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, BarChart2 } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Resume<span className="text-blue-600">Gap</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AI + ATS Copilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Engineered for Off-Campus Indian Engineering Grads
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Private • No Resume Stored</span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="PM Analytics Dashboard"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>PM Metrics</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
