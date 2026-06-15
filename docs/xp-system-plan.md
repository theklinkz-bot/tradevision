# XP & Trader Progression — Implementation Plan

Branch: `feature/xp-progression` (isolated; merge to `main` after test).
Source spec: `flowtheedge-xp-system-spec.docx` v1.0.

## Scope changes (locked with user)
Removed from spec:
- ❌ "Journal ครบทุก trade ในวัน" (+20) — app has no ground truth of how many trades happened that day; unverifiable.
- ❌ Psychology achievements: Ice Veins, Walk Away (need revenge-trade / daily-loss-limit detection not in schema).
- ❌ Branch requirement `avg hold > 30 min` (contradicts scalping focus).

Kept: holiday calendar for streak.

---

## Core architecture decision: DERIVE, don't log

Spec's data model has an `xp_log` transaction table. **Recommendation: do not use a write-time XP ledger as source of truth.** Trades already are the source of truth. A separate ledger means two systems that drift and need reconciliation (re-edit a trade, delete one, backfill → ledger wrong).

**Instead:**
- `total_xp`, `streak`, `max_streak_ever`, journal-count milestones, hidden achievements → **derived** by a pure function over the trades array (mirrors `statsEngine.ts`). Deterministic, recomputes via `useMemo`, works in demo mode for free.
- Persist server-side ONLY the things that are NOT derivable (stateful events):
  - `current_job` — job change is **user-initiated** and **latched** (never demotes), so it must be stored.
  - `achievement_unlocks` — unlock timestamp + whether XP already granted.
  - `streak_freeze` usage (per month).

`total_xp = journalXP + streakMilestoneXP + achievementXP` — three **disjoint** sources, never overlapping (see Review §6).

---

## Phases

### Phase 1 — Schema + types
New Supabase tables (SQL migration in `supabase/migrations/`):

```
user_progression
  user_id (PK, FK auth.users)  current_job text  freeze_used_month text(YYYY-MM)  updated_at
achievement_unlocks
  id  user_id  achievement_code  unlocked_at  xp_granted int
```
- RLS: `user_id = auth.uid()` per row (match existing `trades` policy).
- `current_job` defaults `'novice'`. No `total_xp`/`streak_count` columns — derived, not stored (avoids stale-value bug, Review §3).
- Types in `src/types.ts`: add `JobClass`, `AchievementCode`, `ProgressionState`, `XpBreakdown`. Add `createdAt?: string` to `AnalysisHistoryItem` (needed for Ghost-Protocol log-time + streak day bucketing) and map `row.created_at` in `supabase.ts`.

### Phase 2 — `src/services/xpEngine.ts` (pure, no side effects)
Input: `trades: AnalysisHistoryItem[]`, `today` (GMT+7), `unlocks`, `currentJob`.
Output:
```
{ totalXp, breakdown:{journal,streak,achievement},
  streak, maxStreakEver, currentJob, nextJob, xpToNext,
  achievements: {code, unlocked, hidden, progress}[],
  eligibleJobChange: JobClass | null }
```
Reuse GMT+7 normalization from `statsEngine` (extract `toGmt7(date)` to `lib/tradeUtils.ts`, share). Standalone test file `xpEngine.test.ts` (pattern: existing `PerformanceShareCard.test.ts`, no runner).

### Phase 3 — `src/lib/progression.ts` (persistence)
`fetchProgression(userId)`, `saveJobChange(userId, job)`, `unlockAchievement(userId, code, xp)`, `useStreakFreeze(userId, month)`. All guarded by `isSupabaseConfigured` (match existing pattern). Demo mode → in-memory only.

### Phase 4 — UI
- **XP bar** on Dashboard header: current/next-job target + flame streak icon.
- **Progress tab** (new `mainTab`): job tree (Novice→…→Master + Tactical/Professional branch), achievement grid (hidden = `???`), Change-Job button when eligible → full-screen celebration modal.
- **Mini +XP popup** bottom-right on trade submit.
- Wire into `App.tsx`: extend `mainTab` union, add nav item, add `<ProgressTab/>`. i18n EN/TH in both translation blocks. Respect 5 themes (`--brand-*` tokens).

### Phase 5 — Integration + verify
Hook submit flow → recompute → fire popup + achievement toast. Streak flame on Dashboard. Run `npm run build`, preview-verify XP bar / job change / achievement unlock. Demo-mode (`?demo=1`) sanity.

### Phase 6 — Merge
Squash-merge `feature/xp-progression` → `main` after sign-off.

---

## DEEP LOGIC REVIEW — spec holes (ranked)

**🔴 §6 — Double-count: streak milestone XP == achievement XP.**
Spec 2.1 gives Streak 7=+100, 30=+500, 100=+2000. Spec 4.1 Ignition(7)=+100, Month Warrior(30)=+500, Centurion(100)=+2000 — **same events, same numbers.** Granting both = double. **Fix: treat streak milestones AS the achievements. Single grant.** `streakMilestoneXP` and `achievementXP` must not both count the 7/30/100 rewards.

**🔴 §3 — Stored streak goes stale.** If `streak_count` is a DB column, a user who's absent 5 days still shows their old streak until a write happens (no cron/server). **Fix (already in plan): derive streak at load** = walk trade-day set vs `today` GMT+7; break on any trading-day gap (minus freeze). Never trust a stored counter.

**🔴 Job eligibility must latch, not track current streak.** Scalper needs "streak 14d", but streak is volatile (drops to 0). Does dropping streak block/demote? Spec 3.3 says manual change + no decay → **job is sticky.** So requirement = "**ever** reached 14d", not "currently". **Fix: evaluate against `maxStreakEver` (derived) + once-true latch; once job attained it never reverts.**

**🟡 §2.1 — Pre/Post-session plan XP (+5 each) has no feature to hang on.** App has no pre/post-session journal. Either (a) build a minimal session-note feature, or (b) defer these two XP sources to V1.1. **Recommend defer** — don't block core on new feature.

**🟡 Backtest farming exploit.** `Obsessive Logger` (100) / `Chronicler` (500) count trades. App has live vs backtest (`tradingMode`). Counting backtest = XP grind, contradicts "anti-grind" pillar. **Fix: journal XP + count milestones use LIVE trades only.**

**🟡 Weekend/holiday rule conflicts with 24/7 assets.** Spec: weekend = no break, no XP. But crypto (BTC in demo) trades weekends. If user logs a real BTC trade Saturday, do they get +10 and streak? **Fix: weekend/holiday = optional day — logging it counts (XP + keeps streak), absence never breaks. Holiday set = configurable list, GMT+7.** Resolve which markets define holidays (futures calendar?).

**🟡 Hidden achievements depend on non-trade journaling.**
- `The Phantom` (no trade 30d but log review daily) and `Silence is Gold` (10d no-setup, no force trade) need a "no-trade day" / "review-only" entry type that doesn't exist. **Defer until a no-trade journal entry exists, or drop.**
- `Ghost Protocol` (log 02:00–04:00) → use **`created_at`** (log time), not trade `timestamp`. GMT+7.
- `Born Again` (break then rebuild 30d) → derivable from full trade-date history. OK.

**🟢 Achievement XP source-of-truth.** When derived total adds achievement XP, read it from `achievement_unlocks.xp_granted` (latched at unlock), NOT recomputed — else editing/deleting a trade could retro-revoke an already-earned badge's XP. Unlocks are permanent.

**🟢 Streak freeze UX undefined.** Scalper+ gets 1/month when streak>14. Auto-consume on a gap to save streak, or prompt? **Recommend: auto-consume a single gap day during derivation if available, show "🧊 freeze used" notice.** Reset via `freeze_used_month != currentMonth`.

---

## Open questions for user
1. Pre/post-session plan XP — **defer to V1.1**, or build the session-note feature now?
2. Holiday calendar source — futures market holidays? crypto = no holidays? Give the list or pick "weekends optional, no hard holidays" for V1.
3. Streak freeze — auto-consume (recommended) or manual button?
4. Confirm milestone XP is **single grant** (streak milestone = the achievement), not stacked.
