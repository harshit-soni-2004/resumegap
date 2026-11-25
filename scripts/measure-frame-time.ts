import puppeteer from 'puppeteer';

async function measure() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const client = await page.createCDPSession();
  // 4x CPU Throttling
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Evaluate over 60 frames as string to avoid tsx transpilation helper __name
  const result = await page.evaluate(`
    new Promise((resolve) => {
      const times = [];
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
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          const max = Math.max(...times);
          const min = Math.min(...times);
          resolve({ avg, max, min, count: times.length });
        }
      }
      requestAnimationFrame(step);
    })
  `);

  console.log('=== Performance Benchmark (390px with 4x CPU Throttle) ===');
  console.log('Results:', result);
  await browser.close();
}

measure().catch(console.error);
