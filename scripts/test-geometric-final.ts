import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    background: #07070F;
    color: #F8F8FC;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 980px;
    width: 100%;
  }
  .card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
  }
  .card h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
  .card p {
    margin: 0;
    font-size: 12px;
    color: #8A8AA3;
    line-height: 1.4;
  }
  .nav-preview {
    background: rgba(17, 17, 28, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
    margin-top: 8px;
  }
  .wordmark-title {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #FFFFFF;
    text-align: left;
  }
  .wordmark-title span { color: #2DD4F5; }
  .copilot-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 7px;
    border-radius: 9999px;
    background: rgba(139, 108, 255, 0.15);
    border: 1px solid rgba(139, 108, 255, 0.4);
    color: #2DD4F5;
  }
  .subtext {
    font-size: 10px;
    color: #8A8AA3;
    text-align: left;
  }
</style>
</head>
<body>

  <div style="text-align: center;">
    <h2 style="font-size: 24px; margin: 0 0 6px 0;">Geometrical Tech Logos for ResumeGap</h2>
    <p style="color: #8A8AA3; margin: 0; font-size: 14px;">Comparing ChatGPT, AMD/Anthropic, and NVIDIA geometric paradigms</p>
  </div>

  <div class="grid">
    <!-- CONCEPT 1: The ChatGPT Hex-Knot (Pure Rotational Rosette) -->
    <div class="card">
      <h3 style="color: #C084FC;">1. The Hex-Knot</h3>
      <p style="color: #8B6CFF; font-weight: 600;">ChatGPT / OpenAI Inspired</p>
      
      <!-- 72px Icon with SVG styles -->
      <svg width="72" height="72" viewBox="0 0 72 72">
        <defs>
          <linearGradient id="k1-linear" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#C084FC;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#8B6CFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2DD4F5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <g transform="translate(36, 36)" stroke="url(#k1-linear)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" />
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(60)" />
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(120)" />
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(180)" />
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(240)" />
          <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(300)" />
        </g>
        <circle cx="36" cy="36" r="3.5" fill="#FFFFFF" />
      </svg>

      <p>Continuous 6-fold interlocking ribbon rosette. Hypnotic, symmetrical, and intellectually refined.</p>

      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 72 72">
          <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <g transform="translate(36, 36)" stroke="url(#k1-linear)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" />
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(60)" />
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(120)" />
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(180)" />
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(240)" />
            <path d="M 0 -11 C 12 -11 20 -3 20 8 C 20 16 12 21 4 21 L -7 21" transform="rotate(300)" />
          </g>
          <circle cx="36" cy="36" r="4" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 2: The Convergent Chevrons (AMD + Anthropic Precision) -->
    <div class="card">
      <h3 style="color: #2DD4F5;">2. Convergent Chevrons</h3>
      <p style="color: #38BDF8; font-weight: 600;">AMD / Anthropic Inspired</p>
      
      <!-- 72px Icon with SVG styles -->
      <svg width="72" height="72" viewBox="0 0 72 72">
        <defs>
          <linearGradient id="k2-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#C084FC;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7C5CFF;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="k2-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#38BDF8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <!-- Top-Left Chevron (Resume) -->
        <path d="M 16 34 L 36 14 L 46 24 L 32 38 L 42 48 L 34 56 Z" fill="url(#k2-violet)" />
        <!-- Bottom-Right Chevron (Job Description) -->
        <path d="M 56 38 L 36 58 L 26 48 L 40 34 L 30 24 L 38 16 Z" fill="url(#k2-cyan)" />
        <!-- The Central Aligned Spark Matrix -->
        <polygon points="36,31 41,36 36,41 31,36" fill="#FFFFFF" />
      </svg>

      <p>Two monolithic interlocking polygonal chevrons bridging a diagonal gap with silicon-sharp precision.</p>

      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 72 72">
          <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <path d="M 16 34 L 36 14 L 46 24 L 32 38 L 42 48 L 34 56 Z" fill="url(#k2-violet)" />
          <path d="M 56 38 L 36 58 L 26 48 L 40 34 L 30 24 L 38 16 Z" fill="url(#k2-cyan)" />
          <polygon points="36,31 41,36 36,41 31,36" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 3: The Cyber Vortex / Aperture (NVIDIA Inspired) -->
    <div class="card">
      <h3 style="color: #38BDF8;">3. Cyber Vortex</h3>
      <p style="color: #2DD4F5; font-weight: 600;">NVIDIA / Tech Claw Inspired</p>
      
      <!-- 72px Icon with SVG styles -->
      <svg width="72" height="72" viewBox="0 0 72 72">
        <defs>
          <linearGradient id="k3-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B6CFF;stop-opacity:1" />
            <stop offset="60%" style="stop-color:#2DD4F5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <!-- Stepped concentric arcs forming a dynamic tech claw / aperture eye -->
        <path d="M 36 16 A 20 20 0 0 1 56 36 A 20 20 0 0 1 36 56" stroke="#8B6CFF" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <path d="M 36 23 A 13 13 0 0 1 49 36 A 13 13 0 0 1 36 49" stroke="#2DD4F5" stroke-width="4.5" stroke-linecap="round" fill="none" />
        <path d="M 36 30 A 6 6 0 0 1 42 36 A 6 6 0 0 1 36 42" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
        <!-- Stepped bridging line across the left gap -->
        <path d="M 18 36 L 31 36" stroke="#2DD4F5" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="36" cy="36" r="2.5" fill="#FFFFFF" />
      </svg>

      <p>Concentric spiral contours forming an illuminated aperture. High-tech, radar-like precision.</p>

      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 72 72">
          <rect x="2" y="2" width="68" height="68" rx="18" fill="#121122" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <path d="M 36 16 A 20 20 0 0 1 56 36 A 20 20 0 0 1 36 56" stroke="#8B6CFF" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M 36 23 A 13 13 0 0 1 49 36 A 13 13 0 0 1 36 49" stroke="#2DD4F5" stroke-width="4.5" stroke-linecap="round" fill="none" />
          <path d="M 36 30 A 6 6 0 0 1 42 36 A 6 6 0 0 1 36 42" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />
          <path d="M 18 36 L 31 36" stroke="#2DD4F5" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="36" cy="36" r="2.5" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  fs.writeFileSync('scripts/geometric-final-bench.html', html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 600 });
  await page.goto('file://' + path.resolve('scripts/geometric-final-bench.html'));
  
  const artifactPath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/logo_geometric_final_showcase.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved final geometric showcase screenshot to:', artifactPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
