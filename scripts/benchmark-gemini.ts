import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_RESUME_TEXT, SAMPLE_JOB_DESCRIPTION } from '../src/lib/sample-data';
import { cleanText, extractBulletPoints, extractKeywords, isBulletQuantified } from '../src/lib/stage1-detector';

import fs from 'fs';
import path from 'path';

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in environment or .env.local');
  process.exit(1);
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

const systemInstructions = `You are an expert ATS optimization and executive technical resume copilot for graduating software engineers.
Identify 3-5 critical missing tech skills from JD and rewrite weak/unquantified bullets using Google's XYZ formula ("Accomplished [X] measured by [Y] by doing [Z]").
Keep each rewritten bullet strictly to one line starting with a strong action verb.
STRICT TRUTHFULNESS: NEVER invent metrics or facts; insert [X%] or [Y users] placeholders where impact is unquantified.`;

async function runBenchmark() {
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  // Stage 1 extraction
  const cleanedResume = cleanText(SAMPLE_RESUME_TEXT);
  const resumeBullets = extractBulletPoints(cleanedResume);
  const resumeKeywords = extractKeywords(cleanedResume);
  const jdKeywords = extractKeywords(SAMPLE_JOB_DESCRIPTION);
  const missingKws = jdKeywords.filter((k) => !resumeKeywords.includes(k));

  // Find unquantified bullets first (up to 8)
  const unquantified = resumeBullets.filter((b) => !isBulletQuantified(b));
  const candidateBullets = unquantified.length >= 3 
    ? unquantified.slice(0, 8) 
    : resumeBullets.slice(0, 8);

  const fullPrompt = `
=== RESUME TEXT ===
${SAMPLE_RESUME_TEXT.slice(0, 10000)}

=== TARGET JOB DESCRIPTION ===
${SAMPLE_JOB_DESCRIPTION.slice(0, 4000)}

=== STAGE 1 DETERMINISTIC AUDIT ===
- Identified Tech Keywords in Resume: ${resumeKeywords.join(', ')}
- Candidate Missing Keywords from JD: ${missingKws.join(', ')}
- Total detected bullet points: ${resumeBullets.length}
- Extracted Resume Bullets:
${resumeBullets.slice(0, 10).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Analyze the resume and return strict JSON adhering to the provided schema.
`;

  const prunedPrompt = `
TARGET ROLE & JD EXCERPT:
${SAMPLE_JOB_DESCRIPTION.slice(0, 1200)}

STAGE 1 KEYWORD AUDIT:
- Resume Tech Skills: ${resumeKeywords.slice(0, 15).join(', ')}
- Top Missing Skills from JD: ${missingKws.slice(0, 12).join(', ')}

WEAK / UNQUANTIFIED RESUME BULLETS TO REWRITE (MAX 8):
${candidateBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Task:
1. Select the top missing keywords from JD with HIGH/MEDIUM priority and brief ATS reason.
2. Select 3-5 of the weak bullets above and rewrite each into single-line XYZ format with [X%] placeholders for unquantified impact.
Adhere strictly to JSON schema.
`;

  console.log('===============================================================');
  console.log('🚀 RUNNING 3-TRIAL BENCHMARK: GEMINI LATENCY & OUTPUT TOKENS');
  console.log('===============================================================\n');

  // CONFIG 1: BEFORE (gemini-2.5-flash, default thinking, full prompt, unconstrained output)
  console.log('--- Config 1: BEFORE (gemini-2.5-flash, default thinking, full prompt) ---');
  const config1Times: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const t0 = Date.now();
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: 'application/json',
        responseSchema: geminiOutputSchema,
        temperature: 0.2,
      },
    });
    const dur = Date.now() - t0;
    config1Times.push(dur);
    console.log(`  Trial ${i}: ${dur}ms | Output length: ${res.text?.length || 0} chars`);
  }
  const avg1 = Math.round(config1Times.reduce((a, b) => a + b, 0) / config1Times.length);
  console.log(`Config 1 Average Latency: ${avg1}ms\n`);

  // CONFIG 2: AFTER (gemini-2.5-flash, thinkingBudget: 0, pruned prompt, maxOutputTokens: 1200)
  console.log('--- Config 2: AFTER (gemini-2.5-flash, thinkingBudget: 0, pruned prompt, maxOutputTokens: 1200) ---');
  const config2Times: number[] = [];
  let sampleOutput2 = '';
  for (let i = 1; i <= 3; i++) {
    const t0 = Date.now();
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prunedPrompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: 'application/json',
        responseSchema: geminiOutputSchema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 1200,
        temperature: 0.2,
      },
    });
    const dur = Date.now() - t0;
    config2Times.push(dur);
    if (i === 1) sampleOutput2 = res.text || '';
    console.log(`  Trial ${i}: ${dur}ms | Output length: ${res.text?.length || 0} chars`);
  }
  const avg2 = Math.round(config2Times.reduce((a, b) => a + b, 0) / config2Times.length);
  console.log(`Config 2 Average Latency: ${avg2}ms\n`);

  // CONFIG 3: LITE (gemini-2.5-flash-lite, thinkingBudget: 0, pruned prompt, maxOutputTokens: 1200)
  console.log('--- Config 3: LITE (gemini-2.5-flash-lite, thinkingBudget: 0, pruned prompt, maxOutputTokens: 1200) ---');
  const config3Times: number[] = [];
  let sampleOutput3 = '';
  for (let i = 1; i <= 3; i++) {
    const t0 = Date.now();
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prunedPrompt,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: 'application/json',
        responseSchema: geminiOutputSchema,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 1200,
        temperature: 0.2,
      },
    });
    const dur = Date.now() - t0;
    config3Times.push(dur);
    if (i === 1) sampleOutput3 = res.text || '';
    console.log(`  Trial ${i}: ${dur}ms | Output length: ${res.text?.length || 0} chars`);
  }
  const avg3 = Math.round(config3Times.reduce((a, b) => a + b, 0) / config3Times.length);
  console.log(`Config 3 Average Latency: ${avg3}ms\n`);

  console.log('===============================================================');
  console.log('📊 BENCHMARK COMPARISON SUMMARY');
  console.log('===============================================================');
  console.log(`1. gemini-2.5-flash (Default/Before)       : Trials = [${config1Times.join('ms, ')}ms] | Avg = ${avg1}ms`);
  console.log(`2. gemini-2.5-flash (Optimized/After)     : Trials = [${config2Times.join('ms, ')}ms] | Avg = ${avg2}ms`);
  console.log(`3. gemini-2.5-flash-lite (Optimized Lite) : Trials = [${config3Times.join('ms, ')}ms] | Avg = ${avg3}ms`);
  console.log('---------------------------------------------------------------');

  // Verify bullet sample quality for Config 2 vs Config 3
  console.log('\n--- Sample Bullets Quality Verification (gemini-2.5-flash optimized) ---');
  try {
    const p2 = JSON.parse(sampleOutput2);
    console.log('Rewritten Bullet #1:', p2.bulletSuggestions?.[0]?.rewritten);
    console.log('Rewritten Bullet #2:', p2.bulletSuggestions?.[1]?.rewritten);
    console.log('Has placeholders flag:', p2.bulletSuggestions?.[0]?.hasMetricPlaceholder);
  } catch (e) {
    console.error('Parse error on sample 2:', e);
  }

  console.log('\n--- Sample Bullets Quality Verification (gemini-2.5-flash-lite optimized) ---');
  try {
    const p3 = JSON.parse(sampleOutput3);
    console.log('Rewritten Bullet #1:', p3.bulletSuggestions?.[0]?.rewritten);
    console.log('Rewritten Bullet #2:', p3.bulletSuggestions?.[1]?.rewritten);
    console.log('Has placeholders flag:', p3.bulletSuggestions?.[0]?.hasMetricPlaceholder);
  } catch (e) {
    console.error('Parse error on sample 3:', e);
  }
}

runBenchmark().catch(console.error);
