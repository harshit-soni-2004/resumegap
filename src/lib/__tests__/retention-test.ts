import assert from 'assert';
import { calculateCohortRetention } from '../analytics-store';
import { AnalyticsEvent } from '../types';

function runRetentionUnitTest() {
  console.log('=== Running Unit Test: Cohort Retention Calculation ===\n');

  const now = new Date('2026-11-20T12:00:00.000Z');

  // Synthetic Test Dataset:
  // Session 1: Joined 3 days ago (Nov 17), revisited yesterday (Nov 19) -> Retained!
  // Session 2: Joined 2 days ago (Nov 18), had 3 events all on Nov 18 -> Did NOT return
  // Session 3: Joined today (Nov 20, 2 hours ago) -> Ineligible for 1-day cohort (too new)
  // Session 4: Joined 9 days ago (Nov 11), revisited 2 days ago (Nov 18) -> Retained in 7-day cohort!
  // Session 5: Joined 8 days ago (Nov 12), no return activity -> Did NOT return in 7-day cohort

  const fakeEvents: AnalyticsEvent[] = [
    // Session 1 (Joined Nov 17, returned Nov 19)
    {
      sessionId: 'sess_1_returned',
      eventName: 'page_view',
      timestamp: '2026-11-17T10:00:00.000Z',
    },
    {
      sessionId: 'sess_1_returned',
      eventName: 'analysis_completed',
      timestamp: '2026-11-17T10:05:00.000Z',
    },
    {
      sessionId: 'sess_1_returned',
      eventName: 'returning_visit',
      timestamp: '2026-11-19T14:00:00.000Z',
    },

    // Session 2 (Joined Nov 18, never returned)
    {
      sessionId: 'sess_2_one_day_only',
      eventName: 'page_view',
      timestamp: '2026-11-18T09:00:00.000Z',
    },
    {
      sessionId: 'sess_2_one_day_only',
      eventName: 'resume_uploaded',
      timestamp: '2026-11-18T09:02:00.000Z',
    },
    {
      sessionId: 'sess_2_one_day_only',
      eventName: 'analysis_completed',
      timestamp: '2026-11-18T09:04:00.000Z',
    },

    // Session 3 (Joined Nov 20 - today, within 24h)
    {
      sessionId: 'sess_3_joined_today',
      eventName: 'page_view',
      timestamp: '2026-11-20T10:00:00.000Z',
    },

    // Session 4 (Joined Nov 11, returned Nov 18)
    {
      sessionId: 'sess_4_veteran_returned',
      eventName: 'page_view',
      timestamp: '2026-11-11T08:00:00.000Z',
    },
    {
      sessionId: 'sess_4_veteran_returned',
      eventName: 'page_view',
      timestamp: '2026-11-18T11:00:00.000Z',
    },

    // Session 5 (Joined Nov 12, never returned)
    {
      sessionId: 'sess_5_veteran_churned',
      eventName: 'page_view',
      timestamp: '2026-11-12T15:00:00.000Z',
    },
  ];

  // Test 1-Day Cohort Retention
  console.log('Testing 1-Day Cohort Retention...');
  const res1Day = calculateCohortRetention(fakeEvents, 1, now);
  console.log('  1-Day Result:', res1Day);

  // Eligible in 1-day cohort: sess_1, sess_2, sess_4, sess_5 (4 sessions)
  // sess_3 is excluded because it joined today (< 24h)
  // Returned: sess_1 (Nov 17 -> Nov 19) and sess_4 (Nov 11 -> Nov 18) = 2 sessions
  // Expected return rate: 2 / 4 = 50%
  assert.strictEqual(res1Day.cohortSize, 4, `Expected 4 sessions in 1-day cohort, got ${res1Day.cohortSize}`);
  assert.strictEqual(res1Day.returnedCount, 2, `Expected 2 returned sessions, got ${res1Day.returnedCount}`);
  assert.strictEqual(res1Day.returnRate, 50, `Expected 50% return rate, got ${res1Day.returnRate}%`);
  console.log('  ✓ 1-Day Cohort Retention correctly computed 50% (NOT 100% tautology!)\n');

  // Test 7-Day Cohort Retention
  console.log('Testing 7-Day Cohort Retention...');
  const res7Day = calculateCohortRetention(fakeEvents, 7, now);
  console.log('  7-Day Result:', res7Day);

  // Eligible in 7-day cohort: sess_4 (Nov 11) and sess_5 (Nov 12) = 2 sessions (joined >= 7d ago)
  // Returned: sess_4 (revisited Nov 18) = 1 session
  // Expected return rate: 1 / 2 = 50%
  assert.strictEqual(res7Day.cohortSize, 2, `Expected 2 sessions in 7-day cohort, got ${res7Day.cohortSize}`);
  assert.strictEqual(res7Day.returnedCount, 1, `Expected 1 returned session, got ${res7Day.returnedCount}`);
  assert.strictEqual(res7Day.returnRate, 50, `Expected 50% return rate, got ${res7Day.returnRate}%`);
  console.log('  ✓ 7-Day Cohort Retention correctly computed 50% (NOT 100%!)\n');

  // Test with all-churned cohort (proving 0% works)
  console.log('Testing 0% retention scenario...');
  const churnedEvents: AnalyticsEvent[] = [
    { sessionId: 'user_a', eventName: 'page_view', timestamp: '2026-11-10T10:00:00.000Z' },
    { sessionId: 'user_b', eventName: 'page_view', timestamp: '2026-11-10T11:00:00.000Z' },
  ];
  const resChurned = calculateCohortRetention(churnedEvents, 1, now);
  assert.strictEqual(resChurned.returnRate, 0, `Expected 0% return rate, got ${resChurned.returnRate}%`);
  console.log('  ✓ Churned cohort correctly computed 0%\n');

  console.log('======================================================');
  console.log('🎉 ALL RETENTION COHORT UNIT TESTS PASSED!');
  console.log('======================================================\n');
}

runRetentionUnitTest();
