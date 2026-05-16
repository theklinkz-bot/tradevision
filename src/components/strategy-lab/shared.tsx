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

export const RiskMetricCard = ({ label, value, tone }: { label: string; value: string; tone: ValidationTone }) => (
  <div className="group rounded-lg border border-brand-border/60 bg-brand-bg/40 p-3 transition-all hover:shadow-[0_0_18px_rgba(248,113,113,0.05)]">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">RISK // {label}</p>
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].bar} strategy-blink`} />
    </div>
    <p className={`mt-1 text-lg font-black font-mono tracking-tighter ${toneStyles[tone].text}`}>{value}</p>
  </div>
);

export const StabilityBar = ({ label, value, tone }: { label: string; value: number; tone: ValidationTone }) => (
  <div className="rounded-lg border border-brand-border/50 bg-brand-bg/35 p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim">{label}</span>
      <span className={`text-[9px] font-black font-mono ${toneStyles[tone].text}`}>{Math.round(value)}%</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-brand-border/30">
      <div className={`h-full rounded-full ${toneStyles[tone].bar}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

export const VerdictTile = ({ label, value, tone }: { label: string; value: string; tone: ValidationTone }) => (
  <div className={`rounded-lg border ${toneStyles[tone].border} ${toneStyles[tone].bg} p-3`}>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">{label}</p>
    <p className={`mt-1 text-2xl font-black uppercase tracking-tight ${toneStyles[tone].text}`}>{value}</p>
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

export const DistributionBar = ({ label, value, total, tone }: { label: string; value: number; total: number; tone: ValidationTone }) => (
  <div className="rounded-lg border border-brand-border/50 bg-brand-bg/35 p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">{label}</span>
      <span className={`text-[10px] font-black font-mono ${toneStyles[tone].text}`}>{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-brand-border/30">
      <div className={`h-full rounded-full ${toneStyles[tone].bar}`} style={{ width: `${total > 0 ? Math.min(100, (value / total) * 100) : 0}%` }} />
    </div>
  </div>
);
