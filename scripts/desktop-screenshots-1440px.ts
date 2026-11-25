import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { SAMPLE_JOB_DESCRIPTION } from '../src/lib/sample-data';

const ARTIFACT_DIR = path.join(
  'C:',
  'Users',
  'ihars',
  '.gemini',
  'antigravity',
  'brain',
  '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
);

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function run() {
  console.log('Capturing 1440px desktop screenshots...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 1. Landing 1440px
  console.log('1. Capturing landing page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'desktop_01_landing_1440px.png'),
    fullPage: false,
  });
  console.log('✓ Captured desktop_01_landing_1440px.png');

  // 2. Results 1440px
  console.log('2. Running analysis for results page...');
  const pdfPath = path.resolve(process.cwd(), 'public', 'samples', 'sample_sde_resume.pdf');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) await fileInput.uploadFile(pdfPath);

  const jdTextarea = await page.$('textarea');
  if (jdTextarea) await jdTextarea.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));

  const analyzeButton = await page.$('button[type="submit"]');
  if (analyzeButton) await analyzeButton.click();

  await page.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'desktop_02_results_1440px.png'),
    fullPage: false,
  });
  console.log('✓ Captured desktop_02_results_1440px.png');

  // 3. Admin 1440px
  console.log('3. Capturing /admin...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'desktop_03_admin_1440px.png'),
    fullPage: false,
  });
  console.log('✓ Captured desktop_03_admin_1440px.png');

  await browser.close();
  console.log('Desktop 1440px capture complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
