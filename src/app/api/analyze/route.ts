import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf, runStage1Analysis } from '@/lib/stage1-detector';
import { runGeminiStage2 } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit';
import { AnalysisResult } from '@/lib/types';
import { logAnalyticsEvent } from '@/lib/analytics-store';

export const maxDuration = 30;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

  // 1. IP Rate Limiting check
  const rateLimit = await checkRateLimit(ip, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please wait before analyzing another resume.',
        resetInSeconds: rateLimit.resetInSeconds,
      },
      { status: 429 }
    );
  }

  try {
    let resumeText = '';
    let pageCount = 1;
    let jobDescription = '';
    let sessionId = 'anonymous';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const resumeFile = formData.get('resume') as File | null;
      jobDescription = (formData.get('jobDescription') as string || '').trim();
      sessionId = (formData.get('sessionId') as string || '').trim() || 'anonymous';

      if (!resumeFile) {
        return NextResponse.json(
          { error: 'Please upload a resume PDF file.' },
          { status: 400 }
        );
      }

      if (resumeFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 5MB limit. Please upload a smaller PDF.' },
          { status: 400 }
        );
      }

      if (!resumeFile.type.includes('pdf') && !resumeFile.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload a PDF (.pdf) file.' },
          { status: 400 }
        );
      }

      const fileBuffer = await resumeFile.arrayBuffer();

      // Extract text from PDF
      const pdfExtraction = await extractTextFromPdf(fileBuffer);
      pageCount = pdfExtraction.pageCount;

      if (pdfExtraction.isScannedOrImagePdf) {
        return NextResponse.json(
          {
            error:
              'Scanned or image-only PDF detected. ResumeGap requires a text-based PDF to analyze your keywords and bullets. Please export your resume directly from Google Docs, Word, or Canva as a PDF.',
            isScannedPdf: true,
          },
          { status: 422 }
        );
      }

      resumeText = pdfExtraction.text;
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      resumeText = (json.resumeText || '').trim();
      jobDescription = (json.jobDescription || '').trim();
      sessionId = (json.sessionId || '').trim() || 'anonymous';
      pageCount = json.pageCount || 1;
    } else {
      return NextResponse.json(
        { error: 'Unsupported request format. Please use multipart/form-data or application/json.' },
        { status: 400 }
      );
    }

    if (sessionId && sessionId !== 'anonymous') {
      const sessionRateLimit = await checkRateLimit(`session_${sessionId}`, 5, 60 * 60 * 1000);
      if (!sessionRateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Session analysis limit reached (5 analyses per hour). Please wait before analyzing another resume.',
            resetInSeconds: sessionRateLimit.resetInSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Validate inputs
    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the resume. Please check the file contents.' },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.length < 30) {
      return NextResponse.json(
        { error: 'Please paste a target job description (at least 30 characters) to compare against.' },
        { status: 400 }
      );
    }

    // 2. Stage 1: Deterministic Engine (Sub-100ms)
    const stage1Result = runStage1Analysis(resumeText, pageCount, jobDescription);

    // 3. Stage 2: Gemini Flash LLM
    const stage2Result = await runGeminiStage2(resumeText, jobDescription, stage1Result);

    const latencyMs = Date.now() - startTime;

    // Combine into final response
    const analysisResponse: AnalysisResult = {
      score: stage1Result.breakdown,
      missingKeywords: stage2Result.missingKeywords,
      weakBullets: stage2Result.weakBullets,
      bulletSuggestions: stage2Result.bulletSuggestions,
      stage1Summary: {
        wordCount: stage1Result.wordCount,
        pageCount: stage1Result.pageCount,
        quantifiedRatioPercent: Math.round(stage1Result.breakdown.details.quantifiedRatio * 100),
        matchedKeywordCount: stage1Result.breakdown.details.matchedKeywordsCount,
        totalDetectedBullets: stage1Result.bullets.length,
      },
      metadata: {
        latencyMs,
        geminiLatencyMs: stage2Result.geminiLatencyMs,
        isLLMFallback: stage2Result.isLLMFallback,
        fallbackReason: stage2Result.fallbackReason,
        modelUsed: stage2Result.modelUsed,
        analyzedAt: new Date().toISOString(),
      },
    };

    // 4. Log gemini_fallback event if Gemini stage was skipped/failed
    if (stage2Result.isLLMFallback) {
      logAnalyticsEvent({
        sessionId,
        eventName: 'gemini_fallback',
        timestamp: new Date().toISOString(),
        data: {
          reason: stage2Result.fallbackReason || 'api_error',
          modelRequested: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        },
      }).catch((err) => console.error('[Analytics] Failed to log gemini_fallback event:', err instanceof Error ? err.message : 'Unknown'));
    }

    // 5. Log anonymous analysis_completed analytics event asynchronously
    logAnalyticsEvent({
      sessionId,
      eventName: 'analysis_completed',
      timestamp: new Date().toISOString(),
      data: {
        latencyMs,
        geminiLatencyMs: stage2Result.geminiLatencyMs,
        atsScore: stage1Result.breakdown.overallScore,
        missingKeywordCount: stage2Result.missingKeywords.length,
        isLLMFallback: stage2Result.isLLMFallback,
      },
    }).catch((err) => console.error('[Analytics] Failed to log analysis_completed event:', err));

    return NextResponse.json(analysisResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error while analyzing resume.';
    console.error('[Analyze API Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
