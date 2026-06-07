import React from 'react';
import {
  Activity,
  BarChart3,
  Crosshair,
  Globe2,
  RadioTower,
  Scale,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { TradeStats } from '../types';

type AppTheme = 'default' | 'light' | 'tactical' | 'cyber' | 'nexus' | 'claude';

export interface PerformanceShareCardProps {
  stats: TradeStats;
  theme?: AppTheme;
  snapshotDate?: string;
}

const LIME = '#FF9100';
const CYAN = '#00e5ff';
const MAGENTA = '#ff007a';
const ORANGE = '#ff7a32';
const PANEL = 'rgba(2,5,12,0.68)';

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
  const wins = isUsableNumber(stats.totalTrades) && isUsableNumber(stats.winRate)
    ? Math.round((stats.totalTrades * stats.winRate) / 100)
    : Number.NaN;
  const losses = isUsableNumber(stats.totalTrades) && isUsableNumber(wins)
    ? Math.max(stats.totalTrades - wins, 0)
    : Number.NaN;
  const lastEquity = stats.equityCurve.length > 0
    ? stats.equityCurve[stats.equityCurve.length - 1].equity
    : Number.NaN;

  return {
    winRate: formatShareInteger(stats.winRate),
    profitFactor: formatShareDecimal(stats.profitFactor, 2),
    netProfit: formatShareSigned(lastEquity, 2),
    maxDrawdown: formatShareSigned(-stats.maxDrawdown, 1),
    avgRR: isUsableNumber(stats.avgRR) ? `1:${stats.avgRR.toFixed(1)}` : '--',
    expectancy: formatShareSigned(stats.expectancy, 1),
    totalTrades: formatShareInteger(stats.totalTrades),
    wins: formatShareInteger(wins),
    losses: formatShareInteger(losses),
  };
};

export const SHARE_CARD_COPY = {
  mode: 'AFTERBURNER MODE',
  headline: 'I BROKE THE CURVE.',
  heroLabel: 'WIN RATE',
  footerUrl: 'flowtheedge.app',
} as const;

const LogoMark = () => (
  <div className="relative h-12 w-12 shrink-0">
    <div className="absolute left-1/2 top-0 h-6 w-9 -translate-x-1/2 bg-[#FF9100] shadow-[0_0_22px_rgba(255,145,0,0.78)] [clip-path:polygon(50%_0,100%_24%,100%_58%,50%_100%,0_58%,0_24%)]" />
    <div className="absolute left-1/2 top-[17px] h-[17px] w-10 -translate-x-1/2 border-b-[5px] border-l-[5px] border-r-[5px] border-[#00e5ff] opacity-90 shadow-[0_0_16px_rgba(0,229,255,0.55)] [clip-path:polygon(0_0,50%_62%,100%_0,100%_38%,50%_100%,0_38%)]" />
    <div className="absolute left-1/2 top-[32px] h-[13px] w-8 -translate-x-1/2 border-b-[4px] border-l-[4px] border-r-[4px] border-[#ff007a] opacity-75 [clip-path:polygon(0_0,50%_66%,100%_0,100%_42%,50%_100%,0_42%)]" />
  </div>
);

const GlitchText = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`relative inline-block ${className}`}>
    <span className="absolute inset-0 translate-x-[5px] text-[#ff007a] opacity-70 blur-[1px]" aria-hidden="true">
      {children}
    </span>
    <span className="absolute inset-0 -translate-x-[5px] text-[#00e5ff] opacity-70 blur-[1px]" aria-hidden="true">
      {children}
    </span>
    <span className="relative">{children}</span>
  </span>
);

const HudChip = ({
  label,
  value,
  tone = LIME,
}: {
  label: string;
  value: string;
  tone?: string;
}) => (
  <div
    className="relative min-w-0 overflow-hidden rounded-[12px] border bg-black/56 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    style={{
      borderColor: `${tone}66`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px ${tone}24`,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tone}, transparent)` }} />
    <p className="truncate text-[18px] font-black uppercase tracking-[0.20em] text-white/48">{label}</p>
    <p className="mt-2 truncate text-[42px] font-black leading-none" style={{ color: tone, textShadow: `0 0 20px ${tone}88` }}>
      {value}
    </p>
  </div>
);

const StatPill = ({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  tone: string;
}) => (
  <div
    className="grid h-[78px] grid-cols-[46px_68px_minmax(0,1fr)] items-center gap-4 rounded-[16px] border bg-black/58 px-5"
    style={{
      borderColor: `${tone}66`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 22px ${tone}26`,
    }}
  >
    <Icon size={34} strokeWidth={2.25} style={{ color: tone, filter: `drop-shadow(0 0 9px ${tone})` }} />
    <span className="text-center text-[43px] font-black leading-none" style={{ color: tone }}>
      {value}
    </span>
    <span className="truncate text-[22px] font-black uppercase tracking-[0.18em] text-white/80">{label}</span>
  </div>
);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  tone = LIME,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: string;
}) => (
  <div
    className="min-w-0 overflow-hidden rounded-[14px] border bg-black/54 p-5"
    style={{
      borderColor: `${tone}4d`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px ${tone}20`,
    }}
  >
    <div className="flex h-full items-center gap-5">
      <div
        className="grid size-[68px] shrink-0 place-items-center rounded-[18px] border bg-black/48"
        style={{ borderColor: `${tone}55`, color: tone, boxShadow: `0 0 20px ${tone}28` }}
      >
        <Icon size={38} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[18px] font-black uppercase tracking-[0.16em] text-white/50">{label}</p>
        <p className="mt-2 truncate text-[48px] font-black leading-none" style={{ color: tone, textShadow: `0 0 18px ${tone}66` }}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const getEquityPath = (stats: TradeStats) => {
  const points = stats.equityCurve.map(item => item.equity);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const width = 1480;
  const height = 132;
  const step = points.length > 1 ? width / (points.length - 1) : width;

  return points.map((value, index) => {
    const x = index * step;
    const y = height - 12 - ((value - min) / span) * 112;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
};

const formatSnapshotDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
};

export const PerformanceShareCard = React.forwardRef<HTMLDivElement, PerformanceShareCardProps>(
  ({ stats, snapshotDate }, ref) => {
    const values = getShareStatValues(stats);
    const date = snapshotDate ?? formatSnapshotDate();
    const hasEquity = stats.equityCurve.length > 0;
    const equityPath = hasEquity ? getEquityPath(stats) : '';

    return (
      <div
        ref={ref}
        className="relative isolate aspect-video w-[1640px] overflow-hidden rounded-[42px] border bg-[#05050a] p-[44px] font-mono text-white"
        style={{
          borderColor: 'rgba(0,229,255,0.42)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 74px rgba(0,229,255,0.20), inset 0 0 120px rgba(0,0,0,0.92)',
        }}
      >
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_12%,rgba(255,0,122,0.30),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(0,229,255,0.26),transparent_28%),radial-gradient(circle_at_52%_96%,rgba(57,255,20,0.18),transparent_30%),linear-gradient(135deg,#09031b_0%,#030408_58%,#06170d_100%)]" />
        <div className="absolute inset-0 -z-20 opacity-70 [background-image:linear-gradient(rgba(0,229,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,122,0.07)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_9px)]" />

        <div className="absolute left-[-14%] top-[47%] -z-10 h-[4px] w-[132%] -rotate-[12deg] bg-gradient-to-r from-transparent via-[#00e5ff] via-45% to-transparent shadow-[0_0_34px_rgba(0,229,255,0.92)]" />
        <div className="absolute left-[-10%] top-[57%] -z-10 h-[2px] w-[126%] -rotate-[12deg] bg-gradient-to-r from-transparent via-[#ff007a] to-transparent shadow-[0_0_28px_rgba(255,0,122,0.72)]" />
        <div className="absolute bottom-[18%] right-[-10%] -z-10 h-[140px] w-[680px] -rotate-[16deg] bg-gradient-to-r from-transparent via-[rgba(57,255,20,0.18)] to-transparent blur-2xl" />

        <div className="pointer-events-none absolute right-[22%] top-[7%] h-[92px] w-[220px] border-y border-[#ff007a]/42 opacity-80">
          <div className="mt-5 h-3 w-full bg-[#ff007a]/36 shadow-[0_0_20px_rgba(255,0,122,0.72)]" />
          <div className="mt-4 h-2 w-3/5 bg-[#00e5ff]/48 shadow-[0_0_18px_rgba(0,229,255,0.72)]" />
        </div>

        <div className={`grid h-full gap-4 ${hasEquity ? 'grid-rows-[104px_360px_208px_164px_54px]' : 'grid-rows-[104px_360px_164px_54px]'}`}>
          <header className="grid grid-cols-[1fr_auto] items-start gap-6">
            <div className="flex min-w-0 items-center gap-6">
              <LogoMark />
              <div className="min-w-0">
                <p className="truncate text-[30px] font-black uppercase italic tracking-[0.44em] text-white/92">
                  TRADEVISION
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="inline-flex h-9 items-center gap-3 rounded-full border bg-black/50 px-5 text-[16px] font-black uppercase tracking-[0.20em]"
                    style={{ borderColor: `${MAGENTA}80`, color: MAGENTA, boxShadow: `0 0 20px ${MAGENTA}33` }}
                  >
                    <RadioTower size={18} />
                    {SHARE_CARD_COPY.mode}
                  </span>
                  <span className="text-[16px] font-black uppercase tracking-[0.22em] text-white/36">STATIC PNG EXPORT</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[104px_180px] gap-4">
              <div
                className="grid h-[96px] place-items-center rounded-[18px] border bg-black/54"
                style={{ borderColor: `${LIME}88`, boxShadow: `0 0 36px ${LIME}30, inset 0 0 22px ${LIME}14` }}
              >
                <div className="text-center">
                  <Scale size={26} className="mx-auto mb-1" style={{ color: LIME }} />
                  <p className="text-[35px] font-black leading-none" style={{ color: LIME, textShadow: `0 0 18px ${LIME}` }}>S</p>
                  <p className="mt-1 text-[14px] font-black uppercase tracking-[0.18em]" style={{ color: CYAN }}>TIER</p>
                </div>
              </div>
              <div className="rounded-[18px] border border-white/12 bg-black/46 px-5 py-4 text-right">
                <p className="text-[15px] font-black uppercase tracking-[0.20em] text-white/42">SNAPSHOT</p>
                <p className="mt-2 text-[25px] font-black uppercase tracking-[0.08em]" style={{ color: CYAN }}>{date}</p>
              </div>
            </div>
          </header>

          <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_390px] gap-8">
            <div className="relative min-w-0">
              <div className="absolute left-1 top-6 h-[62px] w-[88%] -skew-x-12 bg-[#ff007a]/12 blur-xl" />
              <h1 className="relative max-w-[900px] text-[90px] font-black uppercase italic leading-[0.92] text-white">
                <GlitchText>{SHARE_CARD_COPY.headline}</GlitchText>
              </h1>

              <div className="relative mt-8 inline-flex items-end leading-none">
                <div className="absolute left-[-18px] top-[54%] h-12 w-[102%] -translate-y-1/2 bg-gradient-to-r from-transparent via-[rgba(57,255,20,0.92)] to-transparent blur-lg" />
                <span
                  className="relative text-[216px] font-black italic text-white"
                  style={{
                    textShadow: `8px 0 0 ${MAGENTA}, -8px 0 0 ${CYAN}, 0 0 34px ${LIME}, 0 0 82px rgba(255,145,0,0.58), 0 12px 34px rgba(0,0,0,0.82)`,
                  }}
                >
                  {values.winRate}
                </span>
                <span
                  className="relative ml-5 mb-8 text-[86px] font-black italic text-white"
                  style={{ textShadow: `4px 0 0 ${MAGENTA}, -4px 0 0 ${CYAN}, 0 0 28px ${LIME}` }}
                >
                  %
                </span>
                <div
                  className="relative mb-9 ml-8 rounded-[14px] border bg-black/58 px-5 py-3 text-[24px] font-black uppercase tracking-[0.24em]"
                  style={{ borderColor: `${LIME}66`, color: LIME, boxShadow: `0 0 24px ${LIME}24` }}
                >
                  {SHARE_CARD_COPY.heroLabel}
                </div>
              </div>
            </div>

            <aside className="grid min-h-0 grid-rows-4 gap-4">
              <StatPill icon={Zap} value={values.wins} label="WINS" tone={LIME} />
              <StatPill icon={Shield} value={values.losses} label="LOSS" tone={ORANGE} />
              <StatPill icon={BarChart3} value={values.totalTrades} label="TRADES" tone={CYAN} />
              <HudChip label="PROFIT FACTOR" value={values.profitFactor} tone={MAGENTA} />
            </aside>
          </section>

          {hasEquity && <section
            className="relative min-h-0 overflow-hidden rounded-[20px] border px-8 pb-5 pt-6"
            style={{
              borderColor: 'rgba(0,229,255,0.35)',
              background: PANEL,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 28px rgba(0,229,255,0.13)',
            }}
          >
            <div className="flex items-center justify-between gap-5">
              <p className="truncate text-[28px] font-black uppercase tracking-[0.34em]" style={{ color: CYAN }}>
                EQUITY AFTERBURN
              </p>
              <p className="truncate text-[24px] font-black uppercase tracking-[0.18em] text-white/45">
                NET <span style={{ color: LIME }}>{values.netProfit}</span>
              </p>
            </div>
            <div className="absolute inset-x-8 bottom-5 top-[70px] overflow-hidden rounded-[14px]">
              <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(0,229,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,122,0.08)_1px,transparent_1px)] [background-size:58px_34px]" />
              <svg className="relative h-full w-full" viewBox="0 0 1480 132" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="tvShareGlitchFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={LIME} stopOpacity="0.42" />
                    <stop offset="100%" stopColor={LIME} stopOpacity="0" />
                  </linearGradient>
                  <filter id="tvShareGlitchGlow" x="-4%" y="-80%" width="108%" height="260%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d={`${equityPath} L 1480 132 L 0 132 Z`} fill="url(#tvShareGlitchFill)" />
                <path d={equityPath} fill="none" stroke={MAGENTA} strokeLinecap="round" strokeLinejoin="round" strokeWidth="9" opacity="0.38" />
                <path d={equityPath} fill="none" stroke={CYAN} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" opacity="0.56" transform="translate(-5 0)" />
                <path d={equityPath} fill="none" stroke={LIME} strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" filter="url(#tvShareGlitchGlow)" />
                <circle cx="1480" cy="20" r="22" fill={LIME} opacity="0.24" />
                <circle cx="1480" cy="20" r="9" fill={LIME} />
              </svg>
            </div>
          </section>}

          <section className="grid min-h-0 grid-cols-4 gap-4">
            <MetricCard icon={TrendingUp} label="NET P/L" value={values.netProfit} tone={LIME} />
            <MetricCard icon={Activity} label="PROFIT FACTOR" value={values.profitFactor} tone={MAGENTA} />
            <MetricCard icon={Scale} label="RISK:REWARD" value={values.avgRR} tone={CYAN} />
            <MetricCard icon={Crosshair} label="EXPECTANCY" value={values.expectancy} tone={LIME} />
          </section>

          <footer className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 border-t border-white/10 pt-3">
            <div className="min-w-0 truncate text-[24px] font-black uppercase tracking-[0.20em] text-white/46">
              MAX DD <span style={{ color: ORANGE }}>{values.maxDrawdown}R</span>
            </div>
            <div
              className="flex min-w-0 items-center gap-4 rounded-full border bg-black/58 px-12 py-3 text-[27px] font-black tracking-[0.16em]"
              style={{ borderColor: `${CYAN}55`, boxShadow: `0 0 22px ${CYAN}24` }}
            >
              <Globe2 size={30} style={{ color: LIME }} />
              <span className="truncate" style={{ color: LIME }}>{SHARE_CARD_COPY.footerUrl}</span>
            </div>
            <div className="min-w-0 truncate text-right text-[24px] font-black uppercase tracking-[0.20em] text-white/46">
              GLITCH BRAG <span style={{ color: MAGENTA }}>ONLINE</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

PerformanceShareCard.displayName = 'PerformanceShareCard';
