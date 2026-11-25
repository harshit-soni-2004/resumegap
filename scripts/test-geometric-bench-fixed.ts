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
    <h2 style="font-size: 24px; margin: 0 0 6px 0;">Geometrical Logos for ResumeGap (Fixed Luminous Vectors)</h2>
    <p style="color: #8A8AA3; margin: 0; font-size: 14px;">Pure geometric primitives inspired by ChatGPT, Anthropic, AMD, and NVIDIA</p>
  </div>

  <div class="grid">
    <!-- DESIGN 1: THE CHATGPT-STYLE KNOT (Interlocking Hexagonal Rosette) -->
    <div class="card">
      <h3>1. The OpenAI/ChatGPT Rosette</h3>
      <p style="color: #8B6CFF;">Continuous Rotational Ribbon Loop</p>
      
      <!-- 72px Icon -->
      <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g-chatgpt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B6CFF" />
              <stop offset="100%" stopColor="#2DD4F5" />
            </linearGradient>
          </defs>
          <!-- 6 interlocking curved segments with distinct gradient rotations -->
          <g transform="translate(50, 50)" stroke="url(#g-chatgpt)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
            <!-- 6 loops rotated 60 deg each around center -->
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(60)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(120)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(180)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(240)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(300)" />
            <!-- Core Spark -->
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" stroke="none" />
          </g>
        </svg>
      </div>

      <p>Mathematical 6-fold rotational symmetry identical in construction to ChatGPT's knot.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
          <g transform="translate(50, 50)" stroke="url(#g-chatgpt)" strokeWidth="9" strokeLinecap="round">
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(60)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(120)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(180)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(240)" />
            <path d="M 0 -15 C 16 -15 28 -3 28 12 C 28 24 16 32 4 32 L -12 32" transform="rotate(300)" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="none" />
          </g>
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- DESIGN 2: THE ANTHROPIC + AMD CHEVRONS -->
    <div class="card">
      <h3>2. The Anthropic/AMD Chevrons</h3>
      <p style="color: #2DD4F5;">Convergent Diagonal Facets</p>
      
      <!-- 72px Icon -->
      <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g-anth-v" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
            <linearGradient id="g-anth-c" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <!-- Left Polygon (Anthropic / AMD sharp isometric facet) -->
          <polygon points="18,48 50,16 64,30 42,52 58,68 44,82" fill="url(#g-anth-v)" />
          <!-- Right Polygon (Opposing Chevron crossing the Gap) -->
          <polygon points="82,52 50,84 36,70 58,48 42,32 56,18" fill="url(#g-anth-c)" />
          <!-- The Bridge Core -->
          <polygon points="50,42 58,50 50,58 42,50" fill="#FFFFFF" />
        </svg>
      </div>

      <p>Two monolithic interlocking polygonal chevrons bridging a diagonal gap with silicon precision.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
          <polygon points="18,48 50,16 64,30 42,52 58,68 44,82" fill="url(#g-anth-v)" />
          <polygon points="82,52 50,84 36,70 58,48 42,32 56,18" fill="url(#g-anth-c)" />
          <polygon points="50,42 58,50 50,58 42,50" fill="#FFFFFF" />
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>

    <!-- DESIGN 3: THE NVIDIA / ANTHROPIC APERTURE (Hexagonal Swirl) -->
    <div class="card">
      <h3>3. The NVIDIA/Anthropic Vortex</h3>
      <p style="color: #38BDF8;">Logarithmic Hex Swirl</p>
      
      <!-- 72px Icon -->
      <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g-nv-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B6CFF" />
              <stop offset="100%" stopColor="#4C3BCF" />
            </linearGradient>
            <linearGradient id="g-nv-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2DD4F5" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="g-nv-3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#8B6CFF" />
            </linearGradient>
          </defs>
          <g transform="translate(50, 50)">
            <!-- 3 spiraling curved claws (Nvidia claw + Anthropic geometry) -->
            <!-- Claw 1 -->
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-1)" />
            <!-- Claw 2 -->
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-2)" transform="rotate(120)" />
            <!-- Claw 3 -->
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-3)" transform="rotate(240)" />
            <!-- Focal Core -->
            <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      <p>Logarithmic spiral claws meeting at 120° angles with a bright central nexus point.</p>

      <!-- Navbar Preview -->
      <div class="nav-preview">
        <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
          <g transform="translate(50, 50)">
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-1)" />
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-2)" transform="rotate(120)" />
            <path d="M 0 -38 C 22 -38 38 -22 38 0 C 38 12 32 20 22 20 C 14 20 8 12 8 0 C 8 -12 0 -22 -12 -22 L 0 -38 Z" fill="url(#g-nv-3)" transform="rotate(240)" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          </g>
        </svg>
        <div>
          <div class="wordmark-title">Resume<span>Gap</span> <span class="copilot-badge">AI</span></div>
          <div class="subtext">Engineered for Indian Grads</div>
        </div>
      </div>
    </div>
  </div>

  <!-- DESIGN 4: THE PENROSE HEXAGON (Pure 3D Isometric Geometric Loop) -->
  <div style="max-width: 960px; width: 100%;">
    <div class="card" style="flex-direction: row; justify-content: space-between; padding: 20px 32px; text-align: left;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="p-v" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
            <linearGradient id="p-c" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="p-i" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
          </defs>
          <!-- 3 Interlocking Isometric Beams forming an impossible Penrose Loop (Bridging the Void) -->
          <!-- Beam 1: Top horizontal -->
          <polygon points="18,32 50,14 82,32 68,40 50,30 32,40" fill="url(#p-v)" />
          <!-- Beam 2: Right downward diagonal -->
          <polygon points="82,32 82,68 68,60 68,40 50,30 64,22" fill="url(#p-c)" />
          <!-- Beam 3: Left upward diagonal -->
          <polygon points="18,32 18,68 32,60 32,40 50,30 36,22" fill="url(#p-i)" />
          <!-- Bottom closing facet -->
          <polygon points="18,68 50,86 82,68 68,60 50,70 32,60" fill="url(#p-c)" opacity="0.9" />
          <!-- Glowing center aperture cube -->
          <polygon points="50,42 60,48 60,60 50,66 40,60 40,48" fill="#07070F" stroke="#2DD4F5" strokeWidth="3" />
          <circle cx="50" cy="54" r="4" fill="#FFFFFF" />
        </svg>
        <div>
          <h3 style="margin: 0; font-size: 18px;">4. The Impossible Penrose Hexagon (Silicon Architecture)</h3>
          <p style="margin: 4px 0 0 0; color: #B4B4C8; font-size: 13px;">Three continuous isometric prism beams looped in 3D perspective around an illuminated quantum core. Deep tech, mathematical, and immediately distinctive.</p>
        </div>
      </div>
      <div style="min-width: 280px;">
        <div class="nav-preview" style="margin: 0;">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <polygon points="18,32 50,14 82,32 68,40 50,30 32,40" fill="url(#p-v)" />
            <polygon points="82,32 82,68 68,60 68,40 50,30 64,22" fill="url(#p-c)" />
            <polygon points="18,32 18,68 32,60 32,40 50,30 36,22" fill="url(#p-i)" />
            <polygon points="18,68 50,86 82,68 68,60 50,70 32,60" fill="url(#p-c)" opacity="0.9" />
            <polygon points="50,42 60,48 60,60 50,66 40,60 40,48" fill="#07070F" stroke="#2DD4F5" strokeWidth="3.5" />
            <circle cx="50" cy="54" r="5" fill="#FFFFFF" />
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

  fs.writeFileSync('scripts/geometric-bench-fixed.html', html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 1100 });
  await page.goto('file://' + path.resolve('scripts/geometric-bench-fixed.html'));
  
  const artifactPath = path.resolve('C:/Users/ihars/.gemini/antigravity/brain/36b4d9d9-121e-4acb-ba0d-74d0918d1644/logo_geometric_bench_fixed.png');
  await page.screenshot({ path: artifactPath });
  console.log('Saved fixed geometric bench screenshot to:', artifactPath);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
