import { GoogleGenAI, Type } from '@google/genai';
import { BulletSuggestion, MissingKeyword, Stage1Result } from './types';
import { isBulletQuantified } from './stage1-detector';

export interface GeminiStage2Output {
  missingKeywords: MissingKeyword[];
  weakBullets: string[];
  bulletSuggestions: BulletSuggestion[];
  isLLMFallback: boolean;
  fallbackReason?: 'quota' | 'no_api_key' | 'api_error';
  modelUsed: string;
  geminiLatencyMs: number;
}

const geminiOutputSchema = {
  type: Type.OBJECT,
  properties: {
    missingKeywords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
          reason: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ['keyword', 'priority', 'reason'],
      },
    },
    weakBullets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    bulletSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          original: { type: Type.STRING },
          rewritten: { type: Type.STRING },
          hasMetricPlaceholder: { type: Type.BOOLEAN },
          actionVerbUsed: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'original', 'rewritten', 'hasMetricPlaceholder', 'actionVerbUsed', 'explanation'],
      },
    },
  },
  required: ['missingKeywords', 'weakBullets', 'bulletSuggestions'],
};

/**
 * Stage 2: Call Gemini Flash to identify missing keywords and rewrite bullets using XYZ format.
 */
export async function runGeminiStage2(
  resumeText: string,
  jdText: string,
  stage1: Stage1Result
): Promise<GeminiStage2Output> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY provided in environment. Using deterministic fallback generator.');
    return generateDeterministicFallback(stage1, jdText, modelName, 'no_api_key');
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const systemInstructions = `
You are an expert ATS optimization and executive technical resume copilot for graduating software engineers.
Your goal is to compare the student's resume against the target Job Description (JD) and provide structured, highly actionable suggestions.

CRITICAL RULES:
1. MISSING KEYWORDS:
   - Identify critical technical skills, tools, or domain concepts present in the JD but missing from the resume.
   - Categorize priority into HIGH (core requirement), MEDIUM (preferred / framework), LOW (bonus tool).
   - Provide a 1-sentence reason why it matters for ATS filtering.

2. WEAK BULLET POINTS & XYZ REWRITES:
   - Select 3 to 5 weak, vague, or unquantified bullet points from the provided candidate bullets.
   - Rewrite each bullet using the Google XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".
   - Keep each rewritten bullet strictly to ONE line.
   - Start each bullet with a strong past-tense action verb (e.g., Engineered, Spearheaded, Accelerated, Optimized, Architected).
   - STRICT TRUTHFULNESS: NEVER fabricate numbers, metrics, or technologies.
   - If a metric or measurable impact is missing from the original bullet, YOU MUST INSERT A PLACEHOLDER like "[X%]" or "[Y users]" or "[Z ms]" and set "hasMetricPlaceholder": true.
   - Explain why the rewrite improves ATS parser visibility and recruiter readability.
`;

  // Select up to 8 weak/unquantified bullets from Stage 1 to prune prompt size
  const unquantifiedBullets = stage1.bullets.filter((b) => !isBulletQuantified(b));
  const candidateBullets =
    unquantifiedBullets.length >= 3
      ? unquantifiedBullets.slice(0, 8)
      : stage1.bullets.slice(0, 8);
  const topMissingKws = stage1.breakdown.details.missingKeywordsStage1.slice(0, 12);
  const topMatchedKws = stage1.breakdown.details.matchedKeywords.slice(0, 12);

  const prompt = `
TARGET ROLE & JD EXCERPT:
${jdText.slice(0, 1500)}

STAGE 1 KEYWORD AUDIT:
- Matched Tech Keywords: ${topMatchedKws.join(', ') || 'None'}
- Top Missing Skills from JD: ${topMissingKws.join(', ') || 'None'}

WEAK / UNQUANTIFIED RESUME BULLETS TO REWRITE (SELECT 3-5):
${candidateBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Task:
1. Identify 3-5 top missing keywords from JD with HIGH/MEDIUM priority and ATS importance reasons.
2. Select 3-5 of the weak bullets above and rewrite each into single-line XYZ format with [X%] or [Y users] placeholders where impact is unquantified.
Adhere strictly to JSON schema.
`;

  // Attempt up to 2 times (1 retry)
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const geminiStart = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstructions,
          responseMimeType: 'application/json',
          responseSchema: geminiOutputSchema,
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 1200,
          temperature: 0.2, // Low temperature for consistency and adherence to truthfulness
        },
      });

      const geminiLatencyMs = Date.now() - geminiStart;

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(responseText);

      return {
        missingKeywords: parsed.missingKeywords || [],
        weakBullets: parsed.weakBullets || [],
        bulletSuggestions: parsed.bulletSuggestions || [],
        isLLMFallback: false,
        modelUsed: modelName,
        geminiLatencyMs,
      };
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] Attempt ${attempt} failed:`, errMsg);
      if (attempt < 2) {
        // Short exponential wait before retry
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  const errString = String(lastError instanceof Error ? lastError.message : lastError || '').toLowerCase();
  const isQuota =
    errString.includes('429') ||
    errString.includes('quota') ||
    errString.includes('resource_exhausted') ||
    errString.includes('rate limit');

  const fallbackReason: 'quota' | 'api_error' = isQuota ? 'quota' : 'api_error';

  console.error(
    `[Gemini] All attempts failed (${fallbackReason}). Falling back to deterministic Stage 1 generator:`,
    lastError instanceof Error ? lastError.message : 'Unknown'
  );

  return generateDeterministicFallback(stage1, jdText, `${modelName} (fallback)`, fallbackReason);
}

/**
 * Resilient fallback generator that converts Stage 1 extracted data into the full structured format.
 * Used when GEMINI_API_KEY is not configured or in case of network / rate quota failure.
 */
export function generateDeterministicFallback(
  stage1: Stage1Result,
  jdText: string,
  modelName: string,
  fallbackReason: 'quota' | 'no_api_key' | 'api_error' = 'api_error'
): GeminiStage2Output {
  const missingFromStage1 = stage1.breakdown.details.missingKeywordsStage1;

  const missingKeywords: MissingKeyword[] = missingFromStage1.slice(0, 8).map((kw, idx) => {
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (idx < 2) priority = 'HIGH';
    else if (idx >= 5) priority = 'LOW';

    return {
      keyword: kw,
      priority,
      reason: `Found in target job description but absent from resume technical skills or project descriptions.`,
      category: 'framework',
    };
  });

  const bullets = stage1.bullets;
  const weakBullets: string[] = [];
  const bulletSuggestions: BulletSuggestion[] = [];

  // Pick unquantified or short bullets to rewrite
  for (let i = 0; i < Math.min(bullets.length, 5); i++) {
    const original = bullets[i];
    weakBullets.push(original);

    // Clean original of any leading verb
    const firstWordMatch = original.match(/^([a-zA-Z]+)\b/);
    const firstWord = firstWordMatch ? firstWordMatch[1].toLowerCase() : 'developed';
    
    // Check if original has numbers
    const hasNumbers = /\d+/.test(original);
    const placeholder = hasNumbers ? '' : ' by [X%]';

    let strongVerb = 'Engineered';
    if (['built', 'created', 'made'].includes(firstWord)) strongVerb = 'Architected';
    else if (['worked', 'helped', 'assisted'].includes(firstWord)) strongVerb = 'Collaborated with team to develop';
    else if (['managed', 'handled'].includes(firstWord)) strongVerb = 'Spearheaded';

    const rewritten = `${strongVerb} ${original.replace(/^[a-zA-Z]+\s+/, '')}${placeholder}, improving system reliability and performance.`;

    bulletSuggestions.push({
      id: `bullet-${i + 1}`,
      original,
      rewritten,
      hasMetricPlaceholder: !hasNumbers,
      actionVerbUsed: strongVerb,
      explanation: 'Reframed using strong action verb and injected measurable impact placeholder [X%].',
      status: 'pending',
    });
  }

  return {
    missingKeywords,
    weakBullets,
    bulletSuggestions,
    isLLMFallback: true,
    fallbackReason,
    modelUsed: modelName,
    geminiLatencyMs: 0,
  };
}
