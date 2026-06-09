# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at localhost:5174
npm run build      # production build
npm run preview    # preview production build
```

No test runner is configured. `src/components/PerformanceShareCard.test.ts` exists but runs standalone (no vitest/jest scripts in package.json).

## Environment

Create `.env.local` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...   # optional; users can supply their own key in-app
```

The app degrades gracefully when Supabase is not configured — all DB calls are guarded by `isSupabaseConfigured`. The Gemini API key is BYOK: users paste it into the System tab and it's stored in `localStorage` under key `flow-the-edge-gemini-key`.

## Architecture

**Single-page React 19 app** — no router. Navigation is tab-state inside `App.tsx`:
- Tabs: `Dashboard`, `Analytics`, `Performance`, `StrategyLab`, `Log`, `Gallery`, `System`, `Admin`
- `App.tsx` is the monolith (~4000 lines). It owns all global state, auth, CRUD handlers, and renders each tab inline. Most components receive props down from `App`.

**Data flow:**
1. User uploads a TradingView screenshot → `geminiService.ts:analyzeTradeScreenshot()` calls Gemini Vision with a structured JSON schema → returns `TradeAnalysis`
2. Validation overlay shown → user confirms/edits levels
3. `saveTradeToSupabase()` persists to `trades` table
4. `calculateTradeStatistics()` in `statsEngine.ts` recomputes all metrics reactively via `useMemo` over `filteredHistory`

**Core types** (`src/types.ts`):
- `AnalysisHistoryItem` — a trade record (extends `TradeAnalysis` with status, imageUrl, notes, strategyId)
- `TradeStats` — computed analytics output (equity curve, drawdown, symbolEfficiency, performanceByDay/Session, strategyAnalysis)
- `Strategy` — user-defined strategy with name + color

**Key services:**
- `src/services/geminiService.ts` — Gemini `gemini-3-flash-preview` with forced JSON schema response
- `src/lib/supabase.ts` — all DB operations (trades, strategies, profiles, feedback); includes a join-fallback pattern for when the `strategies` FK relation isn't in schema cache
- `src/services/statsEngine.ts` — pure function, no side effects; all timestamps normalized to GMT+7 for session/day bucketing

**Components of note:**
- `StrategyLab` — lazy-loaded; split into sub-sections under `src/components/strategy-lab/`
- `PerformanceDashboard` — standalone analytics view, separate from the in-tab stats panels
- `AnalyticsCommandCenter` — floating command bar / AI advisor button
- `ShareCardModal` + `PerformanceShareCard` — html2canvas-based share card generation

**State persistence:**
- Auth + trades → Supabase (RLS per user)
- Theme, language, sidebar state, Gemini key → `localStorage` with prefix `flow-the-edge-*`
- Demo mode activated via `?demo=1` URL param; uses hardcoded `DEMO_HISTORY` / `DEMO_STRATEGIES`

## Design System

Defined in `src/index.css` as CSS custom properties on `:root` and `[data-theme]` attributes. Theme tokens use `--brand-*` prefix. Five themes: `default` (obsidian + amber), `light`, `claude`, `forest`, `cyberpunk`.

Tailwind v4 is used via `@tailwindcss/vite` plugin — no `tailwind.config.js`. Utility classes reference CSS vars directly (e.g. `text-brand-accent`, `bg-brand-bg`).

Fonts: Inter (body), Barlow Condensed (display), IBM Plex Mono (mono/tabular data).

The brand spec in `brand-spec.md` defines the design intent: obsidian canvas, glass panels with emerald/cyan borders, amber/red reserved for risk states only.

## Supabase Tables

- `trades` — main trade log; FK to `strategies` via `strategy_id` (ON DELETE SET NULL)
- `strategies` — user trading strategies (name, color)
- `profiles` — upserted on login (id, email, last_sign_in_at)
- `system_feedback` — user feedback submissions

Admin access is email-gated: `ADMIN_EMAILS = ['ookami.0609@gmail.com']` hardcoded in `App.tsx:686`.
