import {
  AnalysisHistoryItem,
  SessionNote,
  AchievementUnlock,
  ProgressionState,
  JobClass,
  AchievementCode,
  JobDefinition,
  AchievementDefinition,
  XpState,
} from '../types';
import { toGmt7, gmt7DayKey } from '../lib/tradeUtils';

// ─── Constants ──────────────────────────────────────────────────────────────

export const XP_PER_JOURNAL = 10;
export const XP_PER_SESSION_NOTE = 5;

// Linear scalping path (branch deferred — see types.ts JobClass).
export const JOB_ORDER: JobClass[] = ['novice', 'apprentice', 'scalper', 'elite', 'master'];

export const JOB_DEFS: Record<JobClass, JobDefinition> = {
  novice:    { id: 'novice',    xpRequired: 0,     minStreakEver: 0,  minLiveJournals: 0 },
  apprentice:{ id: 'apprentice',xpRequired: 300,   minStreakEver: 0,  minLiveJournals: 20 },
  scalper:   { id: 'scalper',   xpRequired: 1200,  minStreakEver: 14, minLiveJournals: 50 },
  elite:     { id: 'elite',     xpRequired: 4000,  minStreakEver: 30, minLiveJournals: 200 },
  master:    { id: 'master',    xpRequired: 12000, minStreakEver: 60, minLiveJournals: 500 },
};

export const ACHIEVEMENT_DEFS: Record<AchievementCode, AchievementDefinition> = {
  first_step:       { code: 'first_step',       xp: 50,   hidden: false },
  ignition:         { code: 'ignition',         xp: 100,  hidden: false },
  month_warrior:    { code: 'month_warrior',    xp: 500,  hidden: false },
  centurion:        { code: 'centurion',        xp: 2000, hidden: false },
  obsessive_logger: { code: 'obsessive_logger', xp: 300,  hidden: false },
  the_chronicler:   { code: 'the_chronicler',   xp: 1000, hidden: false },
  ghost_protocol:   { code: 'ghost_protocol',   xp: 250,  hidden: true },
  born_again:       { code: 'born_again',       xp: 500,  hidden: true },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function isLive(t: AnalysisHistoryItem): boolean {
  return (t.tradingMode || 'live') !== 'backtest';
}

// Weekend in GMT+7 wall-clock. Sun=0, Sat=6.
function isWeekendKey(dayKey: string): boolean {
  // Parse as UTC midnight — dayKey is already a GMT+7 calendar date.
  const dow = new Date(dayKey + 'T00:00:00Z').getUTCDay();
  return dow === 0 || dow === 6;
}

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const t = new Date(dayKey + 'T00:00:00Z').getTime() + deltaDays * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

// ─── Streak ─────────────────────────────────────────────────────────────────

interface StreakResult {
  streak: number;
  maxStreakEver: number;
  freezeConsumed: boolean;
  /** number of distinct historical runs (>=2 ⇒ the streak broke at least once) */
  runCount: number;
}

/**
 * Current streak, weekend-optional, with a single auto-consumed freeze.
 *
 * Rules (locked with user):
 *  - Active day = a day with ≥1 live journal OR a session note (GMT+7).
 *  - Weekday gap (Mon–Fri) with no activity breaks the streak…
 *      …unless a monthly freeze is available, which auto-covers exactly one gap.
 *  - Weekend (Sat/Sun) is optional: presence extends, absence never breaks.
 *  - Today with no activity yet is a grace day (streak survives from yesterday),
 *    and never consumes the freeze.
 *
 * The freeze is auto-applied within the current-streak walk (at most one gap is
 * ever bridged, since a second uncovered gap ends the streak). It is NOT gated
 * on persisted `freezeUsedMonth` — doing so would let marking the freeze "used"
 * re-break the very streak it saved. `freezeUsedMonth` is informational only.
 */
function computeStreak(activeDays: Set<string>, now: Date): StreakResult {
  const todayKey = gmt7DayKey(now)!;
  let freezeLeft = 1;
  let freezeConsumed = false;

  // ── Current streak: walk backward from today.
  let streak = 0;
  let cursor = todayKey;
  let first = true;
  // Stop once we pass the earliest active day (nothing left to count).
  const earliest = activeDays.size ? [...activeDays].sort()[0] : todayKey;

  while (cursor >= earliest || first) {
    if (activeDays.has(cursor)) {
      streak++;
    } else if (!isWeekendKey(cursor)) {
      // Required weekday with no activity.
      if (first) {
        // Today not logged yet — grace, no break, no freeze spent.
      } else if (freezeLeft > 0) {
        freezeLeft--;
        freezeConsumed = true;
      } else {
        break;
      }
    }
    // Weekend miss: skip silently (neither count nor break).
    first = false;
    cursor = shiftDayKey(cursor, -1);
  }

  // ── Max streak ever + run count (freeze-independent: historical, conservative).
  let maxStreakEver = 0;
  let runCount = 0;
  if (activeDays.size) {
    const sorted = [...activeDays].sort();
    let run = 0;
    let day = sorted[0];
    const last = sorted[sorted.length - 1];
    let inRun = false;
    while (day <= last) {
      if (activeDays.has(day)) {
        if (!inRun) { runCount++; inRun = true; }
        run++;
      } else if (!isWeekendKey(day)) {
        if (run > maxStreakEver) maxStreakEver = run;
        run = 0;
        inRun = false;
      }
      // weekend gap: leave run intact
      day = shiftDayKey(day, 1);
    }
    if (run > maxStreakEver) maxStreakEver = run;
  }
  // Current streak can exceed the historical scan when freeze is active.
  if (streak > maxStreakEver) maxStreakEver = streak;

  return { streak, maxStreakEver, freezeConsumed, runCount };
}

// ─── Engine ─────────────────────────────────────────────────────────────────

export interface XpEngineInput {
  trades: AnalysisHistoryItem[];
  sessionNotes?: SessionNote[];
  unlocks?: AchievementUnlock[];
  progression?: ProgressionState;
  now?: Date;
}

/**
 * Pure derivation of the full XP / job / achievement state from trades + the
 * persisted overlay. No side effects. Disjoint XP sources (journal | session |
 * achievement) guarantee no double-counting — streak milestones live ONLY in
 * the achievement bucket.
 */
export function deriveXpState(input: XpEngineInput): XpState {
  const { trades } = input;
  const sessionNotes = input.sessionNotes ?? [];
  const unlocks = input.unlocks ?? [];
  const progression: ProgressionState = input.progression ?? { currentJob: 'novice', freezeUsedMonth: null };
  const now = input.now ?? new Date();

  const liveTrades = trades.filter(isLive);
  const liveCount = liveTrades.length;

  // ── Activity day set (streak) ──
  const activeDays = new Set<string>();
  for (const t of liveTrades) {
    const k = gmt7DayKey(t.date);
    if (k) activeDays.add(k);
  }
  for (const n of sessionNotes) {
    if (n.sessionDate) activeDays.add(n.sessionDate);
  }

  const { streak, maxStreakEver, freezeConsumed, runCount } = computeStreak(activeDays, now);

  // ── XP sources (disjoint) ──
  const journalXp = liveCount * XP_PER_JOURNAL;
  const sessionXp = sessionNotes.length * XP_PER_SESSION_NOTE;

  // ── Achievement qualification ──
  const ghostProtocol = liveTrades.some(t => {
    const d = new Date(t.createdAt || t.date);
    if (isNaN(d.getTime())) return false;
    const h = toGmt7(d).getUTCHours();
    return h >= 2 && h < 4;
  });

  const qualifies: Record<AchievementCode, boolean> = {
    first_step:       liveCount >= 1,
    ignition:         maxStreakEver >= 7,
    month_warrior:    maxStreakEver >= 30,
    centurion:        maxStreakEver >= 100,
    obsessive_logger: liveCount >= 100,
    the_chronicler:   liveCount >= 500,
    ghost_protocol:   ghostProtocol,
    born_again:       maxStreakEver >= 30 && runCount >= 2,
  };

  const unlockedMap = new Map(unlocks.map(u => [u.code, u]));
  const pendingUnlocks: AchievementCode[] = [];

  // achievementXp = persisted (latched) + pending (about-to-persist). Keeping
  // pending in the total makes totalXp stable across the persist boundary.
  let achievementXp = 0;
  const achievements = (Object.keys(ACHIEVEMENT_DEFS) as AchievementCode[]).map(code => {
    const def = ACHIEVEMENT_DEFS[code];
    const persisted = unlockedMap.get(code);
    const unlocked = !!persisted || qualifies[code];
    if (persisted) {
      achievementXp += persisted.xpGranted;
    } else if (qualifies[code]) {
      achievementXp += def.xp;
      pendingUnlocks.push(code);
    }
    return {
      code,
      xp: def.xp,
      hidden: def.hidden,
      unlocked,
      unlockedAt: persisted?.unlockedAt,
    };
  });

  const totalXp = journalXp + sessionXp + achievementXp;

  // ── Job (latched, manual change) ──
  const meetsJob = (job: JobClass): boolean => {
    const d = JOB_DEFS[job];
    return totalXp >= d.xpRequired && maxStreakEver >= d.minStreakEver && liveCount >= d.minLiveJournals;
  };

  const currentJob = progression.currentJob;
  const currentIdx = JOB_ORDER.indexOf(currentJob);
  const nextJob = currentIdx >= 0 && currentIdx < JOB_ORDER.length - 1 ? JOB_ORDER[currentIdx + 1] : null;
  const xpToNext = nextJob ? Math.max(0, JOB_DEFS[nextJob].xpRequired - totalXp) : 0;
  // RO-style: only the immediate next rank is changeable, and only when met.
  const eligibleJobChange = nextJob && meetsJob(nextJob) ? nextJob : null;

  return {
    totalXp,
    breakdown: { journal: journalXp, session: sessionXp, achievement: achievementXp },
    streak,
    maxStreakEver,
    freezeConsumed,
    currentJob,
    nextJob,
    xpToNext,
    eligibleJobChange,
    achievements,
    pendingUnlocks,
  };
}
