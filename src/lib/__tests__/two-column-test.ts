import fs from 'fs';
import path from 'path';
import assert from 'assert';
import puppeteer from 'puppeteer';
import { extractTextFromPdf, extractBulletPoints, extractKeywords } from '../stage1-detector';

async function testTwoColumnPdfExtraction() {
  console.log('=== Running Two-Column Resume Layout Verification Test ===\n');

  const fixturesDir = path.resolve(process.cwd(), 'src/lib', '__tests__', 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const pdfPath = path.resolve(fixturesDir, 'two_column_resume.pdf');

  console.log('1. Generating 2-column resume PDF fixture via Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 24px;
      font-size: 11px;
      color: #333;
    }
    .container {
      display: flex;
      flex-direction: row;
      gap: 20px;
    }
    .left-col {
      width: 32%;
      border-right: 1px solid #ddd;
      padding-right: 15px;
    }
    .right-col {
      width: 68%;
    }
    h1 {
      font-size: 18px;
      margin: 0 0 4px 0;
      color: #111;
    }
    h2 {
      font-size: 12px;
      text-transform: uppercase;
      color: #0284c7;
      border-bottom: 1px solid #0284c7;
      padding-bottom: 2px;
      margin: 12px 0 6px 0;
    }
    ul {
      margin: 4px 0;
      padding-left: 16px;
    }
    li {
      margin-bottom: 6px;
      line-height: 1.35;
    }
    .job-title {
      font-weight: bold;
      color: #222;
    }
    .date {
      color: #777;
      font-size: 10px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <h1>Alex Rivera</h1>
  <div style="margin-bottom: 15px; color: #555;">Full Stack Cloud Engineer | Bengaluru, India</div>

  <div class="container">
    <!-- LEFT SIDEBAR -->
    <div class="left-col">
      <h2>Contact</h2>
      <div>alex.candidate@example.com</div>
      <div>github.com/alexrivera</div>

      <h2>Education</h2>
      <div class="job-title">B.Tech Computer Science</div>
      <div>National Institute of Technology</div>
      <div class="date">2022 – 2026</div>

      <h2>Technical Skills</h2>
      <p><strong>Languages:</strong> Java, Python, TypeScript, Go, SQL</p>
      <p><strong>Frameworks:</strong> Spring Boot, Next.js, Express, FastAPI</p>
      <p><strong>Cloud/DevOps:</strong> AWS, Docker, Kubernetes, Terraform</p>
      <p><strong>Databases:</strong> PostgreSQL, Redis, MongoDB</p>
    </div>

    <!-- RIGHT MAIN CONTENT -->
    <div class="right-col">
      <h2>Work Experience</h2>
      <div class="job-title">Software Engineering Intern – CloudScale Systems</div>
      <div class="date">Jan 2025 – Present</div>
      <ul>
        <li>Architected high-throughput REST APIs using Spring Boot and PostgreSQL, handling 15,000 requests per minute with zero data loss.</li>
        <li>Automated deployment pipeline across AWS EKS using Terraform and GitHub Actions, reducing deployment time by 45%.</li>
        <li>Implemented Redis caching layer across microservices, decreasing database read queries by 60%.</li>
      </ul>

      <h2>Featured Projects</h2>
      <div class="job-title">Distributed Task Scheduler</div>
      <div class="date">Sep 2024 – Nov 2024</div>
      <ul>
        <li>Engineered distributed job queue in Go using RabbitMQ and Docker Compose, achieving at-least-once task delivery across 8 worker nodes.</li>
        <li>Implemented leader election algorithm using Raft consensus, ensuring fault-tolerant task coordination under node failures.</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
  });
  await browser.close();

  console.log(`✓ 2-column PDF successfully generated at ${pdfPath}`);

  // 2. Read and extract text using unpdf
  console.log('\n2. Extracting text via extractTextFromPdf...');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const { text: extracted, pageCount, isScannedOrImagePdf } = await extractTextFromPdf(pdfBuffer);

  console.log(`Extracted text length: ${extracted.length} chars (Pages: ${pageCount}, Scanned: ${isScannedOrImagePdf})`);
  console.log('--- Sample Extracted Text (First 300 chars) ---');
  console.log(extracted.slice(0, 300));
  console.log('-----------------------------------------------\n');

  // 3. Verify Bullet Points extraction
  const bullets = extractBulletPoints(extracted);
  console.log(`Detected Bullets (${bullets.length}):`);
  bullets.forEach((b, idx) => console.log(`  [${idx + 1}] ${b}`));

  assert.ok(bullets.length >= 4, `Expected at least 4 extracted bullets, found ${bullets.length}`);

  // Check that bullets contain the right content and are not scrambled
  const b1 = bullets.find((b) => b.includes('Spring Boot') && b.includes('15,000'));
  assert.ok(b1, 'Expected Spring Boot / 15,000 RPM bullet to be cleanly extracted');

  const b2 = bullets.find((b) => b.includes('AWS EKS') && b.includes('45%'));
  assert.ok(b2, 'Expected AWS EKS / 45% bullet to be cleanly extracted');

  const b3 = bullets.find((b) => b.includes('RabbitMQ') && b.includes('8 worker nodes'));
  assert.ok(b3, 'Expected RabbitMQ / 8 worker nodes bullet to be cleanly extracted');

  console.log('✓ All experience and project bullets successfully extracted without column corruption.');

  // 4. Verify Skills extraction
  const skills = extractKeywords(extracted);
  console.log(`\nDetected Skills (${skills.length}):`, skills.slice(0, 15).join(', '));
  assert.ok(skills.includes('spring boot'), 'Expected spring boot in detected skills');
  assert.ok(skills.includes('postgresql') || skills.includes('postgres'), 'Expected postgres in detected skills');
  assert.ok(skills.includes('docker'), 'Expected docker in detected skills');
  assert.ok(skills.includes('kubernetes'), 'Expected kubernetes in detected skills');

  console.log('\n======================================================');
  console.log('🎉 TWO-COLUMN RESUME EXTRACTION TEST PASSED!');
  console.log('======================================================\n');
}

testTwoColumnPdfExtraction().catch((err) => {
  console.error('Two-column PDF extraction failed:', err);
  process.exit(1);
});
