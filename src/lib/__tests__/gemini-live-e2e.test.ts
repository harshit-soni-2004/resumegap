import fs from 'fs';
import path from 'path';
import { runStage1Analysis } from '../stage1-detector';
import { runGeminiStage2 } from '../gemini';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME_TEXT } from '../sample-data';

// Load .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && !process.env[k.trim()]) {
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

async function runGeminiLiveE2ETest() {
  console.log('=== Running Live Gemini API E2E Assertion Test ===\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      '❌ TEST FAILED: GEMINI_API_KEY environment variable is missing. It must be provided in .env.local to run live Gemini E2E verification.'
    );
  }

  console.log(`✓ Detected GEMINI_API_KEY (Length: ${apiKey.length} chars)`);
  console.log(`✓ Target model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);

  // 1. Run deterministic Stage 1
  const stage1 = runStage1Analysis(SAMPLE_RESUME_TEXT, 1, SAMPLE_JOB_DESCRIPTION);
  console.log(`✓ Stage 1 completed: detected ${stage1.bullets.length} bullets, ${stage1.breakdown.details.matchedKeywordsCount} matched skills`);

  // 2. Run Stage 2 with live Gemini
  console.log('\n[Executing Live Gemini Flash Stage 2]...');
  const geminiResult = await runGeminiStage2(SAMPLE_RESUME_TEXT, SAMPLE_JOB_DESCRIPTION, stage1);

  console.log(`\nGemini API Response Summary:`);
  console.log(`- isLLMFallback: ${geminiResult.isLLMFallback}`);
  console.log(`- modelUsed: ${geminiResult.modelUsed}`);
  console.log(`- geminiLatencyMs: ${geminiResult.geminiLatencyMs}ms`);
  console.log(`- Missing Keywords count: ${geminiResult.missingKeywords.length}`);
  console.log(`- Bullet Suggestions count: ${geminiResult.bulletSuggestions.length}`);

  // CRITICAL ASSERTION: Fail if fallback output was returned
  if (geminiResult.isLLMFallback) {
    throw new Error(
      '❌ FATAL: Gemini stage returned fallback output while GEMINI_API_KEY was configured in environment! Check API key quota, network connectivity, or model name.'
    );
  }

  // CRITICAL ASSERTION: Assert real latency > 500ms
  if (geminiResult.geminiLatencyMs <= 500) {
    throw new Error(`❌ FATAL: Expected real Gemini API latency > 500ms, got ${geminiResult.geminiLatencyMs}ms`);
  }

  if (geminiResult.missingKeywords.length === 0) {
    throw new Error('❌ FATAL: Expected missing keywords from Gemini, got empty array');
  }

  if (geminiResult.bulletSuggestions.length < 2) {
    throw new Error(`❌ FATAL: Expected at least 2 bullet suggestions from Gemini, got ${geminiResult.bulletSuggestions.length}`);
  }

  // Print first 2 rewritten bullets from real Gemini response
  console.log('\n=== REAL GEMINI REWRITTEN BULLETS VERIFICATION ===');
  for (let i = 0; i < Math.min(2, geminiResult.bulletSuggestions.length); i++) {
    const b = geminiResult.bulletSuggestions[i];
    console.log(`\n[Bullet #${i + 1}]`);
    console.log(`  Original: "${b.original}"`);
    console.log(`  Rewritten (XYZ): "${b.rewritten}"`);
    console.log(`  Action Verb: "${b.actionVerbUsed}"`);
    console.log(`  Has Placeholder: ${b.hasMetricPlaceholder}`);
    console.log(`  Explanation: "${b.explanation}"`);

    // Verify presence of placeholder or non-invented metrics
    const hasBracketPlaceholder = /\[.*?\]/.test(b.rewritten);
    console.log(`  Contains bracketed placeholder ([X%], [Y], etc.): ${hasBracketPlaceholder}`);
  }
  const firstBullet = geminiResult.bulletSuggestions[0];
  console.log(`\nSample Rewritten Bullet #1:`);
  console.log(`  Original: "${firstBullet.original}"`);
  console.log(`  Rewritten (XYZ): "${firstBullet.rewritten}"`);
  console.log(`  Action Verb: "${firstBullet.actionVerbUsed}"`);
  console.log(`  Has [X%] Placeholder: ${firstBullet.hasMetricPlaceholder}`);
  console.log(`  Explanation: "${firstBullet.explanation}"`);

  console.log('\n======================================================');
  console.log('✅ GEMINI LIVE E2E ASSERTION TEST PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runGeminiLiveE2ETest().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
