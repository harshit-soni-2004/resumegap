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
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
    max-width: 900px;
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
  .nav-preview {
    background: rgba(17, 17, 28, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    box-sizing: border-box;
    margin-top: 8px;
  }
  .wordmark-title {
    font-size: 18px;
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
    font-size: 11px;
    color: #8A8AA3;
    text-align: left;
  }
</style>
</head>
<body>

  <div style="text-align: center;">
    <h2 style="font-size: 24px; margin: 0 0 6px 0;">Geometrical Logos (ChatGPT, Anthropic, NVIDIA, AMD Inspired)</h2>
    <p style="color: #8A8AA3; margin: 0; font-size: 14px;">High-contrast mathematical shapes in our signature palette</p>
  </div>

  <div class="grid">
    <!-- CONCEPT 1: THE ROTATIONAL KNOT (ChatGPT inspired) -->
    <div class="card">
      <h3 style="margin: 0; font-size: 17px;">Option 1: The Hex-Knot (ChatGPT Style)</h3>
      <p style="margin: 0; color: #8B6CFF; font-size: 12px;">Continuous 6-fold interlocking ribbon rosette</p>
      
      <!-- 80px SVG -->
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="k1-grad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#8B6CFF" />
            <stop offset="85%" stopColor="#2DD4F5" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <g transform="translate(40, 40)" stroke="url(#k1-grad)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" />
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(60)" />
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(120)" />
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(180)" />
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(240)" />
          <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(300)" />
        </g>
        <circle cx="40" cy="40" r="3.5" fill="#FFFFFF" />
      </svg>

      <div class="nav-preview">
        <svg width="40" height="40" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="k1-nav" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B6CFF" />
              <stop offset="100%" stopColor="#2DD4F5" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <g transform="translate(40, 40)" stroke="url(#k1-nav)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" />
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(60)" />
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(120)" />
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(180)" />
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(240)" />
            <path d="M 0 -13 C 13 -13 22 -4 22 8 C 22 17 13 23 4 23 L -8 23" transform="rotate(300)" />
          </g>
          <circle cx="40" cy="40" r="4" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI + ATS</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 2: THE CONVERGENT CHEVRONS (AMD + Anthropic inspired) -->
    <div class="card">
      <h3 style="margin: 0; font-size: 17px;">Option 2: Convergent Chevrons (AMD / Anthropic Style)</h3>
      <p style="margin: 0; color: #2DD4F5; font-size: 12px;">Two sharp isometric chevrons bridging a diagonal gap</p>
      
      <!-- 80px SVG -->
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="k2-v" x1="15" y1="15" x2="45" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C5CFF" />
          </linearGradient>
          <linearGradient id="k2-c" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <!-- Top-Left Chevron -->
        <polygon points="18,38 40,16 52,28 36,44 48,56 38,66" fill="url(#k2-v)" />
        <!-- Bottom-Right Chevron -->
        <polygon points="62,42 40,64 28,52 44,36 32,24 42,14" fill="url(#k2-c)" />
        <!-- Bridge Spark -->
        <polygon points="40,34 46,40 40,46 34,40" fill="#FFFFFF" />
      </svg>

      <div class="nav-preview">
        <svg width="40" height="40" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="k2-nv-v" x1="15" y1="15" x2="45" y2="45" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
            <linearGradient id="k2-nv-c" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <polygon points="18,38 40,16 52,28 36,44 48,56 38,66" fill="url(#k2-nv-v)" />
          <polygon points="62,42 40,64 28,52 44,36 32,24 42,14" fill="url(#k2-nv-c)" />
          <polygon points="40,34 46,40 40,46 34,40" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI + ATS</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 3: THE NVIDIA-STYLE CYBER APERTURE -->
    <div class="card">
      <h3 style="margin: 0; font-size: 17px;">Option 3: Cyber Aperture (NVIDIA Style)</h3>
      <p style="margin: 0; color: #38BDF8; font-size: 12px;">Concentric spiral contours forming an illuminated aperture</p>
      
      <!-- 80px SVG -->
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="k3-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B6CFF" />
            <stop offset="50%" stopColor="#2DD4F5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <!-- Concentric NVIDIA-style contours -->
        <path d="M 40 18 A 22 22 0 0 1 62 40 A 22 22 0 0 1 40 62" stroke="#8B6CFF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 40 25 A 15 15 0 0 1 55 40 A 15 15 0 0 1 40 55" stroke="#2DD4F5" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 40 32 A 8 8 0 0 1 48 40 A 8 8 0 0 1 40 48" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <!-- Stepped bridging line across the gap -->
        <line x1="20" y1="40" x2="35" y2="40" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" />
      </svg>

      <div class="nav-preview">
        <svg width="40" height="40" viewBox="0 0 80 80">
          <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <path d="M 40 18 A 22 22 0 0 1 62 40 A 22 22 0 0 1 40 62" stroke="#8B6CFF" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 40 25 A 15 15 0 0 1 55 40 A 15 15 0 0 1 40 55" stroke="#2DD4F5" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 40 32 A 8 8 0 0 1 48 40 A 8 8 0 0 1 40 48" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
          <line x1="20" y1="40" x2="35" y2="40" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI + ATS</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 4: THE ISOMETRIC PENROSE HEXAGON (Pure Silicon Architecture) -->
    <div class="card">
      <h3 style="margin: 0; font-size: 17px;">Option 4: Penrose Hexagon (Silicon Architecture)</h3>
      <p style="margin: 0; color: #C084FC; font-size: 12px;">Impossible 3D geometric prism bridging the void</p>
      
      <!-- 80px SVG -->
      <svg width="80" height="80" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="k4-top" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#8B6CFF" />
          </linearGradient>
          <linearGradient id="k4-right" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="k4-left" x1="80" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C3BCF" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <!-- Top Beam -->
        <polygon points="16,28 40,14 64,28 54,34 40,26 26,34" fill="url(#k4-top)" />
        <!-- Right Beam -->
        <polygon points="64,28 64,52 54,46 54,34 40,26 50,20" fill="url(#k4-right)" />
        <!-- Left Beam -->
        <polygon points="16,28 16,52 26,46 26,34 40,26 30,20" fill="url(#k4-left)" />
        <!-- Bottom Beam -->
        <polygon points="16,52 40,66 64,52 54,46 40,54 26,46" fill="url(#k4-right)" opacity="0.9" />
        <!-- Center Quantum Spark -->
        <polygon points="40,36 46,40 40,44 34,40" fill="#FFFFFF" />
      </svg>

      <div class="nav-preview">
        <svg width="40" height="40" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="k4-nav-top" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#8B6CFF" />
            </linearGradient>
            <linearGradient id="k4-nav-right" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="k4-nav-left" x1="80" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4C3BCF" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="76" height="76" rx="20" fill="#11111C" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <polygon points="16,28 40,14 64,28 54,34 40,26 26,34" fill="url(#k4-nav-top)" />
          <polygon points="64,28 64,52 54,46 54,34 40,26 50,20" fill="url(#k4-nav-right)" />
          <polygon points="16,28 16,52 26,46 26,34 40,26 30,20" fill="url(#k4-nav-left)" />
          <polygon points="16,52 40,66 64,52 54,46 40,54 26,46" fill="url(#k4-nav-right)" opacity="0.9" />
          <polygon points="40,36 46,40 40,44 34,40" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI + ATS</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  fs.writeFileSync('scripts/geometric-bench-luminous.html', html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 980, height: 950 });
  await page.goto('file://' + path.resolve('scripts/geometric-bench-luminous.html'));
  
  const artifactPath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/logo_geometric_luminous.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved luminous geometric bench screenshot to:', artifactPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
