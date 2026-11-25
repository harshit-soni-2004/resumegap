import puppeteer from 'puppeteer';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/styleguide', { waitUntil: 'networkidle2' });
  const artifactDir = path.join(
    'C:',
    'Users',
    'ihars',
    '.gemini',
    'antigravity',
    'brain',
    '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
  );
  await page.screenshot({ path: path.join(artifactDir, 'styleguide_v3_specimen.png'), fullPage: true });
  console.log('✓ Captured styleguide_v3_specimen.png');
  await browser.close();
}

main().catch(console.error);
