import assert from 'assert';
import { analyzeSeniority } from '../stage1-detector';

function testSeniority() {
  console.log('=== Running Unit Test: Seniority Classification Hierarchy ===\n');

  const resumeText = `Harshit Soni
B.Tech IT graduating 2026, coursework completed, available for immediate onboarding.
Software Engineer at Veefin Solutions (Apr 2026 - Oct 2026).`;

  // Test Case 1: Backend SDE 1 / SDE 2 with stray "senior" in body text
  const jdBackend = `Job Title: Backend Software Engineer (SDE 1 / SDE 2)
Company: FinTech Infra Systems
About the Role:
We are looking for an ambitious engineer. You will collaborate with senior staff engineers and architects.`;

  const resBackend = analyzeSeniority(resumeText, jdBackend);
  console.log('Test 1 (SDE 1 / SDE 2 with senior in body):', resBackend);
  assert.strictEqual(
    resBackend.jdLevel,
    'Entry-level / Intern / New Grad',
    `Expected Entry-level / Intern / New Grad, got "${resBackend.jdLevel}"`
  );
  assert.strictEqual(resBackend.isMatch, true, 'Expected isMatch to be true');
  assert.strictEqual(resBackend.score, 100, `Expected score 100, got ${resBackend.score}`);
  console.log('✓ Test 1 PASSED: Entry marker (SDE 1) overrode stray "senior" in body text.\n');

  // Test Case 2: Associate Product Manager (Must NOT be Senior)
  const jdAPM = `Job Title: Associate Product Manager (APM)
Company: GrowthX Consumer Apps
Responsibilities: Drive product roadmaps, author PRDs, coordinate with managers.`;

  const resAPM = analyzeSeniority(resumeText, jdAPM);
  console.log('Test 2 (Associate Product Manager):', resAPM);
  assert.notStrictEqual(
    resAPM.jdLevel,
    'Senior / Staff / Lead',
    `Associate Product Manager must not be classified as Senior!`
  );
  assert.strictEqual(
    resAPM.jdLevel,
    'Entry-level / Intern / New Grad',
    `Expected Entry-level / Intern / New Grad, got "${resAPM.jdLevel}"`
  );
  console.log('✓ Test 2 PASSED: "Associate Product Manager" correctly classified as Entry-level.\n');

  // Test Case 3: Legitimate Senior Staff Role (Must be Senior)
  const jdSenior = `Job Title: Principal / Staff Distributed Systems Architect
Requirements: 8+ years experience designing high-scale cloud platforms.`;

  const resSenior = analyzeSeniority(resumeText, jdSenior);
  console.log('Test 3 (Principal / Staff Architect):', resSenior);
  assert.strictEqual(
    resSenior.jdLevel,
    'Senior / Staff / Lead',
    `Expected Senior / Staff / Lead, got "${resSenior.jdLevel}"`
  );
  assert.strictEqual(resSenior.isMatch, false, 'Expected isMatch to be false for grad vs Staff');
  assert.strictEqual(resSenior.score, 55, `Expected penalty score 55, got ${resSenior.score}`);
  console.log('✓ Test 3 PASSED: True Senior/Staff role correctly identified and penalized.\n');

  console.log('======================================================');
  console.log('🎉 ALL SENIORITY CLASSIFICATION TESTS PASSED!');
  console.log('======================================================\n');
}

testSeniority();
