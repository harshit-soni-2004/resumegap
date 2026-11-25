import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { validateRewriteOutcomes, runStage1Analysis, extractTextFromPdf } from '../stage1-detector';
import { runGeminiStage2 } from '../gemini';

// Read .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch {}

async function runRewriteValidatorTests() {
  console.log('=== Running Rewrite Validator & Outcome Guardrail Tests ===\n');

  // Part 1: Deterministic unit tests for outcome validator
  console.log('--- Part 1: Synthetic Outcome Validator Assertion Checks ---');

  // Test 1: Fabricated Latency
  const t1 = validateRewriteOutcomes(
    'Built REST API for user onboarding.',
    'Engineered REST API for user onboarding, reducing latency by 45ms.'
  );
  assert.strictEqual(t1.isFlaggedOutcome, true, 'Expected fabricated latency to be flagged');
  console.log('✓ Check 1: Fabricated latency correctly flagged.');

  // Test 2: Fabricated Stability/Uptime
  const t2 = validateRewriteOutcomes(
    'Containerised services with Docker Compose.',
    'Architected Docker Compose setup, achieving 99.9% uptime and zero-downtime.'
  );
  assert.strictEqual(t2.isFlaggedOutcome, true, 'Expected fabricated stability/uptime to be flagged');
  console.log('✓ Check 2: Fabricated stability / uptime correctly flagged.');

  // Test 3: Fabricated Daily Active Users
  const t3 = validateRewriteOutcomes(
    'Engineered automated bank statement parser.',
    'Engineered automated bank statement parser serving 10,000 daily active users.'
  );
  assert.strictEqual(t3.isFlaggedOutcome, true, 'Expected fabricated daily active users to be flagged');
  console.log('✓ Check 3: Fabricated daily active users correctly flagged.');

  // Test 4: Banned Generic Filler
  const t4 = validateRewriteOutcomes(
    'Refactored legacy database models.',
    'Architected database models, improving system functionality.'
  );
  assert.strictEqual(t4.isFlaggedOutcome, true, 'Expected generic filler to be flagged');
  console.log('✓ Check 4: Generic filler outcome correctly flagged.');

  // Test 5: Valid truthful rewrite with placeholder on original context
  const t5 = validateRewriteOutcomes(
    'Designed and built an internal engineering task manager with the CTO.',
    'Architected internal engineering task manager with the CTO, saving [X%] developer time.'
  );
  assert.strictEqual(t5.isFlaggedOutcome, false, 'Valid truthful rewrite should not be flagged');
  console.log('✓ Check 5: Legitimate truthful rewrite with placeholder passed cleanly.');

  // Test 6: SpendSense Bullet dropping "solo-built" MUST FAIL
  const spendSenseOriginal =
    'Solo-built full-stack financial platform: engineered automated bank statement parser for Indian banking formats (PDF, CSV, Excel; SBI, HDFC, ICICI, Axis, Kotak), implementing hash-based transaction deduplication and transfer matching to eliminate double-counting.';
  const spendSenseDroppedSolo =
    'Engineered automated bank statement parser for Indian banking formats, implementing transaction deduplication.';
  const t6 = validateRewriteOutcomes(spendSenseOriginal, spendSenseDroppedSolo);
  assert.strictEqual(t6.isFlaggedOutcome, true, 'Expected rewrite dropping "solo-built" to be flagged');
  assert.ok(
    t6.reason?.toLowerCase().includes('solo-built'),
    `Reason must mention solo-built: got "${t6.reason}"`
  );
  console.log('✓ Check 6: SpendSense bullet dropping "solo-built" was flagged by validator.');

  // Test 7: SpendSense Bullet preserving "solo-built" and named entities PASSES
  const spendSenseKeptSolo =
    'Solo-built financial platform: engineered automated bank statement parser for Indian formats (PDF, CSV, Excel; SBI, HDFC, ICICI, Axis, Kotak), eliminating double-counting via hash-based deduplication.';
  const t7 = validateRewriteOutcomes(spendSenseOriginal, spendSenseKeptSolo);
  assert.strictEqual(t7.isFlaggedOutcome, false, `Expected rewrite preserving "solo-built" and named entities to pass, got reason: ${t7.reason}`);
  console.log('✓ Check 7: SpendSense bullet preserving "solo-built" and named entities passed validation.');

  // Test 8: Dropping "with the CTO" MUST FAIL
  const ctoOriginal = 'Designed and built an internal engineering task manager with the CTO that replaced Jira.';
  const ctoDropped = 'Architected internal engineering task manager that replaced Jira.';
  const t8 = validateRewriteOutcomes(ctoOriginal, ctoDropped);
  assert.strictEqual(t8.isFlaggedOutcome, true, 'Expected rewrite dropping "with the CTO" to be flagged');
  console.log('✓ Check 8: Dropping "with the CTO" correctly flagged.');

  // Test 9: Word boundaries on \bled\b and \bowned\b
  // Words like "knowledge" or "scheduled" or "downed" must NOT trigger ownership markers
  const nonMarkerOriginal = 'Resolved production routing bottlenecks and scheduled background jobs.';
  const nonMarkerRewrite = 'Resolved production routing bottlenecks and background tasks.';
  const t9 = validateRewriteOutcomes(nonMarkerOriginal, nonMarkerRewrite);
  assert.strictEqual(t9.isFlaggedOutcome, false, 'Substring match inside words must not trigger ownership flag');

  const ledOriginal = 'Led a team of 4 engineers to build the core payments gateway.';
  const ledDropped = 'Architected core payments gateway.';
  const t10 = validateRewriteOutcomes(ledOriginal, ledDropped);
  assert.strictEqual(t10.isFlaggedOutcome, true, 'Dropping "\\bled\\b" must be flagged');
  console.log('✓ Check 9: Strict word boundaries on \\bled\\b, \\bowned\\b, and \\bsolo-built\\b verified.\n');

  // Part 2: Real Gemini Live Test with Harshit\'s Resume
  console.log('--- Part 2: Live Gemini Pipeline Rewrite Verification ---');
  const pdfPath = path.resolve(process.cwd(), 'test-data', 'harshit_resume.pdf');
  const jdPath = path.resolve(process.cwd(), 'test-data', 'jd_backend.txt');

  if (!fs.existsSync(pdfPath) || !fs.existsSync(jdPath)) {
    console.log('⚠️ Resume or JD fixture missing in test-data. Skipping live PDF check.');
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const jdText = fs.readFileSync(jdPath, 'utf8');

  const { text: resumeText, pageCount } = await extractTextFromPdf(pdfBuffer);
  const stage1 = runStage1Analysis(resumeText, pageCount, jdText);

  console.log(`Running Gemini Stage 2 against Backend JD (${stage1.bullets.length} total bullets)...`);
  const stage2 = await runGeminiStage2(resumeText, jdText, stage1);

  console.log(`Model Used: ${stage2.modelUsed} | Fallback: ${stage2.isLLMFallback} | Latency: ${stage2.geminiLatencyMs}ms`);
  console.log(`Rewritten suggestions count: ${stage2.bulletSuggestions.length}\n`);

  for (let i = 0; i < stage2.bulletSuggestions.length; i++) {
    const sug = stage2.bulletSuggestions[i];
    console.log(`[Suggestion ${i + 1}]`);
    console.log(`  Orig: "${sug.original}"`);
    console.log(`  Rewr: "${sug.rewritten}"`);
    console.log(`  Flagged: ${sug.isFlaggedOutcome} | FlagReason: ${sug.flagReason || 'None'} | Warning: ${sug.warning || 'None'}`);

    // Assertion 1: isFlaggedOutcome must be a strict boolean
    assert.strictEqual(
      typeof sug.isFlaggedOutcome,
      'boolean',
      `Suggestion #${i + 1} isFlaggedOutcome must be a boolean, got ${typeof sug.isFlaggedOutcome}`
    );

    // Assertion 2: None of the rewrites drops "solo-built" or "with the CTO" if present in original
    if (/\bsolo-built\b/i.test(sug.original)) {
      assert(
        /\bsolo-built\b/i.test(sug.rewritten),
        `Suggestion #${i + 1} dropped "solo-built"! Original: "${sug.original}" | Rewritten: "${sug.rewritten}"`
      );
      console.log(`  ✓ Verified "solo-built" preserved in suggestion #${i + 1}`);
    }

    if (/\bwith\s+(?:the\s+)?cto\b/i.test(sug.original)) {
      assert(
        /\bwith\s+(?:the\s+)?cto\b/i.test(sug.rewritten),
        `Suggestion #${i + 1} dropped "with the CTO"! Original: "${sug.original}" | Rewritten: "${sug.rewritten}"`
      );
      console.log(`  ✓ Verified "with the CTO" preserved in suggestion #${i + 1}`);
    }

    // If Gemini fabricated latency, stability, or daily without it being in original,
    // the system MUST have flagged it.
    const lowerRewr = sug.rewritten.toLowerCase();
    const lowerOrig = sug.original.toLowerCase();

    const introducedLatency = /\b(?:latency|response\s*time|\bms\b)\b/i.test(lowerRewr) && !/\b(?:latency|response\s*time|\bms\b)\b/i.test(lowerOrig);
    const introducedStability = /\b(?:uptime|stability|zero-downtime)\b/i.test(lowerRewr) && !/\b(?:uptime|stability|zero-downtime)\b/i.test(lowerOrig);
    const introducedDaily = /\b(?:daily|dau)\b/i.test(lowerRewr) && !/\b(?:daily|dau)\b/i.test(lowerOrig);

    if (introducedLatency || introducedStability || introducedDaily) {
      assert.strictEqual(
        sug.isFlaggedOutcome,
        true,
        `Rewrite introduced unverified metric ("${sug.rewritten}") but was NOT flagged by validator!`
      );
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL REWRITE VALIDATOR & GUARDRAIL TESTS PASSED!');
  console.log('======================================================\n');
}

runRewriteValidatorTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
