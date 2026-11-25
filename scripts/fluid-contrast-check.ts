export {};

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(lum1: number, lum2: number): number {
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Color definitions
const INK = { r: 10, g: 10, b: 18 }; // #0A0A12
const CYAN = { r: 34, g: 211, b: 238 }; // #22D3EE (Brightest blob)
const TEXT_PRIMARY = { r: 245, g: 245, b: 250 }; // #F5F5FA
const TEXT_SECONDARY = { r: 180, g: 180, b: 200 }; // #B4B4C8
const TEXT_MUTED = { r: 138, g: 138, b: 163 }; // #8A8AA3

// Screen blend: 1 - (1 - a)*(1 - b)
function screenBlend(base: { r: number; g: number; b: number }, top: { r: number; g: number; b: number }, opacity: number) {
  const topBlended = {
    r: (top.r * opacity) / 255,
    g: (top.g * opacity) / 255,
    b: (top.b * opacity) / 255,
  };
  const baseNorm = { r: base.r / 255, g: base.g / 255, b: base.b / 255 };

  return {
    r: Math.round((1 - (1 - baseNorm.r) * (1 - topBlended.r)) * 255),
    g: Math.round((1 - (1 - baseNorm.g) * (1 - topBlended.g)) * 255),
    b: Math.round((1 - (1 - baseNorm.b) * (1 - topBlended.b)) * 255),
  };
}

// Alpha over: out = top * a + base * (1 - a)
function alphaOver(base: { r: number; g: number; b: number }, top: { r: number; g: number; b: number }, a: number) {
  return {
    r: Math.round(top.r * a + base.r * (1 - a)),
    g: Math.round(top.g * a + base.g * (1 - a)),
    b: Math.round(top.b * a + base.b * (1 - a)),
  };
}

// 1. Brightest blob area (Cyan at 0.45 opacity screened over Ink)
const blobCenter = screenBlend(INK, CYAN, 0.45);

// 2. Brightest blob with dark vignette overlay (45% ink at center)
const blobWithVignette = alphaOver(blobCenter, INK, 0.45);

// 3. Inside glass card (75% #181826 over brightest blob with vignette)
const cardBase = { r: 24, g: 24, b: 38 }; // #181826
const glassCard = alphaOver(blobWithVignette, cardBase, 0.75);

const lumPrimary = luminance(TEXT_PRIMARY.r, TEXT_PRIMARY.g, TEXT_PRIMARY.b);
const lumSecondary = luminance(TEXT_SECONDARY.r, TEXT_SECONDARY.g, TEXT_SECONDARY.b);
const lumMuted = luminance(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);

console.log('=== Worst-Case Contrast Ratios Over Fluid Gradient ===\n');

const scenarios = [
  { name: '1. Over Brightest Blob + Vignette (Hero Headline Area)', color: blobWithVignette },
  { name: '2. Inside Translucent Glass Card (Upload / Results Header)', color: glassCard },
  { name: '3. Inside Solid Surface Card (#181826 Raised Panel)', color: cardBase },
];

for (const sc of scenarios) {
  const lumBg = luminance(sc.color.r, sc.color.g, sc.color.b);
  const ratioPrimary = contrast(lumPrimary, lumBg);
  const ratioSecondary = contrast(lumSecondary, lumBg);
  const ratioMuted = contrast(lumMuted, lumBg);

  console.log(`### ${sc.name} [RGB: ${sc.color.r}, ${sc.color.g}, ${sc.color.b}]`);
  console.log(`- Primary Text (#F5F5FA): **${ratioPrimary.toFixed(2)}:1** -> ${ratioPrimary >= 4.5 ? 'PASS (WCAG AA/AAA)' : 'FAIL'}`);
  console.log(`- Secondary Text (#B4B4C8): **${ratioSecondary.toFixed(2)}:1** -> ${ratioSecondary >= 4.5 ? 'PASS (WCAG AA/AAA)' : 'FAIL'}`);
  console.log(`- Muted Text (#8A8AA3): **${ratioMuted.toFixed(2)}:1** -> ${ratioMuted >= 4.5 ? 'PASS (WCAG AA)' : (ratioMuted >= 3.0 ? 'PASS (Large/UI)' : 'FAIL')}\n`);
}
