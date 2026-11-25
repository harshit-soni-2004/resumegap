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
      {/* Sample Auto-fill Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[rgba(24,24,38,0.55)] backdrop-blur-md border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2.5 text-xs text-[#F5F5FA] font-medium">
          <Sparkles className="w-4 h-4 text-[#22D3EE] shrink-0" />
          <span>Want to test immediately? Load a verified Indian SDE Fresher resume & CloudScale JD:</span>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-accent-gradient text-[#0A0A12] text-xs font-bold shrink-0 shadow-md shadow-[#7C5CFF]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          Load Sample SDE Resume & JD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Resume Upload Area */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-[#B4B4C8] mb-2 flex items-center justify-between">
            <span>1. Upload Resume (PDF)</span>
            <span className="text-[11px] font-normal text-[#8A8AA3]">Max 5 MB • Text-based</span>
          </label>

          {useSampleData ? (
            <div className="flex-1 min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-[#7C5CFF]/50 bg-[#181826]/80 flex flex-col items-center justify-center text-center relative">
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#8A8AA3] hover:text-[#F5F5FA] hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                title="Remove sample"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-[rgba(124,92,255,0.15)] text-[#22D3EE] flex items-center justify-center mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F5F5FA]">Sample SDE Resume Loaded</h4>
              <p className="text-xs text-[#B4B4C8] mt-1 max-w-xs">
                Arjun Patel — B.Tech CS 2025 (PES University, React, Node.js, PostgreSQL)
              </p>
              <span className="mt-3 text-[11px] font-semibold text-[#22D3EE] bg-[rgba(124,92,255,0.2)] border border-[#7C5CFF]/30 px-3 py-1 rounded-full">
                Ready for Analysis
              </span>
            </div>
          ) : selectedFile ? (
            <div className="flex-1 min-h-[220px] p-5 rounded-2xl border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.05)] flex flex-col items-center justify-center text-center relative">
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#8A8AA3] hover:text-[#F5F5FA] hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-[rgba(52,211,153,0.15)] text-[#34D399] flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F5F5FA] truncate max-w-xs">{selectedFile.name}</h4>
              <p className="text-xs text-[#8A8AA3] mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB • PDF Ready
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 min-h-[44px] px-3.5 py-2 text-xs text-[#22D3EE] hover:underline font-medium inline-flex items-center justify-center cursor-pointer"
              >
                Change PDF
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[#7C5CFF]/60 bg-[rgba(24,24,38,0.45)] backdrop-blur-md hover:bg-[rgba(24,24,38,0.65)] transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="w-12 h-12 rounded-xl bg-[#11111C] border border-[rgba(255,255,255,0.08)] text-[#8A8AA3] group-hover:text-[#22D3EE] group-hover:scale-105 transition-all shadow-sm flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#F5F5FA]">
                Click or drag & drop your resume PDF
              </p>
              <p className="text-xs text-[#8A8AA3] mt-1">
                Supports single or multi-page PDF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Right: Target Job Description Textarea */}
        <div className="flex flex-col">
          <label className="text-xs font-bold uppercase tracking-wider text-[#B4B4C8] mb-2 flex items-center justify-between">
            <span>2. Target Job Description (JD)</span>
            <span className="text-[11px] font-normal text-[#8A8AA3]">
              {jobDescription.length} characters
            </span>
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
            placeholder="Paste the target job description here (Role, Responsibilities, Required Tech Stack, Qualifications)..."
            className="flex-1 min-h-[220px] w-full p-4 text-xs text-[#F5F5FA] bg-[rgba(24,24,38,0.45)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-2xl focus:outline-none focus:border-[#7C5CFF]/60 placeholder-[#8A8AA3] leading-relaxed resize-none transition-colors"
          />
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[rgba(251,113,133,0.1)] border border-[rgba(251,113,133,0.25)] text-[#FB7185] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Submit Button */}
      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[280px] min-h-[48px] px-8 py-3.5 rounded-2xl bg-accent-gradient text-[#0A0A12] font-bold text-sm shadow-lg shadow-[#7C5CFF]/25 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0A0A12]/30 border-t-[#0A0A12] rounded-full animate-spin" />
              <span>Analyzing ATS Gaps...</span>
            </>
          ) : (
            <>
              <span>Analyze ATS Match & Rewrite Bullets</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-[11px] text-[#8A8AA3] mt-2">
          ⚡ Usually under 5 seconds • Deterministic ATS score • No sign-up needed
        </p>
        <p className="text-[11px] text-[#34D399] font-medium mt-1 flex items-center justify-center gap-1">
          <span>🔒 Not stored by ResumeGap. Text is sent to Google&apos;s Gemini API for analysis.</span>
        </p>
      </div>
    </form>
  );
}
