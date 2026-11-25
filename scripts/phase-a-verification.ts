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
  console.log('=== Starting Phase A Fluid Gradient Verification & Filmstrip Capture ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Desktop 1440px Landing & Results
  console.log('[1/5] Capturing 1440px Desktop Landing & Results...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_1440px_landing.png'),
  });
  console.log('✓ Captured fluid_1440px_landing.png');

  // Trigger results on desktop
  const pdfPath = path.resolve(process.cwd(), 'public', 'samples', 'sample_sde_resume.pdf');
  const fileInput = await desktopPage.$('input[type="file"]');
  if (fileInput) await fileInput.uploadFile(pdfPath);
  const jdTextarea = await desktopPage.$('textarea');
  if (jdTextarea) await jdTextarea.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));
  const submitBtn = await desktopPage.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await desktopPage.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_1440px_results.png'),
  });
  console.log('✓ Captured fluid_1440px_results.png');
  await desktopPage.close();

  // 2. Mobile 390px Landing & Results
  console.log('[2/5] Capturing 390px Mobile Landing & Results...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_390px_landing.png'),
  });
  console.log('✓ Captured fluid_390px_landing.png');

  const mFileInput = await mobilePage.$('input[type="file"]');
  if (mFileInput) await mFileInput.uploadFile(pdfPath);
  const mJd = await mobilePage.$('textarea');
  if (mJd) await mJd.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));
  const mSubmit = await mobilePage.$('button[type="submit"]');
  if (mSubmit) await mSubmit.click();
  await mobilePage.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_390px_results.png'),
  });
  console.log('✓ Captured fluid_390px_results.png');
  await mobilePage.close();

  // 3. 6-Frame Filmstrip over ~30s (0s, 6s, 12s, 18s, 24s, 30s)
  console.log('[3/5] Capturing 6-frame drift filmstrip over 30s at 1440px...');
  const driftPage = await browser.newPage();
  await driftPage.setViewport({ width: 1440, height: 900 });
  await driftPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  for (let i = 1; i <= 6; i++) {
    const elapsed = (i - 1) * 6;
    await driftPage.screenshot({
      path: path.join(ARTIFACT_DIR, `fluid_filmstrip_frame_${i}_${elapsed}s.png`),
    });
    console.log(`✓ Captured fluid_filmstrip_frame_${i}_${elapsed}s.png`);
    if (i < 6) {
      await new Promise((r) => setTimeout(r, 6000));
    }
  }
  await driftPage.close();

  // 4. prefers-reduced-motion emulated
  console.log('[4/5] Capturing prefers-reduced-motion emulated...');
  const motionPage = await browser.newPage();
  await motionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await motionPage.setViewport({ width: 1440, height: 900 });
  await motionPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await motionPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_reduced_motion.png'),
  });
  console.log('✓ Captured fluid_reduced_motion.png');
  await motionPage.close();

  // 5. backdrop-filter disabled fallback emulated + 4x CPU throttle performance measurement
  console.log('[5/5] Emulating backdrop-filter disabled & 4x CPU throttle performance measurement...');
  const perfPage = await browser.newPage();
  await perfPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Inject CSS to disable backdrop-filter to verify solid fallback
  await perfPage.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
    document.documentElement.appendChild(style);
  });

  const client = await perfPage.createCDPSession();
  // 4x CPU throttling
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await perfPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await perfPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'fluid_backdrop_filter_disabled.png'),
  });
  console.log('✓ Captured fluid_backdrop_filter_disabled.png');

  // Measure animation frame durations over 60 frames under 4x CPU throttle
  const frameTimes = await perfPage.evaluate(async () => {
    return new Promise<number[]>((resolve) => {
      const times: number[] = [];
      let last = performance.now();
      let frames = 0;

      function step() {
        const now = performance.now();
        times.push(now - last);
        last = now;
        frames++;
        if (frames < 60) {
          requestAnimationFrame(step);
        } else {
          resolve(times);
        }
      }
      requestAnimationFrame(step);
    });
  });

  const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  console.log(`[Performance Report] 390px Viewport with 4x CPU Throttling:`);
  console.log(`  Average frame time: ${avgFrameTime.toFixed(2)} ms (~${(1000 / avgFrameTime).toFixed(1)} FPS)`);
  console.log(`  Worst frame time: ${Math.max(...frameTimes).toFixed(2)} ms`);

  await perfPage.close();
  await browser.close();
  console.log('\n=== All Phase A Screenshots & Performance Benchmarks Complete ===');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
