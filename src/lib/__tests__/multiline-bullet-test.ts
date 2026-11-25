import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { extractBulletPoints, getBulletQuantifiedDetails } from '../stage1-detector';

function testMultilineBullets() {
  console.log('=== Running Unit Test: Multi-Line Bullet Extraction & Quantified Impact ===\n');

  const fixturePath = path.resolve(__dirname, 'fixtures', 'harshit_resume_extracted_40.txt');
  const text = fs.readFileSync(fixturePath, 'utf-8');

  const bullets = extractBulletPoints(text);
  console.log(`Detected bullet count: ${bullets.length} (Expected: 11)\n`);

  console.log('--- DETAILED PER-BULLET QUANTIFIED INSPECTION ---');
  bullets.forEach((b, i) => {
    const detail = getBulletQuantifiedDetails(b);
    console.log(`[Bullet #${String(i + 1).padStart(2, '0')}] Quantified: ${detail.isQuantified}`);
    if (detail.isQuantified) {
      console.log(`  Matched Pattern : ${detail.matchedPattern}`);
      console.log(`  Matched Text    : "${detail.matchedText}"`);
    } else {
      console.log(`  Matched Pattern : None`);
    }
    console.log(`  Text            : "${b}"\n`);
  });

  assert.strictEqual(bullets.length, 11, `Expected exactly 11 bullets, got ${bullets.length}`);

  // Assert each bullet is fully merged and contains its continuation text
  assert(
    bullets[0].includes('REST APIs and Angular 19; adopted across all 5 core Veefin fintech products'),
    `Bullet 1 was truncated: "${bullets[0]}"`
  );
  assert(
    bullets[1].includes('V44, stabilizing Maven CI/CD on Bitbucket Pipelines'),
    `Bullet 2 was truncated: "${bullets[1]}"`
  );
  assert(
    bullets[3].includes('modular Terraform modules (S3, EC2, RDS), and disaster recovery patching runbooks'),
    `Bullet 4 was truncated: "${bullets[3]}"`
  );
  assert(
    bullets[4].includes('UUID-based persistence anomalies under concurrent load'),
    `Bullet 5 was truncated: "${bullets[4]}"`
  );
  assert(
    bullets[6].includes('implementing hash-based transaction deduplication'),
    `Bullet 7 was truncated: "${bullets[6]}"`
  );
  assert(
    bullets[9].includes('eliminate lost transactions'),
    `Bullet 10 was truncated: "${bullets[9]}"`
  );
  assert(
    bullets[10].includes('safely rejected under retries'),
    `Bullet 11 was truncated: "${bullets[10]}"`
  );

  // Exact reality assertions for quantified impact:
  // Bullets 1, 2, 4, 10 contain genuine scale/impact metrics ("5 core Veefin fintech products", "15-service", "53%", "7 Critical vulnerabilities", "6 decoupled Spring Boot microservices")
  // Bullets 3, 5, 6, 7, 8, 9, 11 have no quantifiable outcome numbers.
  assert.strictEqual(getBulletQuantifiedDetails(bullets[0]).isQuantified, true, 'Bullet 1 must be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[1]).isQuantified, true, 'Bullet 2 must be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[2]).isQuantified, false, 'Bullet 3 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[3]).isQuantified, true, 'Bullet 4 must be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[4]).isQuantified, false, 'Bullet 5 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[5]).isQuantified, false, 'Bullet 6 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[6]).isQuantified, false, 'Bullet 7 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[7]).isQuantified, false, 'Bullet 8 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[8]).isQuantified, false, 'Bullet 9 must not be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[9]).isQuantified, true, 'Bullet 10 must be quantified');
  assert.strictEqual(getBulletQuantifiedDetails(bullets[10]).isQuantified, false, 'Bullet 11 must not be quantified');

  const quantifiedCount = bullets.filter((b) => getBulletQuantifiedDetails(b).isQuantified).length;
  console.log(`Summary: ${quantifiedCount} / ${bullets.length} bullets quantified (Expected: 4).`);
  assert.strictEqual(quantifiedCount, 4, `Expected exactly 4 impact-quantified bullets, got ${quantifiedCount}`);

  console.log('======================================================');
  console.log('🎉 MULTI-LINE BULLET & QUANTIFIED TEST PASSED!');
  console.log('======================================================\n');
}

testMultilineBullets();
