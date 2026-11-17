import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { SAMPLE_JOB_DESCRIPTION } from '../src/lib/sample-data';

const ARTIFACT_DIR = path.join(
  'C:',
  'Users',
  'ihars',
  '.gemini',
  'antigravity',
  'brain',
  '36b4d9d9-121e-4acb-ba0d-74d0918d1644'
);

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runMobileTest() {
  console.log('=== Starting Mobile 390px E2E Test & Strict Layout Assertions ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  try {
    // 1. Open Landing Page
    console.log('[1/6] Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // ASSERTION: No horizontal overflow on landing page
    const landingScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[Check] Landing page document.scrollWidth = ${landingScrollWidth}px (Target <= 390px)`);
    assert(
      landingScrollWidth <= 390,
      `Horizontal overflow on landing: scrollWidth is ${landingScrollWidth}px > 390px`
    );
    console.log('  ✓ Assertion PASSED: No horizontal overflow on landing page (<= 390px)');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_01_landing_390px.png'),
    });
    console.log('✓ Captured mobile_01_landing_390px.png');

    // 2. Upload Sample PDF and fill JD
    console.log('[2/6] Uploading sample PDF from public/samples/sample_sde_resume.pdf...');
    const pdfPath = path.resolve(process.cwd(), 'public', 'samples', 'sample_sde_resume.pdf');
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.uploadFile(pdfPath);

    // Paste Job Description
    const jdTextarea = await page.$('textarea');
    if (!jdTextarea) throw new Error('JD textarea not found');
    await jdTextarea.type(SAMPLE_JOB_DESCRIPTION.slice(0, 500));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_02_pdf_uploaded_390px.png'),
    });
    console.log('✓ Captured mobile_02_pdf_uploaded_390px.png');

    // 3. Click Analyze
    console.log('[3/6] Clicking Analyze and waiting for results...');
    const analyzeButton = await page.$('button[type="submit"]');
    if (!analyzeButton) throw new Error('Analyze button not found');
    await analyzeButton.click();

    // Wait for ScoreGauge / Results to appear (waiting specifically for data-testid="score-gauge")
    console.log('Waiting for [data-testid="score-gauge"] to appear...');
    await page.waitForSelector('[data-testid="score-gauge"]', { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500)); // allow radial gauge transition

    // ASSERTION: Score gauge is rendered and visible
    const scoreGaugeStatus = await page.evaluate(() => {
      const gauge = document.querySelector('[data-testid="score-gauge"]');
      const scoreEl = document.querySelector('[data-testid="score-value"]');
      const circles = Array.from(document.querySelectorAll('svg circle'));
      
      const visibleCircles = circles.filter((c) => {
        const rect = c.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      return {
        visible: Boolean(gauge) && visibleCircles.length > 0 && Boolean(scoreEl),
        circleCount: circles.length,
        visibleCircleCount: visibleCircles.length,
        scoreText: scoreEl ? (scoreEl as HTMLElement).innerText : null,
      };
    });
    console.log('[Check] Score Gauge visibility status:', scoreGaugeStatus);
    assert(
      scoreGaugeStatus.visible,
      `Score gauge is not visible or has zero dimension: ${JSON.stringify(scoreGaugeStatus)}`
    );
    console.log(`  ✓ Assertion PASSED: Score gauge is rendered and visible (Score: ${scoreGaugeStatus.scoreText})`);

    // ASSERTION: No horizontal overflow on results page
    const resultsScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[Check] Results page document.scrollWidth = ${resultsScrollWidth}px (Target <= 390px)`);
    assert(
      resultsScrollWidth <= 390,
      `Horizontal overflow on results page: scrollWidth is ${resultsScrollWidth}px > 390px`
    );
    console.log('  ✓ Assertion PASSED: No horizontal overflow on results page (<= 390px)');

    // ASSERTION: Check all visible buttons have height >= 44px for touch targets
    const buttonAudit = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter((b) => {
          const rect = b.getBoundingClientRect();
          const style = window.getComputedStyle(b);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            rect.width > 0 &&
            rect.height > 0
          );
        })
        .map((b) => ({
          label: (b.innerText || b.getAttribute('title') || b.getAttribute('aria-label') || 'Button').slice(0, 35).trim(),
          height: Math.round(b.getBoundingClientRect().height),
          width: Math.round(b.getBoundingClientRect().width),
        }));
    });

    const smallButtons = buttonAudit.filter((b) => b.height < 44);
    console.log(`[Check] Evaluated ${buttonAudit.length} visible buttons on results page for 44px touch target height.`);
    if (smallButtons.length > 0) {
      console.warn('Buttons under 44px found:', smallButtons);
    }
    assert(
      smallButtons.length === 0,
      `Failed touch target assertion: ${smallButtons.length} button(s) under 44px: ${JSON.stringify(smallButtons)}`
    );
    console.log(`  ✓ Assertion PASSED: All ${buttonAudit.length} buttons are at least 44px tall`);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_03_results_gauge_390px.png'),
    });
    console.log('✓ Captured mobile_03_results_gauge_390px.png');

    // 4. Accept / Reject Bullets
    console.log('[4/6] Interacting with Bullet Diff Cards (Accept #1, Reject #2)...');
    
    // Find Accept buttons
    const acceptButtons = await page.$$('button');
    for (const btn of acceptButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Accept') && !text.includes('Accepted')) {
        await btn.click();
        console.log('✓ Clicked Accept on Bullet');
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 500));

    // Find Reject buttons
    const rejectButtons = await page.$$('button');
    for (const btn of rejectButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Reject')) {
        await btn.click();
        console.log('✓ Clicked Reject on Bullet');
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 800));

    // Scroll to bullets section
    await page.evaluate(() => {
      window.scrollBy({ top: 600, behavior: 'instant' });
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_04_bullet_decisions_390px.png'),
    });
    console.log('✓ Captured mobile_04_bullet_decisions_390px.png');

    // 5. Submit 1-Click Feedback
    console.log('[5/6] Submitting 1-Click Feedback...');
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 600));

    // Click "Yes, helpful!"
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Yes, helpful!')) {
        await btn.click();
        console.log('✓ Clicked "Yes, helpful!" button');
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 800));

    // Type optional comment
    const commentInput = await page.$('input[placeholder*="improve"]');
    if (commentInput) {
      await commentInput.type('Mobile layout is verified with zero horizontal overflow!');
      await page.evaluate(() => {
        const btn = document.querySelector('button svg.lucide-send')?.closest('button');
        if (btn) (btn as HTMLButtonElement).click();
      });
    }

    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_05_feedback_submitted_390px.png'),
    });
    console.log('✓ Captured mobile_05_feedback_submitted_390px.png');

    // 6. Admin Page at 390px
    console.log('[6/6] Testing /admin page at 390px...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });

    // Check no horizontal overflow on /admin
    const adminScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`[Check] Admin page document.scrollWidth = ${adminScrollWidth}px (Target <= 390px)`);
    assert(
      adminScrollWidth <= 390,
      `Horizontal overflow on admin page: scrollWidth is ${adminScrollWidth}px > 390px`
    );
    console.log('  ✓ Assertion PASSED: No horizontal overflow on /admin (<= 390px)');

    // Enter Admin Key
    const keyInput = await page.$('input[placeholder="Admin Secret Key"]');
    if (keyInput) {
      await keyInput.type('resumegap-secret-pm');
      const syncBtn = await page.$('button[type="submit"]');
      if (syncBtn) await syncBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_06_admin_dashboard_390px.png'),
    });
    console.log('✓ Captured mobile_06_admin_dashboard_390px.png');

    console.log('\n======================================================');
    console.log('🎯 ALL MOBILE 390PX ASSERTIONS & SCREENSHOTS PASSED!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

runMobileTest().catch((err) => {
  console.error('Mobile test failed:', err);
  process.exit(1);
});
