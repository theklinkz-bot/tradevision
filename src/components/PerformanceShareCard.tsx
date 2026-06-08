import React from 'react';
import {
  Activity,
  BarChart3,
  Crosshair,
  Globe2,
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
  bgImage?: string; // e.g. "/assets/sharecards/wild1.png"
  flipped?: boolean; // stats on right side (for images with character on left)
}

// Images where character is on the LEFT — stats go RIGHT
export const FLIPPED_BG_IMAGES = ['/assets/sharecards/wild5.png', '/assets/sharecards/wild6.png'];

const AMBER  = '#FF9100';
const FIRE   = '#ff4500';
const DANGER = '#ef4444';

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
  footerUrl: 'flowtheedge.vercel.app',
} as const;

export const getEquityPath = (stats: TradeStats) => {
  const points = stats.equityCurve.map(item => item.equity);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const width = 1480;
  const height = 100;
  const step = points.length > 1 ? width / (points.length - 1) : width;

  return points.map((value, index) => {
    const x = index * step;
    const y = height - 10 - ((value - min) / span) * 80;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
};

const formatSnapshotDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
};

/* ── Rank system ─────────────────────────────────────────── */
type Rank = 'UR' | 'SSR' | 'SR' | 'R';
const getRank = (winRate: number): Rank => {
  if (winRate >= 90) return 'UR';
  if (winRate >= 70) return 'SSR';
  if (winRate >= 50) return 'SR';
  return 'R';
};
const RANK_META: Record<Rank, { color: string; border: string; bg: string; glow: string; label: string }> = {
  UR:  { color: '#FFD700', border: 'rgba(255,215,0,0.70)', bg: 'rgba(0,0,0,0.70)', glow: '0 0 28px rgba(255,215,0,0.55)', label: 'LEGENDARY' },
  SSR: { color: '#c084fc', border: 'rgba(192,132,252,0.60)', bg: 'rgba(0,0,0,0.70)', glow: '0 0 28px rgba(192,132,252,0.45)', label: 'RARE+' },
  SR:  { color: '#60a5fa', border: 'rgba(96,165,250,0.55)', bg: 'rgba(0,0,0,0.70)', glow: '0 0 24px rgba(96,165,250,0.40)', label: 'RARE' },
  R:   { color: '#9ca3af', border: 'rgba(156,163,175,0.40)', bg: 'rgba(0,0,0,0.70)', glow: 'none', label: 'STANDARD' },
};

/* ── Stat row for the grid ─────────────────────────────── */
const StatCell = ({
  label,
  value,
  color = '#ffffff',
  size = 'normal',
}: {
  label: string;
  value: string;
  color?: string;
  size?: 'normal' | 'large';
}) => (
  <div className="flex flex-col gap-1">
    <span
      className="font-black uppercase leading-none"
      style={{ fontSize: size === 'large' ? 13 : 11, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)' }}
    >
      {label}
    </span>
    <span
      className="font-black leading-none tabular-nums"
      style={{ fontSize: size === 'large' ? 34 : 28, color }}
    >
      {value}
    </span>
  </div>
);

/* ── Logo mark ───────────────────────────────────────────── */
const LogoMark = ({ size = 36 }: { size?: number }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div
      className="absolute left-1/2 top-0 -translate-x-1/2"
      style={{
        width: size * 0.72,
        height: size * 0.55,
        background: AMBER,
        clipPath: 'polygon(50% 0,100% 24%,100% 58%,50% 100%,0 58%,0 24%)',
        boxShadow: `0 0 14px ${AMBER}99`,
      }}
    />
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{
        top: size * 0.35,
        width: size * 0.80,
        height: size * 0.38,
        borderBottom: `${size * 0.10}px solid ${FIRE}`,
        borderLeft: `${size * 0.10}px solid ${FIRE}`,
        borderRight: `${size * 0.10}px solid ${FIRE}`,
        clipPath: 'polygon(0 0,50% 62%,100% 0,100% 38%,50% 100%,0 38%)',
        opacity: 0.85,
        boxShadow: `0 0 10px ${FIRE}88`,
      }}
    />
  </div>
);

/* ── Corner diamond ornament ─────────────────────────────── */
const CornerDiamond = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => (
  <div
    style={{
      position: 'absolute',
      width: 12, height: 12,
      background: AMBER,
      transform: 'rotate(45deg)',
      boxShadow: `0 0 12px ${AMBER}`,
      zIndex: 20,
      ...(pos === 'tl' ? { top: -6, left: -6 } : {}),
      ...(pos === 'tr' ? { top: -6, right: -6 } : {}),
      ...(pos === 'bl' ? { bottom: -6, left: -6 } : {}),
      ...(pos === 'br' ? { bottom: -6, right: -6 } : {}),
    }}
  />
);

/* ── Main card ────────────────────────────────────────────── */
export const PerformanceShareCard = React.forwardRef<HTMLDivElement, PerformanceShareCardProps>(
  ({ stats, snapshotDate, bgImage, flipped = false }, ref) => {
    const values    = getShareStatValues(stats);
    const date      = snapshotDate ?? formatSnapshotDate();
    const hasEquity = stats.equityCurve.length > 0;
    const equityPath = hasEquity ? getEquityPath(stats) : '';
    const winRateNum = stats.winRate ?? 0;
    const rank       = getRank(winRateNum);
    const rankMeta   = RANK_META[rank];

    const hasBg = Boolean(bgImage);

    return (
      <div
        ref={ref}
        className="relative isolate overflow-hidden font-mono text-white"
        style={{
          width: 1640,
          height: 922,
          background: hasBg ? '#000000' : '#05050a',
          border: `2px solid ${AMBER}55`,
          borderRadius: 40,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 60px ${AMBER}28`,
        }}
      >
        <CornerDiamond pos="tl" />
        <CornerDiamond pos="tr" />
        <CornerDiamond pos="bl" />
        <CornerDiamond pos="br" />

        {/* ── BACKGROUND ─────────────────────────────────── */}
        {hasBg ? (
          <>
            {/* full-bleed image */}
            <img
              src={bgImage}
              alt=""
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                zIndex: -30,
              }}
              crossOrigin="anonymous"
            />
            {/* dark gradient — covers stat side only, character side stays clear */}
            <div
              style={{
                position: 'absolute', inset: 0, zIndex: -20,
                background: flipped
                  ? `linear-gradient(to left,
                      rgba(0,0,0,0.97) 0%,
                      rgba(0,0,0,0.96) 28%,
                      rgba(0,0,0,0.88) 42%,
                      rgba(0,0,0,0.45) 52%,
                      rgba(0,0,0,0.10) 60%,
                      rgba(0,0,0,0.00) 68%
                    )`
                  : `linear-gradient(to right,
                      rgba(0,0,0,0.97) 0%,
                      rgba(0,0,0,0.96) 28%,
                      rgba(0,0,0,0.88) 42%,
                      rgba(0,0,0,0.45) 52%,
                      rgba(0,0,0,0.10) 60%,
                      rgba(0,0,0,0.00) 68%
                    )`,
              }}
            />
            {/* top/bottom edge darkening */}
            <div
              style={{
                position: 'absolute', inset: 0, zIndex: -19,
                background: `
                  linear-gradient(to bottom,
                    rgba(0,0,0,0.55) 0%,
                    transparent 18%,
                    transparent 75%,
                    rgba(0,0,0,0.70) 100%
                  )
                `,
              }}
            />
          </>
        ) : (
          /* original gradient background */
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: -30,
              background: `
                radial-gradient(ellipse 55% 70% at 32% 48%, rgba(255,145,0,0.14) 0%, transparent 65%),
                radial-gradient(ellipse 35% 45% at 78% 55%, rgba(255,69,0,0.08) 0%, transparent 60%),
                linear-gradient(160deg, #0d0804 0%, #05050a 45%, #060402 100%)
              `,
            }}
          />
        )}

        {/* ── CARD CONTENT ─────────────────────────────────── */}
        <div
          className="relative flex h-full flex-col"
          style={{
            padding: '36px 44px',
            gap: 0,
            zIndex: 10,
            alignItems: flipped ? 'flex-end' : 'flex-start',
          }}
        >
          {/* ── HEADER ──────────────────────────────────────── */}
          <header className="flex items-center shrink-0" style={{ marginBottom: 28, gap: 28, width: '62%', flexDirection: flipped ? 'row-reverse' : 'row' }}>
            {/* left: logo + wordmark */}
            <div className="flex items-center gap-4">
              <LogoMark size={38} />
              <div>
                <p
                  className="font-black uppercase leading-none"
                  style={{ fontSize: 22, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.92)' }}
                >
                  FLOW THE EDGE
                </p>
                <p
                  className="font-black uppercase"
                  style={{ fontSize: 11, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.30)', marginTop: 4 }}
                >
                  Performance Card
                </p>
              </div>
            </div>

            {/* center: rank badge */}
            <div
              className="flex items-center gap-3 rounded-full border px-6 py-2.5"
              style={{
                borderColor: rankMeta.border,
                background: rankMeta.bg,
                boxShadow: rankMeta.glow,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="font-black uppercase leading-none"
                style={{
                  fontSize: 28,
                  letterSpacing: '0.10em',
                  color: rankMeta.color,
                  textShadow: `0 0 20px ${rankMeta.color}`,
                  ...(rank === 'UR' ? {
                    background: 'linear-gradient(135deg, #FFD700, #FFF0A0, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                  } : {}),
                }}
              >
                {rank}
              </span>
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
              <span
                className="font-black uppercase"
                style={{ fontSize: 12, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.50)' }}
              >
                {rankMeta.label}
              </span>
            </div>

            {/* right: date + trades */}
            <div className="text-right">
              <p
                className="font-black uppercase"
                style={{ fontSize: 12, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)' }}
              >
                SNAPSHOT
              </p>
              <p
                className="font-black uppercase"
                style={{ fontSize: 22, letterSpacing: '0.08em', color: AMBER, marginTop: 4 }}
              >
                {date}
              </p>
              <p
                className="font-black uppercase"
                style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.30)', marginTop: 3 }}
              >
                {values.totalTrades} TRADES
              </p>
            </div>
          </header>

          {/* ── BODY — stat column on one side, character side clear ── */}
          <div className="flex flex-1 min-h-0" style={{ flexDirection: flipped ? 'row-reverse' : 'row', width: '100%' }}>
            <div className="flex flex-col justify-center" style={{ width: '50%' }}>

              {/* wins / losses pill badges */}
              <div className="flex items-center" style={{ gap: 16, marginBottom: 12 }}>
                <div
                  className="flex items-center font-black uppercase"
                  style={{
                    gap: 12, padding: '10px 24px', borderRadius: 6,
                    background: `linear-gradient(135deg, rgba(255,145,0,0.28) 0%, rgba(255,145,0,0.10) 100%)`,
                    border: `1px solid ${AMBER}88`,
                    boxShadow: `0 0 28px ${AMBER}44, inset 0 1px 0 ${AMBER}33, inset 0 0 20px ${AMBER}10`,
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                  }}
                >
                  <Zap size={18} style={{ color: AMBER, filter: `drop-shadow(0 0 6px ${AMBER})` }} />
                  <span style={{ fontSize: 11, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.55)' }}>WINS</span>
                  <span className="tabular-nums" style={{ fontSize: 38, color: AMBER, lineHeight: 1, fontStyle: 'italic', textShadow: `0 0 20px ${AMBER}cc, 0 0 40px ${AMBER}55`, WebkitTextStroke: `1px ${AMBER}66` }}>{values.wins}</span>
                </div>
                <div style={{ width: 2, height: 32, background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)` }} />
                <div
                  className="flex items-center font-black uppercase"
                  style={{
                    gap: 12, padding: '10px 24px', borderRadius: 6,
                    background: `linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.08) 100%)`,
                    border: `1px solid rgba(239,68,68,0.60)`,
                    boxShadow: `0 0 28px rgba(239,68,68,0.35), inset 0 1px 0 rgba(239,68,68,0.20), inset 0 0 20px rgba(239,68,68,0.08)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                  }}
                >
                  <Shield size={18} style={{ color: DANGER, filter: `drop-shadow(0 0 6px ${DANGER})` }} />
                  <span style={{ fontSize: 11, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.55)' }}>LOSSES</span>
                  <span className="tabular-nums" style={{ fontSize: 38, color: DANGER, lineHeight: 1, fontStyle: 'italic', textShadow: `0 0 20px ${DANGER}cc, 0 0 40px ${DANGER}55`, WebkitTextStroke: `1px ${DANGER}66` }}>{values.losses}</span>
                </div>
              </div>

              {/* BIG WIN RATE */}
              <div className="flex items-end leading-none" style={{ gap: 4 }}>
                <span
                  className="font-black italic tabular-nums"
                  style={{
                    fontSize: 190,
                    lineHeight: 0.86,
                    color: '#ffffff',
                    textShadow: `0 0 36px ${AMBER}cc, 0 0 72px ${AMBER}55, 0 0 130px ${FIRE}33, 0 8px 24px rgba(0,0,0,0.95)`,
                  }}
                >
                  {values.winRate}
                </span>
                <span
                  className="font-black italic"
                  style={{ fontSize: 72, lineHeight: 1, marginBottom: 20, color: AMBER, textShadow: `0 0 20px ${AMBER}aa` }}
                >
                  %
                </span>
              </div>

              <p className="font-black uppercase italic" style={{ fontSize: 13, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.75)', marginTop: 8, marginBottom: 18, textShadow: `0 0 18px ${AMBER}88, 0 0 40px ${AMBER}33`, WebkitTextStroke: '0.5px rgba(255,145,0,0.40)' }}>
                ◆ WIN RATE ◆
              </p>

              {/* ── manga slash divider ── */}
              <div style={{ position: 'relative', marginBottom: 18, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ height: 3, flex: 1, background: `linear-gradient(to right, ${AMBER}, ${AMBER}44, transparent)`, clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)' }} />
                <span style={{ fontSize: 9, letterSpacing: '0.40em', color: `${AMBER}88`, fontWeight: 900, whiteSpace: 'nowrap' }}>PERFORMANCE DATA</span>
                <div style={{ height: 1, width: 40, background: `${AMBER}33` }} />
              </div>

              {/* ── HERO STATS — manga panel style ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                {[
                  { Icon: TrendingUp, label: 'NET R',      value: values.netProfit,        color: AMBER,  accent: AMBER  },
                  { Icon: Activity,   label: 'EXPECTANCY', value: `${values.expectancy}R`,  color: AMBER,  accent: AMBER  },
                  { Icon: Crosshair,  label: 'MAX DD',     value: `${values.maxDrawdown}R`, color: DANGER, accent: DANGER },
                ].map(({ Icon, label, value, color, accent }, i) => (
                  <div
                    key={label}
                    className="flex flex-col justify-center font-black"
                    style={{
                      padding: '14px 18px 18px',
                      background: `linear-gradient(135deg, rgba(0,0,0,0.96) 0%, ${accent}0d 100%)`,
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${accent}33`,
                      borderLeft: `4px solid ${accent}`,
                      borderBottom: `2px solid ${accent}55`,
                      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                      boxShadow: `inset 0 0 40px ${accent}10, 0 0 22px ${accent}22`,
                      transform: i === 1 ? 'none' : undefined,
                    }}
                  >
                    <div className="flex items-center uppercase" style={{ gap: 6, marginBottom: 8 }}>
                      <Icon size={13} style={{ color: accent }} />
                      <span style={{ fontSize: 11, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', fontWeight: 900 }}>{label}</span>
                    </div>
                    <span
                      className="tabular-nums leading-none"
                      style={{
                        fontSize: 52,
                        color,
                        fontStyle: 'italic',
                        textShadow: `0 0 30px ${accent}99, 0 2px 0 rgba(0,0,0,0.9)`,
                        WebkitTextStroke: `1px ${accent}44`,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── SECONDARY STATS — bold horizontal strip ── */}
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  border: `1px solid ${AMBER}22`,
                  borderTop: `2px solid ${AMBER}66`,
                  background: 'rgba(0,0,0,0.75)',
                  overflow: 'hidden',
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
                }}
              >
                {[
                  { Icon: Scale,     label: 'PROFIT FACTOR', value: values.profitFactor },
                  { Icon: BarChart3, label: 'AVG R:R',        value: values.avgRR       },
                  { Icon: Zap,       label: 'TOTAL TRADES',   value: values.totalTrades  },
                ].map(({ Icon, label, value }, i) => (
                  <div
                    key={label}
                    className="flex items-center font-black"
                    style={{
                      flex: 1,
                      padding: '14px 18px',
                      gap: 12,
                      borderRight: i < 2 ? `1px solid ${AMBER}18` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div className="flex items-center uppercase" style={{ gap: 5 }}>
                        <Icon size={10} style={{ color: `${AMBER}88` }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.38)' }}>{label}</span>
                      </div>
                      <span
                        className="tabular-nums leading-none"
                        style={{
                          fontSize: 36,
                          color: AMBER,
                          fontStyle: 'italic',
                          textShadow: `0 0 22px ${AMBER}bb, 0 0 44px ${AMBER}44, 0 2px 0 rgba(0,0,0,0.9)`,
                          WebkitTextStroke: `1px ${AMBER}55`,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right half: intentionally empty — character shows through */}
            <div style={{ flex: 1 }} />
          </div>


          {/* ── FOOTER ────────────────────────────────────────── */}
          <footer
            className="shrink-0 flex items-center justify-between"
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.07)',
              width: '50%',
            }}
          >
            <div className="flex items-center" style={{ gap: 14 }}>
              <LogoMark size={28} />
              <div
                className="flex items-center"
                style={{
                  gap: 10,
                  borderRadius: 999,
                  border: `1px solid ${AMBER}44`,
                  padding: '6px 18px',
                  boxShadow: `0 0 14px ${AMBER}18`,
                  background: 'rgba(0,0,0,0.60)',
                }}
              >
                <Globe2 size={16} style={{ color: AMBER }} />
                <span className="font-black" style={{ fontSize: 16, letterSpacing: '0.12em', color: AMBER }}>
                  {SHARE_CARD_COPY.footerUrl}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p
                className="font-black uppercase"
                style={{ fontSize: 11, letterSpacing: '0.30em', color: 'rgba(255,255,255,0.22)' }}
              >
                Powered by Flow the Edge
              </p>
            </div>

            <div className="text-right">
              <p
                className="font-black uppercase"
                style={{ fontSize: 12, letterSpacing: '0.20em', color: 'rgba(255,255,255,0.30)' }}
              >
                {date}
              </p>
              <p
                className="font-black uppercase"
                style={{ fontSize: 16, letterSpacing: '0.12em', color: `${AMBER}cc`, marginTop: 3 }}
              >
                {values.totalTrades} Total Trades
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

PerformanceShareCard.displayName = 'PerformanceShareCard';

