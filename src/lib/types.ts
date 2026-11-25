export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MissingKeyword {
  keyword: string;
  priority: Priority;
  reason: string;
  category?: 'language' | 'framework' | 'database' | 'cloud' | 'tool' | 'concept';
}

export interface BulletSuggestion {
  id: string;
  original: string;
  rewritten: string;
  hasMetricPlaceholder: boolean;
  actionVerbUsed: string;
  explanation: string;
  warning?: string;
  isFlaggedOutcome: boolean;
  flagReason?: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface ATSScoreBreakdown {
  overallScore: number; // 0-100
  roleFitScore: number; // 0-100 (Keywords + Seniority fit to target JD)
  resumeQualityScore: number; // 0-100 (Quantified impact + Section completeness)
  keywordScore: number; // 0-100 (50% weight)
  quantifiedScore: number; // 0-100 (25% weight)
  seniorityScore: number; // 0-100 (15% weight)
  sectionsScore: number; // 0-100 (10% weight)
  details: {
    totalJdKeywords: number;
    matchedKeywordsCount: number;
    matchedKeywords: string[];
    missingKeywordsStage1: string[];
    totalBulletsDetected: number;
    quantifiedBulletsDetected: number;
    quantifiedRatio: number; // 0 - 1
    detectedSeniority: {
      jdLevel: string;
      resumeLevel: string;
      isMatch: boolean;
    };
    detectedSections: {
      hasExperience: boolean;
      hasEducation: boolean;
      hasSkills: boolean;
      hasProjects: boolean;
      hasContact: boolean;
    };
  };
}

export interface Stage1Result {
  rawResumeText: string;
  cleanResumeText: string;
  pageCount: number;
  wordCount: number;
  bullets: string[];
  breakdown: ATSScoreBreakdown;
  isScannedOrImagePdf?: boolean;
}

export interface AnalysisResult {
  score: ATSScoreBreakdown;
  missingKeywords: MissingKeyword[];
  weakBullets: string[];
  bulletSuggestions: BulletSuggestion[];
  stage1Summary: {
    wordCount: number;
    pageCount: number;
    quantifiedRatioPercent: number;
    matchedKeywordCount: number;
    totalDetectedBullets: number;
  };
  metadata: {
    latencyMs: number;
    geminiLatencyMs?: number;
    isLLMFallback: boolean;
    fallbackReason?: 'quota' | 'no_api_key' | 'api_error';
    modelUsed: string;
    analyzedAt: string;
  };
}

export interface AnalyticsEvent {
  id?: string;
  sessionId: string;
  eventName:
    | 'page_view'
    | 'resume_uploaded'
    | 'analysis_completed'
    | 'bullet_accepted'
    | 'bullet_rejected'
    | 'bullets_copied'
    | 'feedback_submitted'
    | 'gemini_fallback'
    | 'returning_visit';
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface FeedbackPayload {
  sessionId: string;
  helpful: boolean;
  comment?: string;
  score?: number;
  createdAt: string;
}

export interface AdminStats {
  storageProvider: 'supabase' | 'filesystem' | 'memory';
  isPersistent: boolean;
  totalAnalyses: number;
  aiAnalysesCount: number;
  fallbackAnalysesCount: number;
  avgScore: number;
  avgLatencyMs: number; // strictly over non-fallback AI runs
  avgGeminiLatencyMs: number; // strictly over non-fallback AI runs
  avgFallbackLatencyMs: number; // latency of fallback runs
  geminiFallbackCount: number;
  totalBulletDecisions: number;
  acceptedBullets: number;
  rejectedBullets: number;
  bulletAcceptanceRate: number; // 0 - 100 (North Star)
  totalFeedback: number;
  positiveFeedbackCount: number;
  feedbackPositiveRate: number; // 0 - 100
  totalSessions: number;
  oneDayCohortSize: number;
  oneDayReturnedSessions: number;
  oneDayReturnRate: number; // 0 - 100
  sevenDayCohortSize: number;
  sevenDayReturnedSessions: number;
  sevenDayReturnRate: number; // 0 - 100
  retentionQueryDescription?: string;
  retentionCohortSql?: string;
  recentEvents: Array<{
    eventName: string;
    timestamp: string;
    sessionId: string;
    summary: string;
  }>;
  recentFeedback: Array<{
    helpful: boolean;
    comment?: string;
    createdAt: string;
  }>;
}
