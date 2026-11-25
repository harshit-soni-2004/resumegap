import puppeteer from 'puppeteer';
import * as path from 'path';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Listen for any console errors or warnings
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    const msgType = msg.type() as string;
    if (msgType === 'error' || msgType === 'warning') {
      consoleErrors.push(`[${msgType}] ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Check if error overlay exists
  const hasErrorOverlay = await page.evaluate(() => {
    return !!document.querySelector('nextjs-portal, [data-nextjs-dialog-overlay]');
  });
  console.log('Next.js error overlay visible:', hasErrorOverlay);
  console.log('Console errors captured:', consoleErrors);

  // Capture navbar crop
  const navbarElement = await page.$('header');
  if (navbarElement) {
    const navCropPath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/live_navbar_with_hexknot.png');
    await navbarElement.screenshot({ path: navCropPath });
    console.log('Saved live navbar screenshot to:', navCropPath);
  }

  // Capture full page
  const fullPagePath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/live_landing_no_errors.png');
  await page.screenshot({ path: fullPagePath });
  console.log('Saved live landing screenshot to:', fullPagePath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
