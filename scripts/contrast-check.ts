export {};

function luminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
  const a = rgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(hex1: string, hex2: string): number {
  const lum1 = luminance(hex1);
  const lum2 = luminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Alpha compositing over opaque background
function composite(foregroundRgba: [number, number, number, number], backgroundHex: string): string {
  const [r1, g1, b1, a] = foregroundRgba;
  const rgb2 = backgroundHex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16));
  const r = Math.round(r1 * a + rgb2[0] * (1 - a));
  const g = Math.round(g1 * a + rgb2[1] * (1 - a));
  const b = Math.round(b1 * a + rgb2[2] * (1 - a));
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

const inkBase = '#07070F';
const inkSubtleGradient = '#0C0B1A';

// 3 Elevated Surfaces composited over ink
const surface1 = composite([255, 255, 255, 0.04], inkBase); // ~ #111119
const surface2 = composite([255, 255, 255, 0.07], inkBase); // ~ #181820
const surface3 = composite([255, 255, 255, 0.10], inkBase); // ~ #202028

const backgrounds = [
  { name: 'Ink Base (#07070F)', hex: inkBase },
  { name: 'Ink Gradient End (#0C0B1A)', hex: inkSubtleGradient },
  { name: 'Surface-1 (4% white)', hex: surface1 },
  { name: 'Surface-2 (7% white)', hex: surface2 },
  { name: 'Surface-3 (10% white)', hex: surface3 },
];

const texts = [
  { name: 'Text Primary (#F8F8FC)', hex: '#F8F8FC', req: 'Body (4.5:1)' },
  { name: 'Text Secondary (#C4C4D6)', hex: '#C4C4D6', req: 'Body (4.5:1)' },
  { name: 'Text Muted (#9A9AB5)', hex: '#9A9AB5', req: 'Body (4.5:1)' },
  { name: 'Accent Violet (#8B6CFF)', hex: '#8B6CFF', req: 'UI/Large (3.0:1)' },
  { name: 'Accent Cyan (#2DD4F5)', hex: '#2DD4F5', req: 'Body/UI (4.5:1)' },
  { name: 'Warm Rose (#F472B6)', hex: '#F472B6', req: 'Body/UI (4.5:1)' },
  { name: 'Warm Amber (#FBBF24)', hex: '#FBBF24', req: 'Body/UI (4.5:1)' },
  { name: 'Success (#34D399)', hex: '#34D399', req: 'Body/UI (4.5:1)' },
  { name: 'Warning (#FBBF24)', hex: '#FBBF24', req: 'Body/UI (4.5:1)' },
  { name: 'Danger (#FB7185)', hex: '#FB7185', req: 'Body/UI (4.5:1)' },
];

console.log('=== PHASE 1: TOKEN CONTRAST RATIO AUDIT ===\n');
console.log('| Background | Foreground | Contrast Ratio | WCAG AA Body (4.5:1) | WCAG AA Large/UI (3:1) |');
console.log('|---|---|---|---|---|');

for (const bg of backgrounds) {
  for (const fg of texts) {
    const ratio = contrast(bg.hex, fg.hex);
    const bodyPass = ratio >= 4.5;
    const uiPass = ratio >= 3.0;
    console.log(
      `| ${bg.name} | ${fg.name} | **${ratio.toFixed(2)}:1** | ${bodyPass ? '✅ Pass' : '❌ Fail'} | ${uiPass ? '✅ Pass' : '❌ Fail'} |`
    );
  }
}

console.log('\n=== PRIMARY GRADIENT BUTTON CONTRAST AUDIT ===');
console.log('Testing text choices across the gradient from Violet (#8B6CFF) to Cyan (#2DD4F5):\n');

const gradientStops = [
  { name: 'Violet End (#8B6CFF)', hex: '#8B6CFF' },
  { name: 'Midpoint (~#5C9FF9)', hex: '#5C9FF9' },
  { name: 'Cyan End (#2DD4F5)', hex: '#2DD4F5' },
];

const buttonTextOptions = [
  { name: 'Near-Black (#07070F)', hex: '#07070F' },
  { name: 'Pure White (#FFFFFF)', hex: '#FFFFFF' },
  { name: 'Primary Text (#F8F8FC)', hex: '#F8F8FC' },
];

console.log('| Gradient Position | Button Text Option | Contrast Ratio | WCAG AA Body (4.5:1) | Status |');
console.log('|---|---|---|---|---|');

for (const stop of gradientStops) {
  for (const txt of buttonTextOptions) {
    const ratio = contrast(stop.hex, txt.hex);
    const pass = ratio >= 4.5;
    console.log(`| ${stop.name} | ${txt.name} | **${ratio.toFixed(2)}:1** | ${pass ? '✅ Pass' : '❌ Fail'} | ${pass ? 'PASSED AA' : 'FAILED'} |`);
  }
}
