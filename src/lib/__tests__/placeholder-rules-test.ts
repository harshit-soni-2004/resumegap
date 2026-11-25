import assert from 'assert';
import { validateRewriteOutcomes } from '../stage1-detector';

function testPlaceholderRules() {
  console.log('=== Running Standalone Test: Placeholder & Qualitative Rules (Item 3) ===\n');

  // Test Case 1: A rewrite that replaces concrete facts (named banks/formats) with [X] is flagged
  console.log('--- Test 1: Replacing concrete named entities with [X] ---');
  const orig1 =
    'Solo-built full-stack financial platform: engineered automated bank statement parser for Indian banking formats (PDF, CSV, Excel; SBI, HDFC, ICICI, Axis, Kotak), implementing hash-based transaction deduplication and transfer matching to eliminate double-counting.';
  const rewriteReplacedFact =
    'Solo-built bank statement parser for [X] Indian formats ([X] banks), implementing hash-based transaction deduplication to eliminate double-counting.';
  
  const res1 = validateRewriteOutcomes(orig1, rewriteReplacedFact);
  console.log('Result 1:', {
    isFlagged: res1.isFlaggedOutcome,
    reason: res1.reason,
    warning: res1.warning,
  });

  assert.strictEqual(
    res1.isFlaggedOutcome,
    true,
    'Expected rewrite replacing concrete facts with [X] to be FLAGGED'
  );
  assert.ok(
    res1.reason?.includes('concrete') || res1.reason?.includes('Missing') || res1.reason?.includes('named entity'),
    `Expected reason to mention concrete facts/entities, got "${res1.reason}"`
  );
  console.log('✓ Test 1 PASSED: Replacing concrete facts with [X] was strictly flagged.\n');

  // Test Case 2: A rewrite that adds a percentage to a purely qualitative claim ("safely rejected under retries") is flagged
  console.log('--- Test 2: Adding percentage to purely qualitative claim ---');
  const orig2 =
    'Secured APIs using OAuth2 with PKCE; enforced idempotent financial operations via unique idempotency keys and distributed locking, ensuring duplicate disbursements and repayments are safely rejected under retries.';
  const rewriteQualitativeWithPercentage =
    'Secured APIs using OAuth2 and PKCE, ensuring duplicate disbursements and repayments are safely rejected under retries by [X%].';

  const res2 = validateRewriteOutcomes(orig2, rewriteQualitativeWithPercentage);
  console.log('Result 2:', {
    isFlagged: res2.isFlaggedOutcome,
    reason: res2.reason,
    warning: res2.warning,
  });

  assert.strictEqual(
    res2.isFlaggedOutcome,
    true,
    'Expected rewrite adding percentage to purely qualitative claim to be FLAGGED'
  );
  assert.ok(
    res2.reason?.includes('percentage') || res2.reason?.includes('qualitative'),
    `Expected reason to mention percentage/qualitative, got "${res2.reason}"`
  );
  console.log('✓ Test 2 PASSED: Adding percentage metric to binary/qualitative claim was strictly flagged.\n');

  // Test Case 3: A rewrite that adds [X] to an existing outcome passes
  console.log('--- Test 3: Adding [X] to an existing unquantified outcome passes ---');
  const orig3 =
    'Designed and built an internal engineering task manager with the CTO that replaced Jira, eliminating recurring SaaS licensing costs.';
  const rewriteOutcomeWithX =
    'Designed an internal engineering task manager with the CTO that replaced Jira, eliminating [X] in recurring SaaS licensing costs.';

  const res3 = validateRewriteOutcomes(orig3, rewriteOutcomeWithX);
  console.log('Result 3:', {
    isFlagged: res3.isFlaggedOutcome,
    reason: res3.reason,
  });

  assert.strictEqual(
    res3.isFlaggedOutcome,
    false,
    'Expected legitimate rewrite with [X] placeholder on existing outcome to PASS'
  );
  console.log('✓ Test 3 PASSED: Adding [X] placeholder to legitimate existing outcome passed cleanly.\n');

  console.log('======================================================');
  console.log('🎉 ALL PLACEHOLDER RULE ASSERTION TESTS PASSED!');
  console.log('======================================================\n');
}

testPlaceholderRules();
