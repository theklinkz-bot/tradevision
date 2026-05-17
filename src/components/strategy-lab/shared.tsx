import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisHistoryItem } from '../../types';

export type ValidationTone = 'ready' | 'caution' | 'fail';

export type ContextRow = {
  label: string;
  trades: number;
  winRate: number;
  netR: number;
  expectancy: number;
};

export const toneStyles: Record<ValidationTone, { text: string; border: string; bg: string; bar: string; label: string }> = {
  ready: {
    text: 'text-brand-success',
    border: 'border-brand-success/30',
    bg: 'bg-brand-success/10',
    bar: 'bg-brand-success',
    label: 'READY'
  },
  caution: {
    text: 'text-brand-warning',
    border: 'border-brand-warning/30',
    bg: 'bg-brand-warning/10',
    bar: 'bg-brand-warning',
    label: 'CAUTION'
  },
  fail: {
    text: 'text-brand-danger',
    border: 'border-brand-danger/30',
    bg: 'bg-brand-danger/10',
    bar: 'bg-brand-danger',
    label: 'NOT READY'
  }
};

export const formatR = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`;

export type DrilldownContent = {
  title: string;
  current?: string;
  meaning: string;
  signals: string[];
  ranges?: string[];
  why?: string;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const toneStroke = (tone: ValidationTone) =>
  tone === 'ready' ? 'var(--brand-success)' : tone === 'caution' ? 'var(--brand-warning)' : 'var(--brand-danger)';

const toneTrack = (tone: ValidationTone) =>
  tone === 'ready'
    ? 'from-brand-success/85 to-brand-success/35'
    : tone === 'caution'
      ? 'from-brand-warning/85 to-brand-warning/35'
      : 'from-brand-danger/85 to-brand-danger/35';

export const MetricDrilldown = ({
  tone,
  content,
  label = 'Open metric drilldown'
}: {
  tone: ValidationTone;
  content: DrilldownContent;
  label?: string;
}) => {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12, width: 288, maxHeight: 320 });

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 90);
  };

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const padding = 12;
    const offset = 8;
    const dense = Boolean(trigger.closest('.strategy-lab--dense'));
    const preferredWidth = dense ? 256 : 288;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(preferredWidth, viewportWidth - padding * 2);
    const panelHeight = Math.min(panelRef.current?.offsetHeight || (dense ? 236 : 292), viewportHeight - padding * 2);
    const rect = trigger.getBoundingClientRect();
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = clamp(centeredLeft, padding, viewportWidth - width - padding);
    const bottomTop = rect.bottom + offset;
    const topTop = rect.top - panelHeight - offset;
    const hasBottomRoom = bottomTop + panelHeight <= viewportHeight - padding;
    const hasTopRoom = topTop >= padding;
    const top = hasBottomRoom || !hasTopRoom
      ? clamp(bottomTop, padding, viewportHeight - panelHeight - padding)
      : clamp(topTop, padding, viewportHeight - panelHeight - padding);

    setPosition({
      left,
      top,
      width,
      maxHeight: viewportHeight - padding * 2
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const handleViewportChange = () => updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, content, updatePosition]);

  const panel = open ? createPortal(
    <span
      ref={panelRef}
      id={id}
      role="tooltip"
      className="metric-drilldown-panel fixed z-[9999] block overflow-auto rounded-md border border-brand-accent/30 bg-brand-bg/95 p-3 text-left shadow-[0_0_24px_rgba(52,211,153,0.12)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
      style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <span className={`mb-2 block text-[8px] font-black uppercase tracking-[0.18em] ${toneStyles[tone].text}`}>{content.title}</span>
      {content.current && <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-tight text-brand-text-bright">NOW // {content.current}</span>}
      <span className="mb-2 block text-[10px] font-mono uppercase leading-snug tracking-tight text-brand-text-dim">{content.meaning}</span>
      <span className="mb-1 block text-[7px] font-black uppercase tracking-widest text-brand-text-dim">Signals</span>
      <span className="mb-2 grid gap-1">
        {content.signals.map((signal) => (
          <span key={signal} className="block rounded border border-brand-border/50 bg-brand-bg/50 px-2 py-1 text-[9px] font-mono uppercase leading-snug tracking-tight text-brand-text-bright">
            {signal}
          </span>
        ))}
      </span>
      {content.ranges && (
        <>
          <span className="mb-1 block text-[7px] font-black uppercase tracking-widest text-brand-text-dim">Range Guide</span>
          <span className="mb-2 block text-[9px] font-mono uppercase leading-snug tracking-tight text-brand-text-dim">{content.ranges.join(' // ')}</span>
        </>
      )}
      {content.why && <span className={`block border-t ${toneStyles[tone].border} pt-2 text-[9px] font-mono uppercase leading-snug tracking-tight ${toneStyles[tone].text}`}>{content.why}</span>}
    </span>,
    document.body
  ) : null;

  return (
    <span className="metric-drilldown inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        className={`flex h-4 w-4 items-center justify-center rounded border ${toneStyles[tone].border} ${toneStyles[tone].bg} text-[9px] font-black ${toneStyles[tone].text} outline-none transition-colors hover:border-brand-accent/60 focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent/50`}
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => {
          clearCloseTimer();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => setOpen(true)}
        onBlur={scheduleClose}
        onClick={() => {
          clearCloseTimer();
          setOpen(true);
        }}
      >
        i
      </button>
      {panel}
    </span>
  );
};

export const MetricLabel = ({
  children,
  drilldown,
  tone
}: {
  children: ReactNode;
  drilldown?: DrilldownContent;
  tone: ValidationTone;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <span>{children}</span>
    {drilldown && <MetricDrilldown tone={tone} content={drilldown} label={`Explain ${drilldown.title}`} />}
  </span>
);

export const createDemoTrades = (): AnalysisHistoryItem[] => {
  const start = new Date('2026-01-05T08:00:00.000Z');
  return Array.from({ length: 120 }, (_, index) => {
    const clusterLoss = (index >= 28 && index <= 31) || (index >= 74 && index <= 76);
    const status = index % 17 === 0 ? 'BE' : clusterLoss || index % 5 === 0 ? 'Loss' : 'Win';
    const reward = status === 'Win' ? 1.15 + ((index % 7) * 0.18) : 1.4;
    const entry = 100 + (index % 19) * 0.75;
    const stopLoss = entry - 1;
    const takeProfit = entry + reward;
    const openedAt = new Date(start.getTime() + index * 36 * 60 * 60 * 1000);
    const closedAt = new Date(openedAt.getTime() + (45 + (index % 6) * 15) * 60 * 1000);

    return {
      id: `demo-trade-${index + 1}`,
      symbol: ['MNQ', 'MGC', 'BTCUSD', 'XAUUSD'][index % 4],
      side: index % 3 === 0 ? 'Short' : 'Long',
      levels: { entry, stopLoss, takeProfit },
      timestamp: openedAt.toISOString(),
      fiboTarget: 'Demo expansion cluster',
      confidence: 0.82,
      imageUrl: '',
      date: openedAt.toISOString(),
      exitDate: closedAt.toISOString(),
      status,
      savedToDb: false,
      tradingMode: 'backtest',
      notes: 'Local Strategy Lab preview sample',
      strategyName: 'Demo Validation Model',
      strategyColor: '#38bdf8'
    };
  });
};

export const MiniSparkline = ({ tone }: { tone: ValidationTone }) => (
  <div className="mt-2 flex h-5 items-end gap-0.5 opacity-50 transition-opacity group-hover:opacity-90">
    {[35, 52, 44, 68, 57, 82, 74, 92].map((height, index) => (
      <span
        key={index}
        className={`w-full rounded-sm ${toneStyles[tone].bar}`}
        style={{ height: `${height}%`, opacity: 0.25 + index * 0.06 }}
      />
    ))}
  </div>
);

export const MicroSparkline = ({
  values,
  tone,
  label = 'Micro trend'
}: {
  values: number[];
  tone: ValidationTone;
  label?: string;
}) => {
  const data = values.length > 0 ? values : [0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 24;
  const points = data.map((value, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - 4 - ((value - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="micro-viz mt-2 h-6 w-full overflow-visible" role="img" aria-label={label}>
      <title>{label}</title>
      <polyline points={`0,20 ${width},20`} fill="none" stroke="var(--brand-border)" strokeWidth="1" opacity="0.45" strokeDasharray="3 6" />
      <polyline points={points} fill="none" stroke={toneStroke(tone)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.86" />
      <circle cx={points.split(' ').at(-1)?.split(',')[0] || width} cy={points.split(' ').at(-1)?.split(',')[1] || 12} r="2" fill={toneStroke(tone)} opacity="0.9" />
    </svg>
  );
};

export const MicroBars = ({
  values,
  tone,
  label = 'Micro bars'
}: {
  values: number[];
  tone: ValidationTone;
  label?: string;
}) => {
  const max = Math.max(1, ...values.map((value) => Math.abs(value)));

  return (
    <div className="micro-viz mt-2 flex h-6 items-end gap-0.5 rounded border border-brand-border/40 bg-brand-bg/25 p-1" role="img" aria-label={label} title={label}>
      {(values.length > 0 ? values : [0]).slice(-18).map((value, index) => {
        const valueTone: ValidationTone = value > 0 ? 'ready' : value < 0 ? 'fail' : tone;
        return (
          <span
            key={`${value}-${index}`}
            className={`flex-1 rounded-sm ${toneStyles[valueTone].bar}`}
            style={{ height: `${clamp(18 + (Math.abs(value) / max) * 82)}%`, opacity: 0.24 + (index / Math.max(1, values.length - 1)) * 0.45 }}
          />
        );
      })}
    </div>
  );
};

export const TelemetryStrip = ({
  items,
  label = 'Telemetry strip'
}: {
  items: { label: string; value: string | number; tone: ValidationTone }[];
  label?: string;
}) => (
  <div className="micro-viz mt-2 grid grid-cols-3 gap-1" role="list" aria-label={label}>
    {items.map((item) => (
      <div key={item.label} className={`rounded border ${toneStyles[item.tone].border} bg-brand-bg/30 px-1.5 py-1`}>
        <p className="truncate text-[7px] font-black uppercase tracking-widest text-brand-text-dim">{item.label}</p>
        <p className={`truncate font-mono text-[9px] font-black ${toneStyles[item.tone].text}`}>{item.value}</p>
      </div>
    ))}
  </div>
);

export const PulseDots = ({
  tones,
  label = 'Signal dots'
}: {
  tones: ValidationTone[];
  label?: string;
}) => (
  <div className="micro-viz mt-2 flex items-center gap-1" role="img" aria-label={label} title={label}>
    {(tones.length > 0 ? tones : ['caution' as ValidationTone]).map((tone, index) => (
      <span
        key={`${tone}-${index}`}
        className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].bar}`}
        style={{ opacity: 0.32 + index * (0.5 / Math.max(1, tones.length - 1)) }}
      />
    ))}
  </div>
);

export const MiniDistribution = ({
  values,
  label = 'Mini distribution'
}: {
  values: number[];
  label?: string;
}) => {
  const negatives = values.filter((value) => value < 0).length;
  const flat = values.filter((value) => value === 0).length;
  const positives = values.filter((value) => value > 0).length;
  const total = Math.max(1, values.length);

  return (
    <div className="micro-viz mt-2 overflow-hidden rounded border border-brand-border/40 bg-brand-bg/30" role="img" aria-label={label} title={label}>
      <div className="flex h-2">
        {[
          ['fail', negatives],
          ['caution', flat],
          ['ready', positives]
        ].map(([tone, value]) => (
          <span key={tone as string} className={toneStyles[tone as ValidationTone].bar} style={{ width: `${((value as number) / total) * 100}%`, minWidth: value ? 2 : 0 }} />
        ))}
      </div>
      <div className="flex justify-between px-1 py-0.5 text-[7px] font-black uppercase tracking-widest text-brand-text-dim">
        <span>L {negatives}</span>
        <span>B {flat}</span>
        <span>W {positives}</span>
      </div>
    </div>
  );
};

export const ScoreTrendLine = ({
  score,
  tone,
  label = 'Score trend'
}: {
  score: number;
  tone: ValidationTone;
  label?: string;
}) => {
  const normalized = clamp(score);
  const marker = `${normalized}%`;

  return (
    <div className="micro-viz mt-3" role="img" aria-label={`${label}: ${Math.round(normalized)} percent`} title={`${label}: ${Math.round(normalized)}%`}>
      <div className="relative h-2 overflow-hidden rounded-full border border-brand-border/35 bg-brand-bg/65">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneTrack(tone)} transition-[width] duration-500 ease-out`}
          style={{ width: marker }}
        />
        <span
          className={`absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full ${toneStyles[tone].bar} shadow-[0_0_10px_currentColor]`}
          style={{ left: `calc(${marker} - 2px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 flex justify-between text-[7px] font-black uppercase tracking-widest text-brand-text-dim">
        <span>0</span>
        <span className={toneStyles[tone].text}>{Math.round(normalized)}</span>
        <span>100</span>
      </div>
    </div>
  );
};

export const RadialGauge = ({ score, tone }: { score: number; tone: ValidationTone }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const color = tone === 'ready' ? 'var(--brand-success)' : tone === 'caution' ? 'var(--brand-warning)' : 'var(--brand-danger)';

  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <div className={`strategy-pulse-ring absolute inset-3 rounded-full border ${toneStyles[tone].border}`} />
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--brand-border)" strokeWidth="9" opacity="0.45" />
        <circle cx="80" cy="80" r="68" fill="transparent" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 9" opacity="0.55" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="strategy-gauge-sweep"
          style={{ filter: `drop-shadow(0 0 ${tone === 'ready' ? 12 : tone === 'caution' ? 9 : 7}px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-black leading-none tracking-tighter ${toneStyles[tone].text}`}>{score}</span>
        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-brand-text-dim">Score</span>
      </div>
    </div>
  );
};

export const UnderwaterDrawdownChart = ({ data, tone }: { data: { trade: number; drawdown: number }[]; tone: ValidationTone }) => {
  const chartData = data.length > 0 ? data : [{ trade: 0, drawdown: 0 }];
  const width = 320;
  const height = 92;
  const maxDepth = Math.max(1, ...chartData.map((point) => Math.abs(point.drawdown)));
  const points = chartData.map((point, index) => {
    const x = chartData.length === 1 ? 0 : (index / (chartData.length - 1)) * width;
    const y = 12 + (Math.abs(point.drawdown) / maxDepth) * (height - 18);
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,12 ${points} ${width},12`;

  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-brand-border/60 bg-brand-bg/50 p-3">
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-danger/10 to-transparent" />
      <div className="absolute left-3 top-2 z-20 text-[7px] font-black uppercase tracking-widest text-brand-text-dim">0R Surface</div>
      <div className="absolute bottom-2 right-3 z-20 text-[7px] font-black uppercase tracking-widest text-brand-danger/70">-{maxDepth.toFixed(1)}R Depth</div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="relative z-10 h-full w-full">
        <defs>
          <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-warning)" stopOpacity="0.16" />
            <stop offset="45%" stopColor="var(--brand-warning)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-danger)" stopOpacity="0.56" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((line) => (
          <line key={line} x1="0" x2={width} y1={12 + line * (height - 18)} y2={12 + line * (height - 18)} stroke="var(--brand-border)" strokeOpacity="0.45" strokeDasharray="4 6" />
        ))}
        {[0.25, 0.5, 0.75].map((line) => (
          <text key={`axis-${line}`} x="3" y={12 + line * (height - 18) - 2} fill="var(--brand-text-dim)" fontSize="6" opacity="0.55">
            -{(maxDepth * line).toFixed(1)}
          </text>
        ))}
        <polyline points={`0,12 ${width},12`} fill="none" stroke="var(--brand-border)" strokeWidth="1" opacity="0.8" />
        <polygon points={areaPoints} fill="url(#drawdownFill)" className="strategy-chart-pulse" />
        <polyline points={points} fill="none" stroke={tone === 'ready' ? 'var(--brand-warning)' : tone === 'caution' ? 'var(--brand-warning)' : 'var(--brand-danger)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const RiskMetricCard = ({ label, value, tone, drilldown }: { label: string; value: string; tone: ValidationTone; drilldown?: DrilldownContent }) => (
  <div className="group rounded-lg border border-brand-border/60 bg-brand-bg/40 p-3 transition-all hover:shadow-[0_0_18px_rgba(248,113,113,0.05)]">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">
        <MetricLabel tone={tone} drilldown={drilldown}>RISK // {label}</MetricLabel>
      </p>
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].bar} strategy-blink`} />
    </div>
    <p className={`mt-1 text-lg font-black font-mono tracking-tighter ${toneStyles[tone].text}`}>{value}</p>
    <PulseDots tones={[tone, tone, tone === 'ready' ? 'caution' : tone, tone]} label={`${label} signal state`} />
  </div>
);

export const StabilityBar = ({ label, value, tone, drilldown }: { label: string; value: number; tone: ValidationTone; drilldown?: DrilldownContent }) => (
  <div className="rounded-lg border border-brand-border/50 bg-brand-bg/35 p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim">
        <MetricLabel tone={tone} drilldown={drilldown}>{label}</MetricLabel>
      </span>
      <span className={`text-[9px] font-black font-mono ${toneStyles[tone].text}`}>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-brand-border/30">
      <div className={`h-full rounded-full ${toneStyles[tone].bar}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
    <ScoreTrendLine score={value} tone={tone} label={`${label} score trend`} />
  </div>
);

export const VerdictTile = ({ label, value, tone, drilldown }: { label: string; value: string; tone: ValidationTone; drilldown?: DrilldownContent }) => (
  <div className={`rounded-lg border ${toneStyles[tone].border} ${toneStyles[tone].bg} p-3`}>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">
      <MetricLabel tone={tone} drilldown={drilldown}>{label}</MetricLabel>
    </p>
    <p className={`mt-1 text-2xl font-black uppercase tracking-tight ${toneStyles[tone].text}`}>{value}</p>
    <PulseDots tones={[tone, tone, tone]} label={`${label} verdict signal`} />
  </div>
);

export const ClusterTelemetry = ({ clusters }: { clusters: { start: number; length: number; severity: ValidationTone }[] }) => (
  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
    {(clusters.length > 0 ? clusters.slice(0, 3) : [{ start: 0, length: 0, severity: 'ready' as ValidationTone }]).map((cluster, index) => (
      <div key={`${cluster.start}-${index}`} className={`rounded-lg border ${toneStyles[cluster.severity].border} bg-brand-bg/35 p-3`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Cluster {index + 1}</span>
          <span className={`text-[9px] font-black uppercase ${toneStyles[cluster.severity].text}`}>{cluster.length || 'None'}</span>
        </div>
        <div className="flex h-7 items-end gap-1">
          {[0, 1, 2, 3, 4, 5].map((bar) => (
            <span
              key={bar}
              className={`flex-1 rounded-sm ${bar < cluster.length ? toneStyles[cluster.severity].bar : 'bg-brand-border/40'}`}
              style={{ height: `${bar < cluster.length ? 40 + bar * 8 : 18}%`, opacity: bar < cluster.length ? 0.45 + bar * 0.06 : 0.35 }}
            />
          ))}
        </div>
        <p className="mt-2 text-[8px] font-mono uppercase tracking-widest text-brand-text-dim">
          {cluster.length ? `Executions ${cluster.start + 1}-${cluster.start + cluster.length}` : 'No clustered losing period'}
        </p>
      </div>
    ))}
  </div>
);

export const DistributionBar = ({ label, value, total, tone, drilldown }: { label: string; value: number; total: number; tone: ValidationTone; drilldown?: DrilldownContent }) => (
  <div className="rounded-lg border border-brand-border/50 bg-brand-bg/35 p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">
        <MetricLabel tone={tone} drilldown={drilldown}>{label}</MetricLabel>
      </span>
      <span className={`text-[10px] font-black font-mono ${toneStyles[tone].text}`}>{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-brand-border/30">
      <div className={`h-full rounded-full ${toneStyles[tone].bar}`} style={{ width: `${total > 0 ? Math.min(100, (value / total) * 100) : 0}%` }} />
    </div>
  </div>
);
