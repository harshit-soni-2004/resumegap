import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const rect = await page.evaluate(`(() => {
    const card = document.querySelector('main > div:nth-of-type(2)');
    if (!card) return 'card not found';
    const r = card.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), viewportHeight: 900, peekingPixels: Math.round(900 - r.top) };
  })()`);
  console.log('UPLOAD CARD RECT AT 1440x900:', rect);
  await browser.close();
}

main().catch(console.error);
