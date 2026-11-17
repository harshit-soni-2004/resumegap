import fs from 'fs';
import path from 'path';
import { SAMPLE_JOB_DESCRIPTION } from '../sample-data';

async function runE2ETest() {
  console.log('=== Running ResumeGap Production Hardening End-to-End Verification ===\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Verify Landing Page & Health Check
  console.log('[Step 1] Verifying Landing Page (GET /) & Health Check (GET /api/health)...');
  const homeRes = await fetch(`${BASE_URL}/`);
  if (!homeRes.ok) throw new Error(`Landing page returned status ${homeRes.status}`);
  const homeHtml = await homeRes.text();
  if (!homeHtml.includes('ResumeGap') && !homeHtml.includes('ATS')) {
    throw new Error('Landing page missing key branding or title');
  }
  console.log('✓ Landing page responded with HTTP 200.');

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) throw new Error(`Health check returned status ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log(`✓ Health check responded with HTTP 200 (Status: ${healthData.status})`);
  console.log(`  - Gemini configured: ${healthData.services.gemini.configured}, reachable: ${healthData.services.gemini.reachable}`);
  console.log(`  - Supabase configured: ${healthData.services.supabase.configured}, reachable: ${healthData.services.supabase.reachable}`);
  console.log(`  - Upstash configured: ${healthData.services.upstash.configured}, reachable: ${healthData.services.upstash.reachable}`);

  // 2. Test Real PDF Upload via FormData
  console.log('\n[Step 2] Testing Multipart Form-Data PDF Upload (POST /api/analyze)...');
  const pdfPath = path.join(process.cwd(), 'public', 'samples', 'sample_sde_resume.pdf');
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Sample PDF not found at ${pdfPath}`);
  }
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('resume', pdfBlob, 'sample_sde_resume.pdf');
  formData.append('jobDescription', SAMPLE_JOB_DESCRIPTION);
  const testSessionId = `test_session_${Date.now()}`;
  formData.append('sessionId', testSessionId);

  const analyzeStartTime = Date.now();
  const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!analyzeRes.ok) {
    const errText = await analyzeRes.text();
    throw new Error(`Analyze API failed (${analyzeRes.status}): ${errText}`);
  }

  const analysis = await analyzeRes.json();
  const totalClientLatency = Date.now() - analyzeStartTime;

  console.log(`✓ Analyze API succeeded in ${totalClientLatency}ms:`);
  console.log(`  - Overall ATS Score: ${analysis.score.overallScore}/100`);
  console.log(`  - Total Latency: ${analysis.metadata.latencyMs}ms`);
  console.log(`  - Gemini AI Latency: ${analysis.metadata.geminiLatencyMs ?? 0}ms`);
  console.log(`  - isLLMFallback: ${analysis.metadata.isLLMFallback}`);
  console.log(`  - Model Used: ${analysis.metadata.modelUsed}`);
  console.log(`  - Missing Keywords: ${analysis.missingKeywords.length}`);
  console.log(`  - Rewritten Bullets: ${analysis.bulletSuggestions.length}`);

  if (typeof analysis.metadata.latencyMs !== 'number') {
    throw new Error('Missing metadata.latencyMs');
  }
  if (typeof analysis.metadata.geminiLatencyMs !== 'number') {
    throw new Error('Missing metadata.geminiLatencyMs');
  }

  // 3. Test Analytics Event Tracking
  console.log('\n[Step 3] Testing Analytics Logging (POST /api/analytics)...');
  const acceptRes = await fetch(`${BASE_URL}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: testSessionId,
      eventName: 'bullet_accepted',
      data: { bulletId: analysis.bulletSuggestions[0]?.id },
    }),
  });
  if (!acceptRes.ok) throw new Error('Failed to log bullet_accepted');

  const rejectRes = await fetch(`${BASE_URL}/api/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: testSessionId,
      eventName: 'bullet_rejected',
      data: { bulletId: analysis.bulletSuggestions[1]?.id },
    }),
  });
  if (!rejectRes.ok) throw new Error('Failed to log bullet_rejected');
  console.log('✓ Successfully recorded bullet_accepted and bullet_rejected events.');

  // 4. Test 1-Click User Feedback
  console.log('\n[Step 4] Testing 1-Click Feedback (POST /api/feedback)...');
  const feedbackRes = await fetch(`${BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: testSessionId,
      helpful: true,
      comment: 'The transparent score breakdown and XYZ rewrites gave me immediate clarity!',
      score: analysis.score.overallScore,
    }),
  });
  if (!feedbackRes.ok) throw new Error('Failed to submit feedback');
  console.log('✓ Successfully submitted 1-click feedback.');

  // 5. Test Admin Protected Stats & 503 Security Check
  console.log('\n[Step 5] Testing Admin Stats Security (GET /api/admin/stats)...');
  
  // Test wrong key
  const unauthRes = await fetch(`${BASE_URL}/api/admin/stats?key=wrong-key`);
  if (unauthRes.status !== 401 && unauthRes.status !== 503) {
    throw new Error(`Expected 401 or 503, got ${unauthRes.status}`);
  }
  console.log(`✓ Unauthorized request rejected with HTTP ${unauthRes.status}.`);

  // Test authorized
  const adminKey = process.env.ADMIN_SECRET_KEY || 'resumegap-secret-pm';
  const authRes = await fetch(`${BASE_URL}/api/admin/stats?key=${encodeURIComponent(adminKey)}`);
  
  if (authRes.status === 503) {
    console.log('✓ Verified 503 Service Unavailable when ADMIN_SECRET_KEY is unconfigured.');
  } else if (authRes.ok) {
    const stats = await authRes.json();
    console.log('✓ Admin stats successfully retrieved:');
    console.log(`  - North Star (Bullet Acceptance Rate): ${stats.bulletAcceptanceRate}%`);
    console.log(`  - Total Resumes Analyzed: ${stats.totalAnalyses}`);
    console.log(`  - Average Pipeline Latency: ${stats.avgLatencyMs}ms`);
    console.log(`  - Average Gemini AI Latency: ${stats.avgGeminiLatencyMs}ms`);
    console.log(`  - Gemini Fallback Count: ${stats.geminiFallbackCount}`);
    console.log(`  - Feedback Positive Rate: ${stats.feedbackPositiveRate}%`);
  } else {
    throw new Error(`Admin stats returned unexpected status ${authRes.status}`);
  }

  // 6. Test Admin Page Render
  console.log('\n[Step 6] Testing Admin Page Render (GET /admin)...');
  const adminPageRes = await fetch(`${BASE_URL}/admin`);
  if (!adminPageRes.ok) throw new Error(`Admin page returned ${adminPageRes.status}`);
  console.log('✓ Admin page responded with HTTP 200.');

  console.log('\n==================================================================');
  console.log('🎯 ALL PRODUCTION HARDENING INTEGRATION CHECKS PASSED!');
  console.log('==================================================================');
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E Verification failed:', err);
  process.exit(1);
});
