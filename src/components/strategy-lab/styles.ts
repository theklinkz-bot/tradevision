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
  .strategy-section-layout { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
  .strategy-section { min-width: 0; }
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
  .strategy-lab--dense .workspace-preset-control { gap: .2rem !important; }
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
