import puppeteer from 'puppeteer';

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16));
  return luminance(rgb[0], rgb[1], rgb[2]);
}

function contrast(lum1: number, lum2: number): number {
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function main() {
  console.log('=== Worst-Case Dynamic Background Contrast Sampling ===\n');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Force the brightest cyan blob directly under the hero subcopy and card
  // This simulates the peak brightest moment of the animation directly behind text
  await page.evaluate(`(() => {
    const b2 = document.querySelector('.fluid-blob-2');
    if (b2) {
      b2.style.transform = 'translate3d(-20vw, 15vh, 0) scale(1.25)';
      b2.style.opacity = '0.80';
    }
    const b1 = document.querySelector('.fluid-blob-1');
    if (b1) {
      b1.style.transform = 'translate3d(15vw, 18vh, 0) scale(1.15)';
      b1.style.opacity = '0.80';
    }
  })()`);

  await new Promise(r => setTimeout(r, 300));

  // Find exact element coordinates
  const coords = await page.evaluate(`(() => {
    const subcopy = document.querySelector('main p');
    const chip = document.querySelector('main div.inline-flex') || document.querySelector('main span');
    const label = document.querySelector('label') || document.querySelector('.text-xs.font-bold') || document.querySelector('h3');

    const getCenter = (el) => {
      if (!el) return { x: 720, y: 260 };
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    };

    return {
      subcopy: getCenter(subcopy),
      chip: getCenter(chip),
      label: getCenter(label)
    };
  })()`);

  // Hide text elements so screenshot captures the exact background pixel underneath
  await page.evaluate(`(() => {
    document.querySelectorAll('h1, h2, h3, p, span, label, button, textarea').forEach(el => {
      el.style.color = 'transparent';
    });
  })()`);

  const base64 = await page.screenshot({ encoding: 'base64' });

  // Read pixel RGB natively using createImageBitmap + OffscreenCanvas in browser
  const samples = (await page.evaluate(`(async () => {
    const b64 = "${base64}";
    const pts = ${JSON.stringify(coords)};
    const res = await fetch('data:image/png;base64,' + b64);
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);

    const getPixel = (pt) => {
      const p = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      return { r: p[0], g: p[1], b: p[2] };
    };

    return {
      subcopyBg: getPixel(pts.subcopy),
      chipBg: getPixel(pts.chip),
      labelBg: getPixel(pts.label)
    };
  })()`)) as {
    subcopyBg: { r: number; g: number; b: number };
    chipBg: { r: number; g: number; b: number };
    labelBg: { r: number; g: number; b: number };
  };

  const targets = [
    {
      name: '(a) Hero Subcopy',
      bgRgb: samples.subcopyBg,
      textToken: 'Text Secondary (#C4C4D6)',
      textHex: '#C4C4D6',
      req: '4.5:1 (Body)'
    },
    {
      name: '(b) Chips / Tag Pills',
      bgRgb: samples.chipBg,
      textToken: 'Accent Cyan (#2DD4F5) / Text Primary (#F8F8FC)',
      textHex: '#F8F8FC',
      req: '3.0:1 (UI/Chip)'
    },
    {
      name: '(c) Form Card Labels',
      bgRgb: samples.labelBg,
      textToken: 'Text Muted (#9A9AB5)',
      textHex: '#9A9AB5',
      req: '3.0:1 (UI Label)'
    }
  ];

  console.log('| Target Element | Sampled Background RGB | Background Hex | Foreground Token | Contrast Ratio | WCAG Target | Status |');
  console.log('|---|---|---|---|---|---|---|');

  for (const t of targets) {
    const bgHex = '#' + [t.bgRgb.r, t.bgRgb.g, t.bgRgb.b].map(x => x.toString(16).padStart(2, '0')).join('');
    const bgLum = luminance(t.bgRgb.r, t.bgRgb.g, t.bgRgb.b);
    const fgLum = hexLuminance(t.textHex);
    const ratio = contrast(bgLum, fgLum);
    const minReq = t.req.startsWith('4.5') ? 4.5 : 3.0;
    const pass = ratio >= minReq;
    console.log(
      `| ${t.name} | rgb(${t.bgRgb.r}, ${t.bgRgb.g}, ${t.bgRgb.b}) | ${bgHex} | ${t.textToken} | **${ratio.toFixed(2)}:1** | ${t.req} | ${pass ? '✅ Pass' : '❌ Fail'} |`
    );
  }

  await browser.close();
}

main().catch(console.error);
