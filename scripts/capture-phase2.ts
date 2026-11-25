import puppeteer from 'puppeteer';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const artifactDir = path.join(
    'C:',
    'Users',
    'ihars',
    '.gemini',
    'antigravity',
    'brain',
    '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
  );

  // 1. 1440px Desktop
  const page1440 = await browser.newPage();
  await page1440.setViewport({ width: 1440, height: 900 });
  await page1440.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page1440.screenshot({
    path: path.join(artifactDir, 'landing_phase2_1440px.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });
  console.log('✓ Captured landing_phase2_1440px.png (Viewport 1440x900 fold)');

  // 2. 390px Mobile
  const page390 = await browser.newPage();
  await page390.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page390.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page390.screenshot({
    path: path.join(artifactDir, 'landing_phase2_390px.png'),
    fullPage: false
  });
  console.log('✓ Captured landing_phase2_390px.png');

  await browser.close();
}

main().catch(console.error);
