'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME_TEXT } from '@/lib/sample-data';
import { trackEvent } from '@/lib/client-analytics';

interface UploadDropzoneProps {
  onAnalyze: (payload: { file?: File; resumeText?: string; jobDescription: string }) => void;
  isLoading: boolean;
}

export default function UploadDropzone({ onAnalyze, isLoading }: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      setErrorMessage('Please select a valid PDF (.pdf) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit. Please upload a smaller PDF.');
      return;
    }

    setSelectedFile(file);
    setUseSampleData(false);
    trackEvent('resume_uploaded', {
      fileSizeKb: Math.round(file.size / 1024),
      fileName: file.name,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setErrorMessage(null);
    setSelectedFile(null);
    setUseSampleData(true);
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUseSampleData(false);
    setJobDescription('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile && !useSampleData) {
      setErrorMessage('Please upload your resume PDF or click "Load Sample Off-Campus Resume".');
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setErrorMessage('Please paste the target job description (at least 30 characters).');
      return;
    }

    if (useSampleData) {
      onAnalyze({
        resumeText: SAMPLE_RESUME_TEXT,
        jobDescription: jobDescription.trim(),
      });
    } else if (selectedFile) {
      onAnalyze({
        file: selectedFile,
        jobDescription: jobDescription.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Sample Auto-fill Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Want to test immediately? Load a verified Indian SDE Fresher resume & CloudScale JD:</span>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 shadow-sm transition-colors active:scale-95 flex items-center justify-center"
        >
          Load Sample SDE Resume & JD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Resume Upload Area */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
            <span>1. Upload Resume (PDF)</span>
            <span className="text-[11px] font-normal text-slate-400">Max 5 MB • Text-based</span>
          </label>

          {useSampleData ? (
            <div className="flex-1 min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 flex flex-col items-center justify-center text-center relative">
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Remove sample"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Sample SDE Resume Loaded</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Arjun Patel — B.Tech CS 2025 (PES University, React, Node.js, PostgreSQL)
              </p>
              <span className="mt-3 text-[11px] font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Ready for Analysis
              </span>
            </div>
          ) : selectedFile ? (
            <div className="flex-1 min-h-[220px] p-5 rounded-2xl border border-emerald-300 bg-emerald-50/30 flex flex-col items-center justify-center text-center relative">
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs">{selectedFile.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB • PDF Ready
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 min-h-[44px] px-3 py-2 text-xs text-slate-600 hover:text-slate-900 underline font-medium inline-flex items-center justify-center"
              >
                Change PDF
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:text-blue-600 group-hover:scale-105 transition-all shadow-sm flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click or drag & drop your resume PDF
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports single or multi-page PDF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Right: Target Job Description Textarea */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
            <span>2. Target Job Description (JD)</span>
            <span className="text-[11px] font-normal text-slate-400">
              {jobDescription.length} characters
            </span>
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
            placeholder="Paste the target job description here (Role, Responsibilities, Required Tech Stack, Qualifications)..."
            className="flex-1 min-h-[220px] w-full p-4 text-xs text-slate-800 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed resize-none transition-colors"
          />
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Submit Button */}
      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[280px] min-h-[48px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-2 mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing ATS Gaps...</span>
            </>
          ) : (
            <>
              <span>Analyze ATS Match & Rewrite Bullets</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          ⚡ Sub-5s analysis • Deterministic ATS score • No login required
        </p>
        <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center justify-center gap-1">
          <span>🔒 Your resume is processed in memory and never stored.</span>
        </p>
      </div>
    </form>
  );
}
