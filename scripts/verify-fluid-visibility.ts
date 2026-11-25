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

async function verify() {
  console.log('=== Verifying Fluid Gradient Visibility & Capturing Artifacts ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Inspect computed styles
  const computed = await page.evaluate(`
    (() => {
      const b1 = document.querySelector('.fluid-blob-1');
      const b2 = document.querySelector('.fluid-blob-2');
      const container = document.querySelector('[aria-hidden="true"]');
      const s1 = b1 ? window.getComputedStyle(b1) : null;
      const s2 = b2 ? window.getComputedStyle(b2) : null;
      const sc = container ? window.getComputedStyle(container) : null;

      return {
        container: sc ? {
          position: sc.position,
          zIndex: sc.zIndex,
          width: sc.width,
          height: sc.height,
        } : null,
        blob1_violet: s1 ? {
          width: s1.width,
          height: s1.height,
          opacity: s1.opacity,
          filter: s1.filter,
        } : null,
        blob2_cyan: s2 ? {
          width: s2.width,
          height: s2.height,
          opacity: s2.opacity,
          filter: s2.filter,
        } : null,
      };
    })()
  `);

  console.log('Computed Element Inspection:', JSON.stringify(computed, null, 2));

  // 2. Capture 1440px Landing
  console.log('\n[1/4] Capturing 1440px Landing...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fluid_1440px_landing.png') });
  console.log('✓ Captured fluid_1440px_landing.png');

  // 3. Trigger Results and capture 1440px Results
  console.log('\n[2/4] Triggering Analysis for 1440px Results...');
  const pdfPath = path.resolve(process.cwd(), 'public', 'samples', 'sample_sde_resume.pdf');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) await fileInput.uploadFile(pdfPath);
  const jdTextarea = await page.$('textarea');
  if (jdTextarea) await jdTextarea.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await page.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fluid_1440px_results.png') });
  console.log('✓ Captured fluid_1440px_results.png');

  // 4. Capture 390px Mobile Landing & Results
  console.log('\n[3/4] Capturing 390px Mobile Landing & Results...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'fluid_390px_landing.png') });
  console.log('✓ Captured fluid_390px_landing.png');

  const mFileInput = await mobilePage.$('input[type="file"]');
  if (mFileInput) await mFileInput.uploadFile(pdfPath);
  const mJd = await mobilePage.$('textarea');
  if (mJd) await mJd.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));
  const mSubmit = await mobilePage.$('button[type="submit"]');
  if (mSubmit) await mSubmit.click();
  await mobilePage.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'fluid_390px_results.png') });
  console.log('✓ Captured fluid_390px_results.png');
  await mobilePage.close();

  // 5. 6-Frame Filmstrip over ~30s
  console.log('\n[4/4] Capturing 6-frame filmstrip over ~30s...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  for (let i = 1; i <= 6; i++) {
    const elapsed = (i - 1) * 6;
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `fluid_filmstrip_frame_${i}_${elapsed}s.png`),
    });
    console.log(`✓ Captured fluid_filmstrip_frame_${i}_${elapsed}s.png (at t=${elapsed}s)`);
    if (i < 6) {
      await new Promise((r) => setTimeout(r, 6000));
    }
  }

  await browser.close();
  console.log('\n=== All Fluid Gradient Captures Finished Successfully ===');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
