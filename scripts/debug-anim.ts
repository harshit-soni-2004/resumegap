import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const info = await page.evaluate(`(() => {
    const el = document.querySelector('.fluid-blob-1');
    if (!el) return { error: 'not found' };
    const comp = window.getComputedStyle(el);
    return {
      animation: comp.animation,
      animationName: comp.animationName,
      animationDuration: comp.animationDuration,
      animationPlayState: comp.animationPlayState,
      animationTimingFunction: comp.animationTimingFunction,
      transform: comp.transform,
      willChange: comp.willChange,
      className: el.className
    };
  })()`);
  console.log('BLOB 1 COMPUTES:', JSON.stringify(info, null, 2));

  // Also check if prefers-reduced-motion is somehow active, or what is happening
  const reducedMotion = await page.evaluate(`(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  })()`);
  console.log('Reduced motion matches:', reducedMotion);

  // Take two transforms 2 seconds apart:
  const t0 = await page.evaluate(`(() => window.getComputedStyle(document.querySelector('.fluid-blob-1')).transform)()`);
  await new Promise(r => setTimeout(r, 2000));
  const t2 = await page.evaluate(`(() => window.getComputedStyle(document.querySelector('.fluid-blob-1')).transform)()`);
  console.log('Transform at t=0s:', t0);
  console.log('Transform at t=2s:', t2);
  console.log('Did transform change?', t0 !== t2);

  await browser.close();
}

main().catch(console.error);
