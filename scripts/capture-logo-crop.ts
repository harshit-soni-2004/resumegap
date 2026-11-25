import puppeteer from 'puppeteer';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const artifactDir = path.join(
    'C:',
    'Users',
    'ihars',
    '.gemini',
    'antigravity',
    'brain',
    '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
  );

  // 1. Capture close-up of the brand section in navbar
  const brandSection = await page.$('header a[href="/"]');
  if (brandSection) {
    await brandSection.screenshot({
      path: path.join(artifactDir, 'new_logo_closeup.png'),
    });
    console.log('✓ Captured new_logo_closeup.png');
  }

  // 2. Capture full navbar
  const navbar = await page.$('header');
  if (navbar) {
    await navbar.screenshot({
      path: path.join(artifactDir, 'navbar_with_new_logo.png'),
    });
    console.log('✓ Captured navbar_with_new_logo.png');
  }

  await browser.close();
}

main().catch(console.error);
