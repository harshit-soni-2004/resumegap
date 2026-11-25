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
    max-width: 960px;
    width: 100%;
  }
  .card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px 20px;
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
    background: rgba(17, 17, 28, 0.75);
    backdrop-filter: blur(20px);
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
  .wordmark-title span {
    color: #2DD4F5;
  }
  .copilot-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 6px;
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
    <h2 style="font-size: 24px; margin: 0 0 6px 0;">Next-Gen Geometric Brandmarks for ResumeGap</h2>
    <p style="color: #8A8AA3; margin: 0; font-size: 14px;">High-mass mathematical shapes inspired by ChatGPT, Anthropic, AMD, and NVIDIA</p>
  </div>

  <div class="grid">
    <!-- CONCEPT 1: The Hex-Knot (ChatGPT Style) -->
    <div class="card">
      <h3>1. The Hex-Knot</h3>
      <p style="color: #8B6CFF;">ChatGPT / Mobius Rosette</p>
      
      <!-- Big Icon -->
      <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
        <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
          <defs>
            <linearGradient id="c1-grad" x1="0" y1="0" x2="76" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="45%" stopColor="#8B6CFF" />
              <stop offset="85%" stopColor="#2DD4F5" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="c1-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#c1-glow)" stroke="url(#c1-grad)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
            <!-- 6 interlocking curved petal segments forming the continuous mathematical rosette -->
            <!-- 0 deg -->
            <path d="M 38 12 C 48 12 56 20 56 30 C 56 38 48 44 40 44 L 28 44" />
            <!-- 60 deg -->
            <path d="M 57 23 C 62 31 62 42 56 49 C 50 56 40 56 34 50 L 28 39" />
            <!-- 120 deg -->
            <path d="M 57 53 C 52 61 42 65 33 63 C 24 60 20 50 22 42 L 28 30" />
            <!-- 180 deg -->
            <path d="M 38 64 C 28 64 20 56 20 46 C 20 38 28 32 36 32 L 48 32" />
            <!-- 240 deg -->
            <path d="M 19 53 C 14 45 14 34 20 27 C 26 20 36 20 42 26 L 48 37" />
            <!-- 300 deg -->
            <path d="M 19 23 C 24 15 34 11 43 13 C 52 16 56 26 54 34 L 48 46" />
          </g>
          <circle cx="38" cy="38" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      <p>Six interlocking continuous loops rotating at 60° increments with a focal AI core.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 76 76" fill="none">
          <use href="#c1-grad" />
          <g stroke="url(#c1-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 38 12 C 48 12 56 20 56 30 C 56 38 48 44 40 44 L 28 44" />
            <path d="M 57 23 C 62 31 62 42 56 49 C 50 56 40 56 34 50 L 28 39" />
            <path d="M 57 53 C 52 61 42 65 33 63 C 24 60 20 50 22 42 L 28 30" />
            <path d="M 38 64 C 28 64 20 56 20 46 C 20 38 28 32 36 32 L 48 32" />
            <path d="M 19 53 C 14 45 14 34 20 27 C 26 20 36 20 42 26 L 48 37" />
            <path d="M 19 23 C 24 15 34 11 43 13 C 52 16 56 26 54 34 L 48 46" />
          </g>
          <circle cx="38" cy="38" r="4.5" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 2: Convergent Chevrons (AMD + Anthropic Style) -->
    <div class="card">
      <h3>2. Convergent Chevrons</h3>
      <p style="color: #2DD4F5;">AMD / Anthropic Architectural</p>
      
      <!-- Big Icon -->
      <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
        <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
          <defs>
            <linearGradient id="c2-v" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
            <linearGradient id="c2-c" x1="76" y1="76" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="c2-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#c2-glow)">
            <!-- Top-Left Chevron (Resume / Skills) -->
            <path d="M 14 34 L 38 10 L 48 20 L 32 36 L 44 48 L 34 58 Z" fill="url(#c2-v)" />
            <!-- Bottom-Right Chevron (Job / Opportunity) -->
            <path d="M 62 42 L 38 66 L 28 56 L 44 40 L 32 28 L 42 18 Z" fill="url(#c2-c)" />
            <!-- The Gap-Bridging Core Diamond -->
            <polygon points="38,32 44,38 38,44 32,38" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <p>Two monolithic interlocking chevrons meeting across a diagonal gap with silicon-sharp precision.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 76 76" fill="none">
          <g>
            <path d="M 14 34 L 38 10 L 48 20 L 32 36 L 44 48 L 34 58 Z" fill="url(#c2-v)" />
            <path d="M 62 42 L 38 66 L 28 56 L 44 40 L 32 28 L 42 18 Z" fill="url(#c2-c)" />
            <polygon points="38,32 44,38 38,44 32,38" fill="#FFFFFF" />
          </g>
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- CONCEPT 3: The Isometric Penrose Prism (NVIDIA + Anthropic Style) -->
    <div class="card">
      <h3>3. The Penrose Prism</h3>
      <p style="color: #38BDF8;">NVIDIA / Geometric Illusion</p>
      
      <!-- Big Icon -->
      <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
        <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
          <defs>
            <linearGradient id="c3-top" x1="0" y1="0" x2="76" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#8B6CFF" />
            </linearGradient>
            <linearGradient id="c3-right" x1="0" y1="0" x2="76" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4F5" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="c3-left" x1="76" y1="0" x2="0" y2="76" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4C3BCF" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <filter id="c3-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#c3-glow)">
            <!-- Impossible Penrose Tribar Hexagon -->
            <!-- Top Bar -->
            <polygon points="38,8 64,23 54,29 38,20 22,29 12,23" fill="url(#c3-top)" />
            <!-- Right Bar -->
            <polygon points="64,23 64,53 54,47 54,29 38,20 48,14" fill="url(#c3-right)" />
            <!-- Bottom-Right Connector -->
            <polygon points="64,53 38,68 38,56 54,47" fill="url(#c3-right)" opacity="0.9" />
            <!-- Bottom-Left Bar -->
            <polygon points="38,68 12,53 22,47 38,56" fill="url(#c3-left)" />
            <!-- Left Bar -->
            <polygon points="12,53 12,23 22,29 22,47" fill="url(#c3-left)" opacity="0.95" />
            <!-- Central Gap Aperture with Floating Hex Core -->
            <polygon points="38,30 46,35 46,45 38,50 30,45 30,35" fill="none" stroke="#2DD4F5" strokeWidth="3" />
            <circle cx="38" cy="40" r="4" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <p>Continuous isometric Penrose tribar with an illuminated quantum core bridging the central void.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 76 76" fill="none">
          <g>
            <polygon points="38,8 64,23 54,29 38,20 22,29 12,23" fill="url(#c3-top)" />
            <polygon points="64,23 64,53 54,47 54,29 38,20 48,14" fill="url(#c3-right)" />
            <polygon points="64,53 38,68 38,56 54,47" fill="url(#c3-right)" opacity="0.9" />
            <polygon points="38,68 12,53 22,47 38,56" fill="url(#c3-left)" />
            <polygon points="12,53 12,23 22,29 22,47" fill="url(#c3-left)" opacity="0.95" />
            <polygon points="38,30 46,35 46,45 38,50 30,45 30,35" fill="none" stroke="#2DD4F5" strokeWidth="2.5" />
            <circle cx="38" cy="40" r="3.5" fill="#FFFFFF" />
          </g>
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CONCEPT 4: The Mobius Nexus Hexagon (Pure Interlocking Ribbon) -->
  <div style="max-width: 960px; width: 100%;">
    <div class="card" style="flex-direction: row; justify-content: space-between; padding: 20px 32px; text-align: left;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
          <defs>
            <linearGradient id="c4-grad1" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B6CFF" />
              <stop offset="100%" stopColor="#4C3BCF" />
            </linearGradient>
            <linearGradient id="c4-grad2" x1="68" y1="0" x2="0" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#2DD4F5" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="c4-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#c4-glow)">
            <!-- Ribbon Loop 1 (Violet) -->
            <path d="M 34 10 L 54 22 L 54 46 L 34 58 L 34 46 L 44 40 L 44 28 L 34 22 Z" fill="url(#c4-grad1)" />
            <!-- Ribbon Loop 2 (Cyan, Interlocking Through the Center Void) -->
            <path d="M 34 10 L 14 22 L 14 46 L 34 58 L 34 46 L 24 40 L 24 28 L 34 22 Z" fill="url(#c4-grad2)" opacity="0.9" />
            <!-- Central Bridging Diamond -->
            <polygon points="34,22 40,28 34,34 28,28" fill="#FFFFFF" />
            <polygon points="34,34 40,40 34,46 28,40" fill="#2DD4F5" />
          </g>
        </svg>
        <div>
          <h3 style="margin: 0; font-size: 18px;">4. The Dual-Helix Hexagon (ChatGPT + AMD Interlock)</h3>
          <p style="margin: 4px 0 0 0; color: #B4B4C8; font-size: 13px;">Two bold interlocking hexagonal loops meeting in an illuminated central matrix. Solves the visual weight problem with high mass and razor-sharp contrast.</p>
        </div>
      </div>
      <div style="min-width: 280px;">
        <div class="nav-preview" style="margin: 0;">
          <svg width="36" height="36" viewBox="0 0 68 68" fill="none">
            <g>
              <path d="M 34 10 L 54 22 L 54 46 L 34 58 L 34 46 L 44 40 L 44 28 L 34 22 Z" fill="url(#c4-grad1)" />
              <path d="M 34 10 L 14 22 L 14 46 L 34 58 L 34 46 L 24 40 L 24 28 L 34 22 Z" fill="url(#c4-grad2)" opacity="0.9" />
              <polygon points="34,22 40,28 34,34 28,28" fill="#FFFFFF" />
              <polygon points="34,34 40,40 34,46 28,40" fill="#2DD4F5" />
            </g>
          </svg>
          <div>
            <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
            <div class="subtext">Engineered for Indian Grads</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  fs.writeFileSync('scripts/geometric-bench.html', html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 1100 });
  await page.goto('file://' + path.resolve('scripts/geometric-bench.html'));
  
  const artifactPath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/logo_geometric_bench.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved geometric bench screenshot to:', artifactPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
