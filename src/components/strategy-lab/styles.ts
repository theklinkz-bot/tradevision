export const densityStorageKey = 'strategy-lab-density-mode';
export const layoutModeStorageKey = 'strategy-lab-layout-mode';

export type StrategyLayoutMode = 'stack' | 'terminal-grid';

export const strategyLayoutModes: Array<{ label: string; value: StrategyLayoutMode }> = [
  { label: 'STACK', value: 'stack' },
  { label: 'TERMINAL GRID', value: 'terminal-grid' }
];

export const isStrategyLayoutMode = (value: string | null): value is StrategyLayoutMode =>
  value === 'stack' || value === 'terminal-grid';

export const strategyLabStyles = `
  @keyframes strategyScan { 0% { transform: translateY(-100%); opacity: 0; } 18% { opacity: .22; } 100% { transform: translateY(260%); opacity: 0; } }
  @keyframes strategyDrift { 0% { background-position: 0 0; } 100% { background-position: 32px 32px; } }
  @keyframes radarPulse { 0%,100% { transform: scale(.92); opacity: .22; } 50% { transform: scale(1.04); opacity: .38; } }
  @keyframes gaugeSweep { 0% { stroke-dashoffset: 339.3; } }
  @keyframes pulseRing { 0%,100% { transform: scale(.96); opacity: .22; } 50% { transform: scale(1.06); opacity: .42; } }
  @keyframes blinkNode { 0%,78%,100% { opacity: .35; } 84% { opacity: 1; } }
  @keyframes chartPulse { 0%,100% { opacity: .72; } 50% { opacity: .95; } }
  .strategy-scanline { animation: strategyScan 7s linear infinite; }
  .strategy-dot-drift { animation: strategyDrift 18s linear infinite; }
  .strategy-radar { animation: radarPulse 5s ease-in-out infinite; }
  .strategy-gauge-sweep { animation: gaugeSweep 1.4s ease-out both; }
  .strategy-pulse-ring { animation: pulseRing 4.8s ease-in-out infinite; }
  .strategy-blink { animation: blinkNode 2.2s ease-in-out infinite; }
  .strategy-chart-pulse { animation: chartPulse 4s ease-in-out infinite; }
  .strategy-lab[lang="th"] p,
  .strategy-lab[lang="th"] span,
  .strategy-lab[lang="th"] div { overflow-wrap: anywhere; }
  .strategy-lab[lang="th"] .font-mono { line-height: 1.45; }
  .strategy-section-layout { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
  .strategy-section { min-width: 0; }
  .strategy-workbench-hero {
    background:
      radial-gradient(circle at 12% 18%, rgba(52, 211, 153, .12), transparent 30%),
      radial-gradient(circle at 88% 10%, rgba(56, 189, 248, .08), transparent 26%),
      linear-gradient(135deg, rgba(2, 10, 18, .96), rgba(7, 18, 28, .88));
  }
  .strategy-workbench-grid {
    background-image:
      radial-gradient(circle at 24% 28%, rgba(52, 211, 153, .10), transparent 28%),
      radial-gradient(circle at 78% 34%, rgba(56, 189, 248, .08), transparent 24%),
      linear-gradient(115deg, transparent, rgba(148, 163, 184, .035), transparent);
    mask-image: linear-gradient(180deg, #000 0%, transparent 88%);
  }
  .strategy-focus-board {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 18px 60px rgba(0,0,0,.16);
  }
  .strategy-control-option {
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    white-space: nowrap;
  }
  .strategy-control-option .metric-drilldown button {
    height: .95rem;
    width: .95rem;
    font-size: .48rem;
  }
  .strategy-anchor-rail {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: .45rem;
    min-width: min(26rem, 100%);
    max-width: min(34rem, 100%);
    padding: .35rem .45rem;
    border: 1px solid rgba(45, 212, 191, .14);
    border-radius: .4rem;
    background:
      linear-gradient(90deg, rgba(2, 10, 18, .92), rgba(7, 23, 30, .72)),
      repeating-linear-gradient(90deg, rgba(45, 212, 191, .06) 0 1px, transparent 1px 18px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035), 0 0 18px rgba(16,185,129,.045);
  }
  .strategy-anchor-rail__label {
    display: inline-flex;
    align-items: center;
    height: 1.35rem;
    padding: 0 .45rem;
    border-right: 1px solid rgba(148, 163, 184, .18);
    color: rgb(52, 211, 153);
    font-size: .48rem;
    font-weight: 900;
    letter-spacing: .18em;
    line-height: 1;
  }
  .strategy-anchor-rail__track {
    display: flex;
    min-width: 0;
    gap: .35rem;
    overflow-x: auto;
    overflow-y: hidden;
    padding: .05rem .2rem;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 .75rem, #000 calc(100% - .75rem), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 .75rem, #000 calc(100% - .75rem), transparent 100%);
  }
  .strategy-anchor-rail__track::-webkit-scrollbar { display: none; }
  .strategy-anchor-rail__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    border: 1px solid rgba(45, 212, 191, .16);
    border-radius: .28rem;
    background: rgba(15, 23, 42, .72);
    color: rgba(148, 163, 184, .86);
    transition: border-color .16s ease, color .16s ease, background-color .16s ease, box-shadow .16s ease;
  }
  .strategy-anchor-rail__button:hover,
  .strategy-anchor-rail__button:focus-visible {
    border-color: rgba(52, 211, 153, .55);
    background: rgba(16, 185, 129, .1);
    color: rgb(52, 211, 153);
    box-shadow: 0 0 12px rgba(16, 185, 129, .08);
    outline: none;
  }
  .strategy-anchor-rail__link {
    flex: 0 0 auto;
    scroll-snap-align: start;
    white-space: nowrap;
    border: 1px solid rgba(148, 163, 184, .14);
    border-radius: .28rem;
    background: rgba(15, 23, 42, .62);
    padding: .34rem .55rem;
    color: rgba(148, 163, 184, .9);
    font-size: .5rem;
    font-weight: 900;
    letter-spacing: .14em;
    line-height: 1;
    text-transform: uppercase;
    transition: border-color .16s ease, color .16s ease, background-color .16s ease, box-shadow .16s ease;
  }
  .strategy-anchor-rail__link:hover,
  .strategy-anchor-rail__link:focus-visible {
    border-color: rgba(52, 211, 153, .55);
    background: rgba(16, 185, 129, .09);
    color: rgb(52, 211, 153);
    box-shadow: 0 0 12px rgba(16, 185, 129, .08);
    outline: none;
  }
  .strategy-lab--dense { gap: .8rem !important; }
  .strategy-lab--dense header { padding-bottom: .6rem !important; }
  .strategy-lab--dense header h2 { font-size: 1.15rem !important; line-height: 1.2 !important; }
  .strategy-lab--dense header p { font-size: .58rem !important; letter-spacing: .14em !important; }
  .strategy-lab--dense details { gap: .65rem !important; scroll-margin-top: 5.5rem !important; }
  .strategy-lab--dense summary { align-items: center !important; gap: .75rem !important; padding-bottom: .45rem !important; }
  .strategy-lab--dense summary h3 { font-size: 1rem !important; line-height: 1.15 !important; }
  .strategy-lab--dense summary p,
  .strategy-lab--dense .label-caps { font-size: .46rem !important; letter-spacing: .15em !important; margin-bottom: .35rem !important; }
  .strategy-lab--dense .technical-panel { border-radius: .38rem !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 0 0 1px rgba(52,211,153,.025) !important; }
  .strategy-lab--dense .technical-panel,
  .strategy-lab--dense .p-6,
  .strategy-lab--dense .p-5,
  .strategy-lab--dense .p-4,
  .strategy-lab--dense .p-3 { padding: .7rem !important; }
  .strategy-lab--dense .px-4 { padding-left: .75rem !important; padding-right: .75rem !important; }
  .strategy-lab--dense .py-4,
  .strategy-lab--dense .py-3 { padding-top: .55rem !important; padding-bottom: .55rem !important; }
  .strategy-lab--dense .px-3 { padding-left: .6rem !important; padding-right: .6rem !important; }
  .strategy-lab--dense .py-2,
  .strategy-lab--dense .py-1\\.5 { padding-top: .35rem !important; padding-bottom: .35rem !important; }
  .strategy-lab--dense .gap-6,
  .strategy-lab--dense .gap-5,
  .strategy-lab--dense .gap-4,
  .strategy-lab--dense .gap-3 { gap: .65rem !important; }
  .strategy-lab--dense .mb-5,
  .strategy-lab--dense .mb-4,
  .strategy-lab--dense .mb-3 { margin-bottom: .55rem !important; }
  .strategy-lab--dense .mt-5,
  .strategy-lab--dense .mt-4,
  .strategy-lab--dense .mt-3 { margin-top: .55rem !important; }
  .strategy-lab--dense .rounded-xl,
  .strategy-lab--dense .rounded-lg { border-radius: .35rem !important; }
  .strategy-lab--dense .rounded-full { border-radius: 999px !important; }
  .strategy-lab--dense .text-6xl { font-size: 2.8rem !important; line-height: .92 !important; }
  .strategy-lab--dense .text-5xl { font-size: 2.55rem !important; line-height: .92 !important; }
  .strategy-lab--dense .text-4xl { font-size: 2rem !important; line-height: .95 !important; }
  .strategy-lab--dense .text-3xl { font-size: 1.55rem !important; line-height: 1 !important; }
  .strategy-lab--dense .text-2xl { font-size: 1.2rem !important; line-height: 1.05 !important; }
  .strategy-lab--dense .text-xl { font-size: 1rem !important; line-height: 1.15 !important; }
  .strategy-lab--dense .text-lg { font-size: .9rem !important; line-height: 1.15 !important; }
  .strategy-lab--dense .text-sm { font-size: .72rem !important; line-height: 1.2 !important; }
  .strategy-lab--dense .text-xs { font-size: .62rem !important; line-height: 1.15 !important; }
  .strategy-lab--dense .text-\\[12px\\] { font-size: .64rem !important; line-height: 1.25 !important; }
  .strategy-lab--dense .text-\\[11px\\],
  .strategy-lab--dense .text-\\[10px\\] { font-size: .54rem !important; line-height: 1.25 !important; letter-spacing: .06em !important; }
  .strategy-lab--dense .text-\\[9px\\],
  .strategy-lab--dense .text-\\[8px\\],
  .strategy-lab--dense .text-\\[7px\\] { font-size: .46rem !important; line-height: 1.2 !important; letter-spacing: .12em !important; }
  .strategy-lab--dense .tracking-\\[0\\.24em\\],
  .strategy-lab--dense .tracking-\\[0\\.22em\\],
  .strategy-lab--dense .tracking-\\[0\\.2em\\],
  .strategy-lab--dense .tracking-\\[0\\.18em\\],
  .strategy-lab--dense .tracking-widest { letter-spacing: .12em !important; }
  .strategy-lab--dense .leading-relaxed { line-height: 1.35 !important; }
  .strategy-lab--dense .h-40,
  .strategy-lab--dense .w-40 { width: 7.8rem !important; height: 7.8rem !important; }
  .strategy-lab--dense .h-32 { height: 6rem !important; }
  .strategy-lab--dense .h-24,
  .strategy-lab--dense .h-16 { height: 3.5rem !important; }
  .strategy-lab--dense .h-10,
  .strategy-lab--dense .w-10 { width: 2rem !important; height: 2rem !important; }
  .strategy-lab--dense .h-8 { height: 1.45rem !important; }
  .strategy-lab--dense .h-7 { height: 1.2rem !important; }
  .strategy-lab--dense .min-h-8 { min-height: 1.15rem !important; }
  .strategy-lab--dense .micro-viz { margin-top: .35rem !important; }
  .strategy-lab--dense svg.micro-viz,
  .strategy-lab--dense .micro-viz.h-6 { height: 1rem !important; }
  .strategy-lab--dense .metric-drilldown > span { width: min(16rem, calc(100vw - 2rem)) !important; padding: .55rem !important; }
  .strategy-lab--dense .strategy-verdict-bar { border-radius: .35rem !important; padding: .35rem .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar > div { flex-direction: row !important; align-items: center !important; gap: .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar .grid { display: flex !important; flex-wrap: wrap !important; gap: .35rem !important; }
  .strategy-lab--dense .strategy-verdict-bar .grid > div { min-width: 5.5rem; padding: .28rem .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar a,
  .strategy-lab--dense .strategy-verdict-bar span { padding: .28rem .45rem !important; }
  .strategy-lab--dense .strategy-anchor-rail { min-width: min(20rem, 100%); max-width: min(28rem, 100%); gap: .28rem !important; padding: .24rem .32rem !important; }
  .strategy-lab--dense .strategy-anchor-rail__label { height: 1.05rem; padding: 0 .32rem !important; font-size: .42rem !important; letter-spacing: .14em !important; }
  .strategy-lab--dense .strategy-anchor-rail__button { width: 1.05rem; height: 1.05rem; border-radius: .22rem; }
  .strategy-lab--dense .strategy-anchor-rail__button svg { width: .65rem; height: .65rem; }
  .strategy-lab--dense .strategy-anchor-rail__track { gap: .24rem !important; padding: 0 .16rem !important; }
  .strategy-lab--dense .strategy-anchor-rail__link { border-radius: .22rem; padding: .25rem .38rem !important; font-size: .43rem !important; letter-spacing: .1em !important; }
  .strategy-lab--dense .workspace-preset-control { gap: .2rem !important; }
  .strategy-lab--dense .strategy-control-option { gap: .12rem !important; }
  .strategy-lab--dense .strategy-control-option .metric-drilldown button { height: .82rem; width: .82rem; font-size: .4rem !important; }
  .strategy-lab--dense .workspace-preset-control button { padding: .25rem .45rem !important; font-size: .43rem !important; letter-spacing: .1em !important; }
  .strategy-lab--dense .layout-mode-control { gap: .2rem !important; }
  .strategy-lab--dense .layout-mode-control button { padding: .25rem .45rem !important; font-size: .43rem !important; letter-spacing: .1em !important; }
  .strategy-lab--dense #strategy-context .space-y-2 > div { padding-top: .38rem !important; padding-bottom: .38rem !important; }
  .strategy-lab--dense #strategy-context .grid-cols-3,
  .strategy-lab--dense #strategy-context .grid-cols-2 { gap: .45rem !important; }
  .strategy-lab--dense .strategy-empty-state { padding: 2rem !important; gap: .75rem !important; }
  @media (min-width: 1280px) {
    .strategy-lab--terminal-grid .strategy-section-layout {
      display: grid;
      grid-template-columns: repeat(2, minmax(24rem, 1fr));
      gap: 1rem;
      align-items: start;
    }
    .strategy-lab--terminal-grid .strategy-section--strategy-intelligence,
    .strategy-lab--terminal-grid .strategy-section--strategy-validation,
    .strategy-lab--terminal-grid .strategy-section--strategy-psychology,
    .strategy-lab--terminal-grid .strategy-section--strategy-checklist {
      grid-column: 1 / -1;
    }
    .strategy-lab--terminal-grid details.strategy-section,
    .strategy-lab--terminal-grid .strategy-section > details {
      height: 100%;
    }
  }
  @media (min-width: 1800px) {
    .strategy-lab--terminal-grid .strategy-section-layout {
      grid-template-columns: repeat(3, minmax(22rem, 1fr));
    }
    .strategy-lab--terminal-grid .strategy-section--strategy-intelligence {
      grid-column: span 2;
    }
    .strategy-lab--terminal-grid .strategy-section--strategy-validation {
      grid-column: span 1;
    }
    .strategy-lab--terminal-grid .strategy-section--strategy-psychology,
    .strategy-lab--terminal-grid .strategy-section--strategy-checklist {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 1279px) {
    .strategy-lab--terminal-grid .strategy-section-layout {
      display: flex;
      flex-direction: column;
    }
  }
`;
