import assert from 'node:assert/strict';
import { deriveXpState } from './xpEngine';
import { AnalysisHistoryItem, SessionNote, AchievementUnlock, ProgressionState } from '../types';

// now = Monday 2026-06-15 12:00 GMT+7 (05:00 UTC).
const NOW = new Date('2026-06-15T05:00:00Z');

let n = 0;
// Trade landing on a given GMT+7 calendar date (noon, safely inside the day).
function trade(gmt7Date: string, opts: Partial<AnalysisHistoryItem> = {}): AnalysisHistoryItem {
  const dateUtc = new Date(gmt7Date + 'T05:00:00Z').toISOString(); // +7h => noon that day
  return {
    id: `t${++n}`,
    symbol: 'BTCUSDT',
    side: 'Long',
    levels: { entry: 100, stopLoss: 99, takeProfit: 103 },
    timestamp: dateUtc,
    fiboTarget: '',
    confidence: 1,
    imageUrl: '',
    date: dateUtc,
    status: 'Win',
    ...opts,
  };
}

function run(label: string, fn: () => void) {
  fn();
  console.log(`  ok  ${label}`);
}

// ── 1. Empty ──
run('empty → zero xp, novice, no streak', () => {
  const s = deriveXpState({ trades: [], now: NOW });
  assert.equal(s.totalXp, 0);
  assert.equal(s.currentJob, 'novice');
  assert.equal(s.streak, 0);
  assert.equal(s.nextJob, 'apprentice');
});

// ── 2. One live trade today ──
run('1 live trade → +10 journal +50 first_step, streak 1', () => {
  const s = deriveXpState({ trades: [trade('2026-06-15')], now: NOW });
  assert.equal(s.breakdown.journal, 10);
  assert.equal(s.breakdown.achievement, 50); // first_step
  assert.equal(s.totalXp, 60);
  assert.equal(s.streak, 1);
  assert.ok(s.pendingUnlocks.includes('first_step'));
});

// ── 3. Backtest trades excluded ──
run('backtest trade gives no xp, no streak', () => {
  const s = deriveXpState({ trades: [trade('2026-06-15', { tradingMode: 'backtest' })], now: NOW });
  assert.equal(s.totalXp, 0);
  assert.equal(s.streak, 0);
});

// ── 4. Session notes +5 each ──
run('session notes grant +5, count as active days', () => {
  const notes: SessionNote[] = [
    { kind: 'pre', sessionDate: '2026-06-15', body: 'plan' },
    { kind: 'post', sessionDate: '2026-06-15', body: 'review' },
  ];
  const s = deriveXpState({ trades: [], sessionNotes: notes, now: NOW });
  assert.equal(s.breakdown.session, 10);
  assert.equal(s.streak, 1); // session-only day still counts as active
});

// ── 5. Streak milestone is SINGLE grant (not stacked) ──
run('7-day streak → ignition once, no double-count', () => {
  // active Jun 9..15 (7 contiguous days incl. weekend 13,14)
  const trades = ['09', '10', '11', '12', '13', '14', '15'].map(d => trade(`2026-06-${d}`));
  const s = deriveXpState({ trades, now: NOW });
  assert.equal(s.streak, 7);
  assert.ok(s.maxStreakEver >= 7);
  // 7*10 journal + 50 first_step + 100 ignition = 220 (NOT +200 for ignition)
  assert.equal(s.breakdown.journal, 70);
  assert.equal(s.breakdown.achievement, 150);
  assert.equal(s.totalXp, 220);
  assert.ok(s.pendingUnlocks.includes('ignition'));
});

// ── 6. Weekend optional ──
run('weekend gap does not break streak', () => {
  // Fri Jun12 + Mon Jun15, weekend 13/14 skipped
  const s = deriveXpState({ trades: [trade('2026-06-12'), trade('2026-06-15')], now: NOW });
  assert.equal(s.streak, 2);
});

// ── 7. Freeze auto-consume covers a single weekday gap ──
run('single weekday gap bridged by auto freeze', () => {
  // Thu Jun11 + Mon Jun15. Gap = Fri Jun12 (weekday). 13/14 weekend.
  const trades = [trade('2026-06-11'), trade('2026-06-15')];
  const s = deriveXpState({ trades, now: NOW });
  assert.equal(s.streak, 2);
  assert.equal(s.freezeConsumed, true);

  // freezeUsedMonth is informational only — it must NOT re-break the streak.
  const prog: ProgressionState = { currentJob: 'novice', freezeUsedMonth: '2026-06' };
  const stillBridged = deriveXpState({ trades, progression: prog, now: NOW });
  assert.equal(stillBridged.streak, 2);
});

// ── 7b. Two weekday gaps → only one bridged, streak ends at second ──
run('second weekday gap ends streak (1 freeze per walk)', () => {
  // Mon Jun15 + Fri Jun12 missing + Wed Jun10 + ... gaps Fri12 and Tue9?
  // active: Jun15(Mon), Jun11(Thu), Jun9(Tue). Gaps: Fri12 (bridged), Wed10 (breaks).
  const trades = [trade('2026-06-09'), trade('2026-06-11'), trade('2026-06-15')];
  const s = deriveXpState({ trades, now: NOW });
  assert.equal(s.streak, 2);          // Jun15 + Jun11 (Fri12 bridged); Wed10 gap breaks
  assert.equal(s.freezeConsumed, true);
});

// ── 8. Job eligibility latches; manual change ──
run('meets apprentice reqs → eligible, but job stays until changed', () => {
  const trades = Array.from({ length: 50 }, () => trade('2026-06-15'));
  const s = deriveXpState({ trades, now: NOW });
  assert.ok(s.totalXp >= 500);
  assert.equal(s.currentJob, 'novice');            // not auto-promoted
  assert.equal(s.eligibleJobChange, 'apprentice'); // next rank offered
});

run('already apprentice, scalper reqs unmet → no eligible change', () => {
  const trades = Array.from({ length: 50 }, () => trade('2026-06-15'));
  const prog: ProgressionState = { currentJob: 'apprentice', freezeUsedMonth: null };
  const s = deriveXpState({ trades, progression: prog, now: NOW });
  assert.equal(s.eligibleJobChange, null); // scalper needs 2000xp + streak14 + 50 journals
});

// ── 9. Ghost Protocol uses log time (createdAt) 02:00–04:00 GMT+7 ──
run('ghost_protocol unlocks on 02-04 GMT+7 log time', () => {
  const t = trade('2026-06-15', { createdAt: '2026-06-14T19:30:00Z' }); // +7 => 02:30 Jun15
  const s = deriveXpState({ trades: [t], now: NOW });
  assert.ok(s.pendingUnlocks.includes('ghost_protocol'));
  const hidden = s.achievements.find(a => a.code === 'ghost_protocol');
  assert.equal(hidden?.hidden, true);
});

// ── 10. Persisted unlock XP is latched (not recomputed) ──
run('persisted unlock uses stored xpGranted', () => {
  const unlocks: AchievementUnlock[] = [
    { code: 'first_step', unlockedAt: '2026-06-01T00:00:00Z', xpGranted: 50 },
  ];
  const s = deriveXpState({ trades: [trade('2026-06-15')], unlocks, now: NOW });
  assert.equal(s.breakdown.achievement, 50);
  assert.equal(s.pendingUnlocks.includes('first_step'), false); // already persisted
});

console.log('\nAll xpEngine tests passed.');
