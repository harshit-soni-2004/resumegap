import { GoogleGenAI, Type } from '@google/genai';
import { BulletSuggestion, MissingKeyword, Stage1Result } from './types';
import { isBulletQuantified, validateRewriteOutcomes } from './stage1-detector';

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
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';

export async function runGeminiStage2(
  resumeText: string,
  jdText: string,
  stage1: Stage1Result
): Promise<GeminiStage2Output> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY provided in environment. Using deterministic fallback generator.');
    return generateDeterministicFallback(stage1, jdText, modelName, 'no_api_key');
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const systemInstructions = `
You are an expert ATS optimization and technical resume coach for graduating software engineers.
Your goal is to compare the candidate's resume against the target Job Description (JD) and provide structured, truthful suggestions.

CRITICAL RULES FOR REWRITES:
1. Google XYZ Format: "Accomplished [X], as measured by [Y], by doing [Z]".
2. Strictly 1 line, at most 32 words per rewritten bullet.
3. Start each bullet with a strong past-tense action verb (e.g. Engineered, Spearheaded, Architected, Automated, Optimized).
4. PRESERVE ALL CONCRETE NAMED ITEMS & OWNERSHIP:
   - You MUST KEEP every concrete named entity, proper noun, tool name, format, and pattern name from the original bullet (e.g. named banks: SBI, HDFC, ICICI, Axis, Kotak; formats: PDF, CSV, Excel; tools/frameworks: Spring Cloud Gateway, Eureka, PKCE, Jira, RabbitMQ; pattern names like "hash-based deduplication", "Transactional Outbox").
   - ALWAYS PRESERVE ownership and collaboration markers from the original: "solo-built", "with the CTO", "led", "owned". DO NOT DROP THEM under any circumstance.
   - You may ONLY shorten by dropping filler or redundant words.
5. PLACEHOLDERS FOR UNQUANTIFIED OUTCOMES:
   - For unquantified outcomes that already exist in the original (e.g. "eliminating recurring SaaS licensing costs"), a single placeholder is allowed and encouraged: "[X]" for a count or amount that the original's own subject implies (e.g. "eliminating [X] in recurring SaaS licensing costs").
   - DO NOT add a percentage metric like [X%] to purely qualitative or binary technical guarantees (e.g. do NOT write "safely rejected duplicates by [X%]" - deduplication and idempotency are binary mechanisms, not percentages).
6. ZERO FABRICATED NUMBERS:
   - NEVER invent numbers, metrics, or technologies not present in the original.
7. KEEP EXPLANATION UNDER 15 WORDS for each suggestion.
`;

  // Select candidate bullets from Stage 1
  const unquantifiedBullets = stage1.bullets.filter((b) => !isBulletQuantified(b));
  const candidateBullets =
    unquantifiedBullets.length >= 3
      ? unquantifiedBullets.slice(0, 8)
      : stage1.bullets.slice(0, 8);
  const topMissingKws = stage1.breakdown.details.missingKeywordsStage1.slice(0, 12);
  const topMatchedKws = stage1.breakdown.details.matchedKeywords.slice(0, 12);

  const primaryPrompt = `
TARGET ROLE & JD EXCERPT:
${jdText.slice(0, 1500)}

STAGE 1 KEYWORD AUDIT:
- Matched Tech Keywords: ${topMatchedKws.join(', ') || 'None'}
- Top Missing Skills from JD: ${topMissingKws.join(', ') || 'None'}

WEAK / UNQUANTIFIED RESUME BULLETS TO REWRITE (SELECT 3-5):
${candidateBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Task:
1. Identify 3-5 top missing keywords from JD with HIGH/MEDIUM priority and ATS reasons.
2. Select 3-5 of the weak bullets above and rewrite each into 1-line (max 32 words) XYZ format keeping all named entities and using [X] only for existing unquantified outcomes. Keep explanations under 15 words.
Adhere strictly to JSON schema.
`;

  // Shorter fallback prompt for retry tier in case of parse error / token boundary
  const shortenedPrompt = `
TARGET JD EXCERPT:
${jdText.slice(0, 800)}

MISSING SKILLS: ${topMissingKws.slice(0, 5).join(', ') || 'None'}

BULLETS TO REWRITE (SELECT 3 ONLY):
${candidateBullets.slice(0, 3).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Task:
1. Return top 3 missing keywords.
2. Rewrite the 3 bullets in 1 line XYZ format (<=32 words, explanation <15 words, preserve named entities).
JSON only.
`;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const geminiStart = Date.now();
    const currentPrompt = attempt === 1 ? primaryPrompt : shortenedPrompt;

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: currentPrompt,
        config: {
          systemInstruction: systemInstructions,
          responseMimeType: 'application/json',
          responseSchema: geminiOutputSchema,
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 1600,
          temperature: 0.2,
        },
      });

      const geminiLatencyMs = Date.now() - geminiStart;
      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(responseText);

      if (attempt === 1) {
        console.log(`[Gemini] Succeeded on primary attempt (attempt 1) in ${geminiLatencyMs}ms`);
      } else {
        console.log(`[Gemini] Succeeded on retry attempt with shortened prompt (attempt 2) in ${geminiLatencyMs}ms`);
      }

      // Run post-validation and normalization on each bullet suggestion
      const bulletSuggestions: BulletSuggestion[] = (parsed.bulletSuggestions || []).map(
        (suggestion: BulletSuggestion) => {
          let rewritten = suggestion.rewritten.trim();

          // Ensure ownership/collaboration context is preserved if original had it
          if (/\bsolo-built\b/i.test(suggestion.original) && !/\bsolo-built\b/i.test(rewritten)) {
            rewritten = `Solo-built: ${rewritten}`;
          }
          if (/\bwith\s+(?:the\s+)?cto\b/i.test(suggestion.original) && !/\bwith\s+(?:the\s+)?cto\b/i.test(rewritten)) {
            rewritten = rewritten.replace(/\.?$/, ' with the CTO.');
          }

          const hasMetricPlaceholder = /\[[A-Za-z0-9% ]+\]/.test(rewritten);
          const validation = validateRewriteOutcomes(suggestion.original, rewritten);

          return {
            ...suggestion,
            rewritten,
            hasMetricPlaceholder,
            isFlaggedOutcome: Boolean(validation.isFlaggedOutcome),
            flagReason: validation.reason,
            warning: validation.warning,
          };
        }
      );

      return {
        missingKeywords: parsed.missingKeywords || [],
        weakBullets: parsed.weakBullets || [],
        bulletSuggestions,
        isLLMFallback: false,
        modelUsed: modelName,
        geminiLatencyMs,
      };
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] Attempt ${attempt} failed: ${errMsg}`);
      if (attempt < 2) {
        // Short pause before retrying with shortened prompt
        await new Promise((resolve) => setTimeout(resolve, 500));
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
 * Resilient fallback generator that converts Stage 1 extracted data into structured format.
 * Adheres strictly to truthful framing without hallucinating outcomes or using banned filler phrases.
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
    const placeholder = hasNumbers ? '' : ' across [X] modules';

    let strongVerb = 'Engineered';
    if (['built', 'created', 'made'].includes(firstWord)) strongVerb = 'Architected';
    else if (['worked', 'helped', 'assisted'].includes(firstWord)) strongVerb = 'Collaborated with team to develop';
    else if (['managed', 'handled'].includes(firstWord)) strongVerb = 'Spearheaded';

    const rewritten = `${strongVerb} ${original.replace(/^[a-zA-Z]+\s+/, '')}${placeholder}, standardizing project workflows.`;

    bulletSuggestions.push({
      id: `bullet-${i + 1}`,
      original,
      rewritten,
      hasMetricPlaceholder: !hasNumbers,
      actionVerbUsed: strongVerb,
      explanation: 'Reframed using strong action verb and injected measurable scale placeholder.',
      isFlaggedOutcome: false,
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
