# Share Card Glitch Brag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current performance share card with a Cyber Afterburner / Glitch Brag design that uses win rate as the hero metric and real `TradeStats` values.

**Architecture:** Keep the existing `ShareCardModal` capture workflow intact and redesign `PerformanceShareCard` as a self-contained 16:9 export component. Add small exported formatting helpers in the same component file so stat display rules can be tested without adding a new test framework.

**Tech Stack:** React 19, TypeScript, Tailwind CSS utilities, lucide-react, html2canvas, Vite, `tsx` plus Node `assert` for focused helper tests.

---

## File Structure

- Modify `src/components/PerformanceShareCard.tsx`: add formatting helpers and replace the visual layout with the Glitch Brag card.
- Create `src/components/PerformanceShareCard.test.ts`: run focused helper checks with Node `assert`.
- Optionally modify `src/components/ShareCardModal.tsx`: only if the new card needs preview scale/frame adjustment after browser QA.

## Task 1: Add Tested Share Metric Formatters

**Files:**
- Modify: `src/components/PerformanceShareCard.tsx`
- Create: `src/components/PerformanceShareCard.test.ts`

- [ ] **Step 1: Write the failing formatter test**

Create `src/components/PerformanceShareCard.test.ts`:

```ts
import assert from 'node:assert/strict';
import {
  formatShareDecimal,
  formatShareInteger,
  formatShareSigned,
  getShareStatValues,
} from './PerformanceShareCard';
import { TradeStats } from '../types';

const baseStats: TradeStats = {
  winRate: 80,
  avgRR: 2.1,
  expectancy: 49.5,
  maxDrawdown: -1,
  totalTrades: 5,
  profitFactor: 2.48,
  recoveryFactor: 3.2,
  avgDuration: '12m',
  maxConsecutiveLosses: 1,
  symbolEfficiency: [],
  biasAnalysis: {
    long: { winRate: 75, count: 4 },
    short: { winRate: 100, count: 1 },
  },
  equityCurve: [
    { trade: 1, equity: 0, drawdown: 0 },
    { trade: 2, equity: 1.2, drawdown: 0 },
    { trade: 3, equity: 0.8, drawdown: -0.4 },
    { trade: 4, equity: 2.1, drawdown: 0 },
    { trade: 5, equity: 2.48, drawdown: 0 },
  ],
  performanceByDay: [],
  performanceBySession: [],
};

assert.equal(formatShareInteger(80.4), '80');
assert.equal(formatShareInteger(Number.NaN), '--');
assert.equal(formatShareDecimal(2.481, 2), '2.48');
assert.equal(formatShareDecimal(Infinity, 2), '--');
assert.equal(formatShareSigned(248.48, 2), '+248.48');
assert.equal(formatShareSigned(-1, 1), '-1.0');
assert.equal(formatShareSigned(Number.NaN, 1), '--');

assert.deepEqual(getShareStatValues(baseStats), {
  winRate: '80',
  profitFactor: '2.48',
  netProfit: '+2.48',
  maxDrawdown: '-1.0',
  avgRR: '1:2.1',
  expectancy: '+49.5',
  totalTrades: '5',
  wins: '4',
  losses: '1',
});

console.log('PerformanceShareCard formatter tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx tsx src/components/PerformanceShareCard.test.ts
```

Expected: FAIL because `formatShareDecimal`, `formatShareInteger`, `formatShareSigned`, and `getShareStatValues` are not exported yet.

- [ ] **Step 3: Add minimal formatter implementation**

Add these exports near the top of `src/components/PerformanceShareCard.tsx` after constants:

```tsx
const isUsableNumber = (value: number) => Number.isFinite(value);

export const formatShareInteger = (value: number) => (
  isUsableNumber(value) ? Math.round(value).toString() : '--'
);

export const formatShareDecimal = (value: number, digits = 2) => (
  isUsableNumber(value) ? value.toFixed(digits) : '--'
);

export const formatShareSigned = (value: number, digits = 2) => {
  if (!isUsableNumber(value)) return '--';
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
};

export const getShareStatValues = (stats: TradeStats) => {
  const wins = Math.round((stats.totalTrades * stats.winRate) / 100);
  const losses = Math.max(stats.totalTrades - wins, 0);
  const lastEquity = stats.equityCurve.at(-1)?.equity ?? Number.NaN;

  return {
    winRate: formatShareInteger(stats.winRate),
    profitFactor: formatShareDecimal(stats.profitFactor, 2),
    netProfit: formatShareSigned(lastEquity, 2),
    maxDrawdown: formatShareSigned(stats.maxDrawdown, 1),
    avgRR: isUsableNumber(stats.avgRR) ? `1:${stats.avgRR.toFixed(1)}` : '--',
    expectancy: formatShareSigned(stats.expectancy, 1),
    totalTrades: formatShareInteger(stats.totalTrades),
    wins: formatShareInteger(wins),
    losses: formatShareInteger(losses),
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npx tsx src/components/PerformanceShareCard.test.ts
```

Expected: PASS and prints `PerformanceShareCard formatter tests passed`.

## Task 2: Replace The Share Card Layout With Glitch Brag

**Files:**
- Modify: `src/components/PerformanceShareCard.tsx`

- [ ] **Step 1: Write a failing static content test**

Append these assertions to `src/components/PerformanceShareCard.test.ts`:

```ts
import { SHARE_CARD_COPY } from './PerformanceShareCard';

assert.equal(SHARE_CARD_COPY.headline, 'I BROKE THE CURVE.');
assert.equal(SHARE_CARD_COPY.mode, 'AFTERBURNER MODE');
assert.equal(SHARE_CARD_COPY.heroLabel, 'WIN RATE');
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npx tsx src/components/PerformanceShareCard.test.ts
```

Expected: FAIL because `SHARE_CARD_COPY` is not exported yet.

- [ ] **Step 3: Add copy constants**

Add this near the formatter helpers:

```tsx
export const SHARE_CARD_COPY = {
  mode: 'AFTERBURNER MODE',
  headline: 'I BROKE THE CURVE.',
  heroLabel: 'WIN RATE',
  footerUrl: 'tradevision.app',
} as const;
```

- [ ] **Step 4: Replace the JSX with the Glitch Brag composition**

In `PerformanceShareCard`, use `const values = getShareStatValues(stats);` and render:

```tsx
<div
  ref={ref}
  className="relative isolate aspect-video w-[1640px] overflow-hidden rounded-[42px] border border-[#00e5ff]/40 bg-[#05050a] p-[44px] font-mono text-white"
  style={{
    boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 74px rgba(0,229,255,0.20), inset 0 0 120px rgba(0,0,0,0.92)',
  }}
>
  {/* background, grid, streaks, header, hero, right rail, equity strip, metrics, footer */}
</div>
```

Use the existing `LogoMark`, `StatPill`, and `MetricCard` patterns only where they fit. Prefer new small local helpers if the old gold/trophy styling conflicts with the cyber design.

- [ ] **Step 5: Run formatter/static tests**

Run:

```bash
npx tsx src/components/PerformanceShareCard.test.ts
```

Expected: PASS.

## Task 3: Browser QA And Build Verification

**Files:**
- Possibly modify: `src/components/ShareCardModal.tsx`

- [ ] **Step 1: Build the project**

Run:

```bash
npm run build
```

Expected: build completes without TypeScript or Vite errors.

- [ ] **Step 2: Open the local app and inspect the share modal**

Run the dev server if needed:

```bash
npm run dev -- --host 127.0.0.1
```

Open the app in the browser and trigger the share card modal from the performance dashboard.

Expected:
- Modal opens.
- Card preview is fully visible.
- `80%` style hero win rate is the dominant element.
- `I BROKE THE CURVE.` and `AFTERBURNER MODE` are readable.
- No stat chips overlap.
- Export frame remains 16:9.

- [ ] **Step 3: Adjust modal preview only if needed**

If the card is cropped or too small in `ShareCardModal.tsx`, change only the preview wrapper dimensions and scale. Keep the copy/download capture logic unchanged.

- [ ] **Step 4: Re-run build**

Run:

```bash
npm run build
```

Expected: build completes.

## Task 4: Final Cleanup

**Files:**
- Review: `public/share-card-mood.html`
- Review: `public/share-card-cyber-variants.html`
- Review: `src/components/PerformanceShareCard.test.ts`

- [ ] **Step 1: Decide whether preview HTML stays**

The two public preview pages were used for brainstorming. If they are not intended product pages, remove them before final commit:

```bash
git rm public/share-card-mood.html public/share-card-cyber-variants.html
```

- [ ] **Step 2: Keep the formatter test file**

Keep `src/components/PerformanceShareCard.test.ts` because it documents stat display behavior and can be run with:

```bash
npx tsx src/components/PerformanceShareCard.test.ts
```

- [ ] **Step 3: Final status check**

Run:

```bash
git status --short
```

Expected: only intentional files are modified or added.
