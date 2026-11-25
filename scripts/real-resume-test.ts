import fs from 'fs';
import path from 'path';

// Parse .env.local without third-party dependencies
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
}

import { extractTextFromPdf, runStage1Analysis, isBulletQuantified, extractKeywords, TECH_SKILL_DICTIONARY } from '../src/lib/stage1-detector';
import { runGeminiStage2 } from '../src/lib/gemini';

async function runRealResumeTest() {
  console.log('================================================================');
  console.log('🔬 REAL RESUME TEST SUITE: HARSHIT SONI RESUME vs 3 TARGET JDs');
  console.log('================================================================\n');

  // Load files
  const resumePdfPath = path.resolve(process.cwd(), 'test-data', 'harshit_resume.pdf');
  const jdBackendPath = path.resolve(process.cwd(), 'test-data', 'jd_backend.txt');
  const jdDevopsPath = path.resolve(process.cwd(), 'test-data', 'jd_devops.txt');
  const jdPmPath = path.resolve(process.cwd(), 'test-data', 'jd_pm_mismatch.txt');

  if (!fs.existsSync(resumePdfPath)) {
    throw new Error(`Resume PDF not found at ${resumePdfPath}`);
  }

  const pdfBuffer = fs.readFileSync(resumePdfPath);
  const jdBackend = fs.readFileSync(jdBackendPath, 'utf-8');
  const jdDevops = fs.readFileSync(jdDevopsPath, 'utf-8');
  const jdPm = fs.readFileSync(jdPmPath, 'utf-8');

  // Record events file baseline so we can clean up any test events
  const eventsFile = path.resolve(process.cwd(), 'data', 'events.json');
  const initialEventsLength = fs.existsSync(eventsFile) 
    ? JSON.parse(fs.readFileSync(eventsFile, 'utf-8')).length 
    : 0;

  // 1. PDF Extraction
  console.log('--- 1. PDF TEXT EXTRACTION & HEADER AUDIT ---');
  const pdfExtraction = await extractTextFromPdf(pdfBuffer);
  console.log(`Page count: ${pdfExtraction.pageCount}`);
  console.log(`Total character count: ${pdfExtraction.text.length}`);
  console.log(`Is Scanned/Image PDF: ${pdfExtraction.isScannedOrImagePdf}\n`);

  const rawLines = pdfExtraction.text.split('\n');
  console.log('--- Raw Extracted Text (First 40 Lines) ---');
  rawLines.slice(0, 40).forEach((line, idx) => {
    console.log(`[${String(idx + 1).padStart(2, '0')}] ${line}`);
  });
  console.log('-------------------------------------------\n');

  // Target test runs
  const testRuns = [
    { name: '1. Backend Engineer (Core Match)', jdText: jdBackend, key: 'backend' },
    { name: '2. DevOps & Cloud Engineer (Adjacent Match)', jdText: jdDevops, key: 'devops' },
    { name: '3. Associate Product Manager (Severe Mismatch)', jdText: jdPm, key: 'pm' },
  ];

  const results: Array<{
    name: string;
    key: string;
    stage1: ReturnType<typeof runStage1Analysis>;
    stage2: Awaited<ReturnType<typeof runGeminiStage2>>;
  }> = [];

  for (const run of testRuns) {
    console.log(`\n================================================================`);
    console.log(`▶ RUNNING PIPELINE: ${run.name}`);
    console.log(`================================================================`);

    // Stage 1
    const stage1 = runStage1Analysis(pdfExtraction.text, pdfExtraction.pageCount, run.jdText);
    console.log('\n[Stage 1 Output]');
    console.log(`- Word Count: ${stage1.wordCount}`);
    console.log(`- Detected Bullets Count: ${stage1.bullets.length}`);
    console.log(`- Quantified Bullets Count: ${stage1.breakdown.details.quantifiedBulletsDetected} (${Math.round(stage1.breakdown.details.quantifiedRatio * 100)}%)`);
    console.log(`- Matched Skills (${stage1.breakdown.details.matchedKeywordsCount}/${stage1.breakdown.details.totalJdKeywords}): ${stage1.breakdown.details.matchedKeywords.join(', ')}`);
    console.log(`- Missing Keywords: ${stage1.breakdown.details.missingKeywordsStage1.join(', ')}`);
    const isCapApplied = stage1.breakdown.keywordScore < 30;
    console.log(`- Score Breakdown:`);
    console.log(`  * Overall Score       : ${stage1.breakdown.overallScore} / 100`);
    console.log(`  * Role Fit Score      : ${stage1.breakdown.roleFitScore} / 100 (Keywords + Seniority fit)`);
    console.log(`  * Resume Quality Score: ${stage1.breakdown.resumeQualityScore} / 100 (Quantified + Sections)`);
    console.log(`  * Keyword Overlap %   : ${stage1.breakdown.keywordScore}%`);
    console.log(`  * Cap Applied (<30%)  : ${isCapApplied ? 'YES (Capped at 50 max)' : 'NO'}`);
    console.log(`  * Seniority Match     : ${stage1.breakdown.seniorityScore} / 100 (JD: "${stage1.breakdown.details.detectedSeniority.jdLevel}", Resume: "${stage1.breakdown.details.detectedSeniority.resumeLevel}")`);
    console.log(`  * Quantified Impact   : ${stage1.breakdown.quantifiedScore} / 100`);
    console.log(`  * Section Completeness: ${stage1.breakdown.sectionsScore} / 100`);

    // Stage 2
    console.log('\n[Stage 2 Gemini LLM Execution]');
    const stage2 = await runGeminiStage2(pdfExtraction.text, run.jdText, stage1);
    console.log(`- Model Used: ${stage2.modelUsed}`);
    console.log(`- isLLMFallback: ${stage2.isLLMFallback}`);
    console.log(`- Gemini Latency: ${stage2.geminiLatencyMs} ms`);
    console.log(`- Rewritten Bullets Count: ${stage2.bulletSuggestions.length}`);
    const placeholdersCount = stage2.bulletSuggestions.filter(
      (b) => b.hasMetricPlaceholder || /\[[A-Za-z0-9% ]+\]/.test(b.rewritten)
    ).length;
    console.log(`- Rewrites with Placeholders: ${placeholdersCount} / ${stage2.bulletSuggestions.length}`);
    console.log('\nRewritten Bullets:');
    stage2.bulletSuggestions.forEach((b, idx) => {
      console.log(`  [Bullet #${idx + 1}]`);
      console.log(`    Original : "${b.original}"`);
      console.log(`    Rewritten: "${b.rewritten}"`);
      console.log(`    Verb     : ${b.actionVerbUsed} | Placeholder: ${b.hasMetricPlaceholder} | Flagged: ${b.isFlaggedOutcome}`);
      if (b.flagReason) {
        console.log(`    FlagReason: ${b.flagReason}`);
      }
    });

    results.push({ name: run.name, key: run.key, stage1, stage2 });
  }

  // =========================================================================
  // DETAILED CHECKS A THROUGH G
  // =========================================================================
  console.log('\n================================================================');
  console.log('📋 AUDIT CHECKS & VERIFICATION (A through G)');
  console.log('================================================================\n');

  // --- CHECK A: Skill coverage of Technical Skills section ---
  console.log('--- CHECK A: Technical Skills Section Coverage ---');
  const expectedSkillsInResume = [
    'java 21',
    'virtual threads',
    'concurrency',
    'spring boot 3',
    'spring security',
    'jwt',
    'spring cloud',
    'gateway',
    'eureka',
    'rest apis',
    'microservices',
    'jpa',
    'hibernate',
    'rabbitmq',
    'transactional outbox',
    'maven',
    'python',
    'bash',
    'aws',
    'ec2',
    's3',
    'rds',
    'iam',
    'eks',
    'terraform',
    'iac',
    'docker',
    'docker compose',
    'bitbucket pipelines',
    'ci/cd',
    'linux',
    'git',
    'mysql',
    'sql',
    'flyway',
    'schema migrations',
    'redis',
    'distributed systems',
    'idempotent api design',
    'idempotency',
    'angular 19',
    'typescript',
    'javascript',
    'rxjs',
    'llm tool calling',
    'function calling',
    'server-side guardrails',
    'prompt design',
    'ml/nlp integration'
  ];

  const allResumeExtracted = extractKeywords(pdfExtraction.text);

  const missingFromDictionary: string[] = [];
  const inDictButNotExtracted: string[] = [];
  const successfullyDetected: string[] = [];

  for (const skill of expectedSkillsInResume) {
    const inDict = TECH_SKILL_DICTIONARY.includes(skill);
    const wasExtracted = allResumeExtracted.includes(skill);

    if (wasExtracted) {
      successfullyDetected.push(skill);
    } else if (!inDict) {
      missingFromDictionary.push(skill);
    } else {
      inDictButNotExtracted.push(skill);
    }
  }

  console.log(`✓ Successfully detected skills (${successfullyDetected.length} / ${expectedSkillsInResume.length}): ${successfullyDetected.join(', ')}`);
  if (missingFromDictionary.length > 0) {
    console.log(`❌ Missing from TECH_SKILL_DICTIONARY (${missingFromDictionary.length}): ${missingFromDictionary.join(', ')}`);
  }
  if (inDictButNotExtracted.length > 0) {
    console.log(`⚠️ In dictionary but regex failed (${inDictButNotExtracted.length}): ${inDictButNotExtracted.join(', ')}`);
  }
  const checkAPass = missingFromDictionary.length === 0 && inDictButNotExtracted.length === 0;
  console.log(`Check A Result: ${checkAPass ? 'PASS' : 'FAIL'} (${successfullyDetected.length}/${expectedSkillsInResume.length} skills detected)\n`);

  // --- CHECK B: No Invented Numbers ---
  console.log('--- CHECK B: No Invented Numbers in Rewritten Bullets ---');
  let inventedNumberCount = 0;
  const inventedNumberDetails: string[] = [];

  for (const r of results) {
    for (const b of r.stage2.bulletSuggestions) {
      // Find all numbers in rewritten bullet (excluding bracketed placeholders like [X], [X%], [Y], etc.)
      const strippedRewrite = b.rewritten.replace(/\[[^\]]+\]/g, '');
      const rewrittenNumbers = strippedRewrite.match(/\b\d+(\.\d+)?%?|\$\d+/g) || [];

      // Find all numbers in original bullet
      const originalNumbers = new Set(b.original.match(/\b\d+(\.\d+)?%?|\$\d+/g) || []);

      for (const num of rewrittenNumbers) {
        // If the number was not in the original bullet, it's an invented number!
        if (!originalNumbers.has(num)) {
          inventedNumberCount++;
          inventedNumberDetails.push(
            `In run "${r.name}": Number "${num}" in rewritten bullet was NOT in original:\n  Original : "${b.original}"\n  Rewritten: "${b.rewritten}"`
          );
        }
      }
    }
  }

  if (inventedNumberCount === 0) {
    console.log('✓ Check B Result: PASS — Zero invented numbers found across all rewritten bullets.');
  } else {
    console.log(`❌ Check B Result: FAIL — Found ${inventedNumberCount} invented number(s):`);
    inventedNumberDetails.forEach((d) => console.log(`  - ${d}`));
  }
  console.log('');

  // --- CHECK C: Strong Bullets Untouched / Preserved Metrics ---
  console.log('--- CHECK C: Metric Preservation in Bullets with Existing Metrics ---');
  let droppedMetricCount = 0;
  const droppedMetricDetails: string[] = [];

  for (const r of results) {
    for (const b of r.stage2.bulletSuggestions) {
      const origHasMetrics = isBulletQuantified(b.original);
      if (origHasMetrics) {
        const origNumbers: string[] = b.original.match(/\d+(\.\d+)?%?|\$\d+/g) || [];
        const rewriteNumbers: string[] = b.rewritten.match(/\d+(\.\d+)?%?|\$\d+/g) || [];

        // Check if key original numbers are present in the rewrite
        const missingNumbers = origNumbers.filter((n: string) => !rewriteNumbers.includes(n));
        if (missingNumbers.length > 0) {
          droppedMetricCount++;
          droppedMetricDetails.push(
            `Original metrics [${missingNumbers.join(', ')}] were altered/dropped in rewrite:\n  Orig: "${b.original}"\n  New : "${b.rewritten}"`
          );
        }
      }
    }
  }

  if (droppedMetricCount === 0) {
    console.log('✓ Check C Result: PASS — Existing numbers in strong bullets were strictly preserved.');
  } else {
    console.log(`⚠️ Check C Result: WARNING/FAIL — ${droppedMetricCount} bullet rewrite(s) altered or dropped existing metrics:`);
    droppedMetricDetails.forEach((d) => console.log(`  - ${d}`));
  }
  console.log('');

  // --- CHECK D: Placeholder Rules & Truthful Outcome Usage ---
  console.log('--- CHECK D: Placeholder Rules & Truthful Outcome Usage ---');
  let invalidPlaceholderCount = 0;
  for (const r of results) {
    for (const b of r.stage2.bulletSuggestions) {
      // 1. Concrete facts must not be replaced with [X]
      if (/\[X\]\s*(?:banks?|formats?|services?)/i.test(b.rewritten)) {
        invalidPlaceholderCount++;
        console.log(`❌ Concrete facts replaced with [X]: "${b.rewritten}"`);
      }
      // 2. Binary qualitative claims must not have percentage added
      if (/\b(?:safely rejected|retries)\b/i.test(b.original) && (/\[X%\]/.test(b.rewritten) || /\b\d+%/.test(b.rewritten))) {
        invalidPlaceholderCount++;
        console.log(`❌ Percentage added to qualitative claim: "${b.rewritten}"`);
      }
    }
  }

  let totalWithPlaceholders = 0;
  let totalRewrites = 0;
  for (const r of results) {
    for (const b of r.stage2.bulletSuggestions) {
      totalRewrites++;
      if (b.hasMetricPlaceholder || /\[[A-Za-z0-9% ]+\]/.test(b.rewritten)) {
        totalWithPlaceholders++;
      }
    }
  }
  console.log(`- Total Rewrites Across 3 JDs: ${totalRewrites}`);
  console.log(`- Rewrites with Placeholders : ${totalWithPlaceholders}`);
  if (invalidPlaceholderCount === 0) {
    console.log(`✓ Check D Result: PASS — Placeholders adhere strictly to truthful outcome rules.`);
  } else {
    console.log(`❌ Check D Result: FAIL — ${invalidPlaceholderCount} violations found.`);
  }
  console.log('');

  // --- CHECK E: Section Detection ---
  console.log('--- CHECK E: Section Detection Audit ---');
  const sections = results[0].stage1.breakdown.details.detectedSections;
  console.log(`- hasExperience : ${sections.hasExperience}`);
  console.log(`- hasEducation  : ${sections.hasEducation}`);
  console.log(`- hasSkills     : ${sections.hasSkills}`);
  console.log(`- hasProjects   : ${sections.hasProjects}`);
  console.log(`- hasContact    : ${sections.hasContact}`);

  // Specifically check whether "Featured Projects" and "Work Experience" are recognised in raw text
  const rawTextLower = pdfExtraction.text.toLowerCase();
  const hasWorkExperienceTitle = rawTextLower.includes('work experience');
  const hasFeaturedProjectsTitle = rawTextLower.includes('featured projects');
  console.log(`- Literal "Work Experience" heading in text: ${hasWorkExperienceTitle}`);
  console.log(`- Literal "Featured Projects" heading in text: ${hasFeaturedProjectsTitle}`);

  const sectionPass = sections.hasExperience && sections.hasEducation && sections.hasSkills && sections.hasProjects && sections.hasContact;
  console.log(`Check E Result: ${sectionPass ? 'PASS' : 'FAIL'} (Experience: ${sections.hasExperience}, Projects: ${sections.hasProjects})\n`);

  // --- CHECK F: Score Sanity (Backend vs PM Mismatch) ---
  console.log('--- CHECK F: Score Sanity Benchmark ---');
  const backendScore = results.find((r) => r.key === 'backend')!.stage1.breakdown.overallScore;
  const devopsScore = results.find((r) => r.key === 'devops')!.stage1.breakdown.overallScore;
  const pmScore = results.find((r) => r.key === 'pm')!.stage1.breakdown.overallScore;
  const gap = backendScore - pmScore;

  console.log(`- Backend JD Score     : ${backendScore} / 100`);
  console.log(`- DevOps JD Score      : ${devopsScore} / 100`);
  console.log(`- PM Mismatch JD Score : ${pmScore} / 100`);
  console.log(`- Gap (Backend - PM)   : ${gap} points`);

  if (gap >= 20) {
    console.log(`✓ Check F Result: PASS — Score gap is ${gap} points (>= 20 point threshold).\n`);
  } else {
    console.log(`❌ Check F Result: FAIL — Score gap is only ${gap} points (< 20 point threshold).\n`);
  }

  // --- CHECK G: Seniority Classification ---
  console.log('--- CHECK G: Seniority Classification Audit ---');
  for (const r of results) {
    const s = r.stage1.breakdown.details.detectedSeniority;
    console.log(`- Run "${r.name}":`);
    console.log(`  * Resume Level Classified : "${s.resumeLevel}"`);
    console.log(`  * JD Level Classified     : "${s.jdLevel}"`);
    console.log(`  * Match Flag              : ${s.isMatch}`);
    console.log(`  * Seniority Score Component: ${r.stage1.breakdown.seniorityScore} / 100`);
  }
  console.log('');

  // Clean up any test events added to data/events.json during this test run
  if (fs.existsSync(eventsFile)) {
    try {
      const currentEvents = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
      if (currentEvents.length > initialEventsLength) {
        fs.writeFileSync(eventsFile, JSON.stringify(currentEvents.slice(0, initialEventsLength), null, 2));
        console.log(`✓ Cleaned up ${currentEvents.length - initialEventsLength} test event(s) from data/events.json.`);
      }
    } catch (e) {
      console.warn('Could not clean events file:', e);
    }
  }

  console.log('================================================================');
  console.log('🎯 REAL RESUME TEST COMPLETE — READY FOR FINDINGS REVIEW');
  console.log('================================================================\n');
}

runRealResumeTest().catch((err) => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
