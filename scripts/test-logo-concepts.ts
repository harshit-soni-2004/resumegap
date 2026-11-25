import puppeteer from 'puppeteer';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            background: #07070F;
            color: #F8F8FC;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: 40px;
            margin: 0;
            padding: 40px;
            box-sizing: border-box;
          }
          .row {
            display: flex;
            gap: 48px;
            align-items: center;
          }
          .card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          }
          .preview-nav {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(18, 17, 34, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 16px;
          }
          .brand-title {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .gradient-text {
            background: linear-gradient(135deg, #8B6CFF 0%, #2DD4F5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        </style>
      </head>
      <body>
        <h1 style="margin:0; font-size: 24px; font-weight: 700; color: #C4C4D6;">ResumeGap Logo Iterations</h1>
        <div class="row">
          <!-- Concept 1: Precision Monogram R with Kinetic Gap Bridge -->
          <div class="card">
            <span style="font-size: 13px; color: #9A9AB5; font-weight: 600;">1. Kinetic "R" Gap-Bridge</span>
            <div class="preview-nav">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="plinth-bg-1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#18152E"/>
                    <stop offset="100%" stop-color="#0B0A16"/>
                  </linearGradient>
                  <linearGradient id="plinth-border-1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="rgba(139, 108, 255, 0.5)"/>
                    <stop offset="50%" stop-color="rgba(255, 255, 255, 0.1)"/>
                    <stop offset="100%" stop-color="rgba(45, 212, 245, 0.4)"/>
                  </linearGradient>
                  <linearGradient id="glyph-grad-1" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#A78BFA"/>
                    <stop offset="45%" stop-color="#8B6CFF"/>
                    <stop offset="100%" stop-color="#2DD4F5"/>
                  </linearGradient>
                  <radialGradient id="halo-1" cx="20" cy="20" r="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="rgba(139, 108, 255, 0.35)"/>
                    <stop offset="60%" stop-color="rgba(45, 212, 245, 0.15)"/>
                    <stop offset="100%" stop-color="transparent"/>
                  </radialGradient>
                  <filter id="glow-1" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <!-- Plinth Container -->
                <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
                <!-- Ambient Backdrop Flare -->
                <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
                <!-- Specular Highlight Top Hairline -->
                <path d="M 10 2.25 L 30 2.25" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.75" stroke-linecap="round"/>
                
                <!-- The "R" Monogram & Gap Bridge -->
                <!-- 1. Vertical Stem (Candidate Base) -->
                <rect x="11" y="11" width="3.75" height="18" rx="1.875" fill="url(#glyph-grad-1)"/>
                <!-- 2. Upper Loop (The Match Aperture) -->
                <path d="M 13 13 H 21.5 C 24.5 13 26.5 15 26.5 17.5 C 26.5 20 24.5 22 21.5 22 H 14.75" stroke="url(#glyph-grad-1)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 3. Kinetic Gap Bridge (Forward Launch Arrow across the Gap) -->
                <path d="M 19 22 L 26.5 29" stroke="url(#glyph-grad-1)" stroke-width="3.75" stroke-linecap="round" filter="url(#glow-1)"/>
                <!-- 4. Nexus Spark -->
                <circle cx="27" cy="11.5" r="1.5" fill="#FFFFFF"/>
                <circle cx="27" cy="11.5" r="2.5" fill="#2DD4F5" opacity="0.4"/>
              </svg>
              <div class="brand-title">Resume<span class="gradient-text">Gap</span></div>
            </div>
            <!-- Large scale inspection -->
            <svg width="120" height="120" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <use href="#plinth-bg-1"/>
              <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
              <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
              <path d="M 10 2.25 L 30 2.25" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.75" stroke-linecap="round"/>
              <rect x="11" y="11" width="3.75" height="18" rx="1.875" fill="url(#glyph-grad-1)"/>
              <path d="M 13 13 H 21.5 C 24.5 13 26.5 15 26.5 17.5 C 26.5 20 24.5 22 21.5 22 H 14.75" stroke="url(#glyph-grad-1)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 19 22 L 26.5 29" stroke="url(#glyph-grad-1)" stroke-width="3.75" stroke-linecap="round" filter="url(#glow-1)"/>
              <circle cx="27" cy="11.5" r="1.5" fill="#FFFFFF"/>
              <circle cx="27" cy="11.5" r="3" fill="#2DD4F5" opacity="0.4"/>
            </svg>
          </div>

          <!-- Concept 2: The Interlocking Gap Prism (Two geometric facets bridging a diagonal gap) -->
          <div class="card">
            <span style="font-size: 13px; color: #9A9AB5; font-weight: 600;">2. Dual-Facet "Gap Prism"</span>
            <div class="preview-nav">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="facet-l" x1="10" y1="10" x2="25" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#C084FC"/>
                    <stop offset="100%" stop-color="#8B6CFF"/>
                  </linearGradient>
                  <linearGradient id="facet-r" x1="18" y1="10" x2="32" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#2DD4F5"/>
                    <stop offset="100%" stop-color="#0284C7"/>
                  </linearGradient>
                  <linearGradient id="bridge-beam" x1="12" y1="28" x2="28" y2="12" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#F472B6"/>
                    <stop offset="50%" stop-color="#8B6CFF"/>
                    <stop offset="100%" stop-color="#2DD4F5"/>
                  </linearGradient>
                </defs>
                <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
                <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
                <!-- Left Pillar (Resume) -->
                <path d="M 12 13 C 12 11.9 12.9 11 14 11 H 17 C 18.1 11 19 11.9 19 13 V 21 L 12 28 V 13 Z" fill="url(#facet-l)"/>
                <!-- Right Pillar (Job Target) -->
                <path d="M 28 27 C 28 28.1 27.1 29 26 29 H 23 C 21.9 29 21 28.1 21 27 V 19 L 28 12 V 27 Z" fill="url(#facet-r)"/>
                <!-- Laser Gap Bridge (45 degree energy conduit) -->
                <path d="M 11 29 L 29 11" stroke="url(#bridge-beam)" stroke-width="3" stroke-linecap="round"/>
                <!-- Central Diamond Flare -->
                <polygon points="20,16.5 22.5,20 20,23.5 17.5,20" fill="#FFFFFF"/>
              </svg>
              <div class="brand-title">Resume<span class="gradient-text">Gap</span></div>
            </div>
            <svg width="120" height="120" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
              <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
              <path d="M 12 13 C 12 11.9 12.9 11 14 11 H 17 C 18.1 11 19 11.9 19 13 V 21 L 12 28 V 13 Z" fill="url(#facet-l)"/>
              <path d="M 28 27 C 28 28.1 27.1 29 26 29 H 23 C 21.9 29 21 28.1 21 27 V 19 L 28 12 V 27 Z" fill="url(#facet-r)"/>
              <path d="M 11 29 L 29 11" stroke="url(#bridge-beam)" stroke-width="3" stroke-linecap="round"/>
              <polygon points="20,16.5 22.5,20 20,23.5 17.5,20" fill="#FFFFFF"/>
            </svg>
          </div>

          <!-- Concept 3: The Futuristic Geometric Nexus (Clean, Iconic, Tech-First) -->
          <div class="card">
            <span style="font-size: 13px; color: #9A9AB5; font-weight: 600;">3. Hexa-Nexus "Aperture"</span>
            <div class="preview-nav">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nexus-g" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#8B6CFF"/>
                    <stop offset="50%" stop-color="#2DD4F5"/>
                    <stop offset="100%" stop-color="#34D399"/>
                  </linearGradient>
                </defs>
                <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
                <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
                <!-- Precision Hexagonal Aperture with 2 intercrossing beams -->
                <path d="M 20 9 L 29 14.5 V 25.5 L 20 31 L 11 25.5 V 14.5 Z" stroke="url(#nexus-g)" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Internal Gap Cross -->
                <path d="M 15 17 L 25 23" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="20" cy="20" r="2.5" fill="#2DD4F5"/>
                <circle cx="20" cy="20" r="1.2" fill="#FFFFFF"/>
              </svg>
              <div class="brand-title">Resume<span class="gradient-text">Gap</span></div>
            </div>
            <svg width="120" height="120" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="10.5" fill="url(#plinth-bg-1)" stroke="url(#plinth-border-1)" stroke-width="1.5"/>
              <circle cx="20" cy="20" r="14" fill="url(#halo-1)"/>
              <path d="M 20 9 L 29 14.5 V 25.5 L 20 31 L 11 25.5 V 14.5 Z" stroke="url(#nexus-g)" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M 15 17 L 25 23" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="20" cy="20" r="2.5" fill="#2DD4F5"/>
              <circle cx="20" cy="20" r="1.2" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const artifactDir = path.join(
    'C:',
    'Users',
    'ihars',
    '.gemini',
    'antigravity',
    'brain',
    '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
  );
  await page.screenshot({ path: path.join(artifactDir, 'logo_concepts_preview.png'), fullPage: true });
  console.log('✓ Captured logo_concepts_preview.png');
  await browser.close();
}

main().catch(console.error);
