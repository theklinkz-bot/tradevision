import React from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  CalendarDays,
  Crosshair,
  Gauge,
  LineChart,
  RadioTower,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { AnalysisHistoryItem, TradeStats, TranslationSchema } from '../types';
import { EquityChart } from './EquityChart';

interface AnalyticsCommandCenterProps {
  stats: TradeStats;
  history: AnalysisHistoryItem[];
  t: TranslationSchema;
}

const formatR = (value: number, signed = false) => {
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}R`;
};

const MiniBars = ({ values, tone = 'accent' }: { values: number[]; tone?: 'accent' | 'risk' | 'cyan' }) => {
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  const toneClass = tone === 'risk' ? 'bg-brand-danger/70' : tone === 'cyan' ? 'bg-cyan-300/70' : 'bg-brand-accent/75';

  return (
    <div className="flex h-8 items-end gap-1">
      {values.slice(-12).map((value, index) => (
        <span
          key={`${value}-${index}`}
          className={`w-1.5 rounded-t-sm ${toneClass}`}
          style={{ height: `${18 + (Math.abs(value) / max) * 82}%`, opacity: 0.28 + index / 18 }}
        />
      ))}
    </div>
  );
};

const TelemetryLine = ({ label, value, active = false }: { label: string; value: string; active?: boolean }) => (
  <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.04] py-2 last:border-b-0">
    <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-dim">{label}</span>
    <span className={`min-w-0 truncate text-right font-mono text-xs font-black ${active ? 'text-brand-accent' : 'text-brand-text-bright'}`}>{value}</span>
  </div>
);

const StatChip = ({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'positive' | 'negative' | 'warning' | 'neutral' }) => {
  const toneClass = {
    positive: 'border-brand-accent/25 bg-brand-accent/[0.07] text-brand-accent',
    negative: 'border-brand-danger/25 bg-brand-danger/[0.07] text-brand-danger',
    warning: 'border-brand-warning/25 bg-brand-warning/[0.07] text-brand-warning',
    neutral: 'border-white/[0.08] bg-white/[0.03] text-brand-text-bright'
  }[tone];

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-brand-text-dim">{label}</div>
      <div className="mt-1 font-mono text-lg font-black tabular-nums">{value}</div>
    </div>
  );
};

const AnalysisCard = ({
  title,
  eyebrow,
  icon: Icon,
  children,
  sparkValues,
  tone = 'accent'
}: {
  title: string;
  eyebrow: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  sparkValues: number[];
  tone?: 'accent' | 'risk' | 'cyan';
}) => (
  <motion.section
    whileHover={{ y: -3 }}
    transition={{ duration: 0.18 }}
    className="analytics-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-elevated/50 p-5 shadow-2xl"
  >
    <div className="analytics-grid-overlay opacity-20" />
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-brand-accent/70">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-black uppercase tracking-[-0.02em] text-brand-text-bright">{title}</h3>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-brand-accent">
        <Icon size={18} />
      </div>
    </div>
    <div className="relative z-10 mt-5 space-y-3">{children}</div>
    <div className="relative z-10 mt-5 flex items-end justify-between border-t border-white/[0.05] pt-4">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand-text-dim">micro trend</span>
      <MiniBars values={sparkValues} tone={tone} />
    </div>
  </motion.section>
);

export const AnalyticsCommandCenter = ({ stats, history, t }: AnalyticsCommandCenterProps) => {
  const closedTradeNodes = stats.equityCurve.filter((point) => typeof point.rMultiple === 'number');
  const winners = closedTradeNodes.map((point) => point.rMultiple ?? 0).filter((value) => value > 0);
  const losers = closedTradeNodes.map((point) => point.rMultiple ?? 0).filter((value) => value < 0);
  const wins = winners.length;
  const losses = losers.length;
  const breakEvens = Math.max(0, stats.totalTrades - wins - losses);
  const netR = stats.equityCurve.at(-1)?.equity ?? 0;
  const avgWinner = winners.length ? winners.reduce((sum, value) => sum + value, 0) / winners.length : 0;
  const avgLoser = losers.length ? losers.reduce((sum, value) => sum + value, 0) / losers.length : 0;
  const currentDrawdown = stats.equityCurve.at(-1)?.drawdown ?? 0;
  const rValues = closedTradeNodes.map((point) => point.rMultiple ?? 0);
  const rAverage = rValues.length ? rValues.reduce((sum, value) => sum + value, 0) / rValues.length : 0;
  const volatility = rValues.length
    ? Math.sqrt(rValues.reduce((sum, value) => sum + Math.pow(value - rAverage, 2), 0) / rValues.length)
    : 0;
  const bestSession = [...stats.performanceBySession].sort((a, b) => b.profit - a.profit)[0];
  const bestSymbol = [...stats.symbolEfficiency].sort((a, b) => b.profit - a.profit)[0];
  const bestDay = [...stats.performanceByDay].sort((a, b) => b.profit - a.profit)[0];
  const winRateTone = stats.winRate >= 60 ? 'positive' : stats.winRate >= 45 ? 'warning' : 'negative';
  const confidence = Math.min(99, Math.round((stats.winRate * 0.6) + (Math.max(0, stats.profitFactor) * 12) + Math.min(20, stats.totalTrades)));
  const latestTrade = history[0];

  return (
    <div className="analytics-command relative isolate flex flex-col gap-6">
      <section className="analytics-hero relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-brand-bg p-4 shadow-[0_32px_100px_-45px_rgba(0,0,0,0.95)] sm:p-6 lg:p-8">
        <div className="analytics-grid-overlay" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-accent/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-24 w-2/3 -translate-x-1/2 bg-brand-accent/10 blur-3xl" />

        <div className="relative z-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="analytics-core-card relative min-h-[430px] overflow-hidden rounded-[24px] border border-brand-accent/20 bg-white/[0.035] p-6 shadow-[0_0_60px_-28px_rgba(52,211,153,0.75)] sm:p-8"
          >
            <div className="analytics-telemetry-sweep" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-accent live-dot" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-brand-accent">Performance Core</p>
                  </div>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-brand-text-bright sm:text-5xl">
                    Trading Performance Command Center
                  </h2>
                </div>
                <div className="rounded-2xl border border-brand-accent/20 bg-brand-accent/[0.06] px-4 py-3 text-right">
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">closed trades</p>
                  <p className="font-mono text-2xl font-black text-brand-text-bright">{stats.totalTrades}</p>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-5">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-text-dim">primary signal / winrate</p>
                  <div className={`mt-2 flex items-end gap-2 ${winRateTone === 'negative' ? 'text-brand-danger' : winRateTone === 'warning' ? 'text-brand-warning' : 'text-brand-accent'}`}>
                    <span className="analytics-winrate text-[clamp(5.25rem,12vw,9.75rem)] font-black leading-none tracking-[-0.08em]">
                      {stats.winRate.toFixed(1)}
                    </span>
                    <span className="mb-3 text-[clamp(2.5rem,5vw,4rem)] font-black opacity-50">%</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full border border-white/[0.08] bg-black/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent via-cyan-300 to-brand-accent shadow-[0_0_24px_rgba(52,211,153,0.55)]"
                    />
                  </div>
                </div>

                <div className="grid min-w-0 gap-x-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <TelemetryLine label="confidence" value={`${confidence}%`} active />
                  <TelemetryLine label="wins / losses / be" value={`${wins} / ${losses} / ${breakEvens}`} />
                  <TelemetryLine label="latest node" value={latestTrade ? latestTrade.symbol : 'standby'} />
                  <TelemetryLine label="mode" value={stats.expectancy >= 0 ? 'edge online' : 'risk review'} active={stats.expectancy >= 0} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatChip label="expectancy" value={formatR(stats.expectancy, true)} tone={stats.expectancy >= 0 ? 'positive' : 'negative'} />
            <StatChip label="net r" value={formatR(netR, true)} tone={netR >= 0 ? 'positive' : 'negative'} />
            <StatChip label="max drawdown" value={`-${stats.maxDrawdown.toFixed(2)}R`} tone={stats.maxDrawdown > 5 ? 'negative' : 'warning'} />
            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
              <div className="analytics-grid-overlay opacity-20" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200/70">micro telemetry</p>
                  <p className="mt-2 text-sm font-semibold text-brand-text-bright">Equity pulse from the last closed nodes</p>
                </div>
                <RadioTower className="text-cyan-200" size={22} />
              </div>
              <div className="relative z-10 mt-6">
                <MiniBars values={stats.equityCurve.map((point) => point.equity)} tone="cyan" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="analytics-panel relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-brand-elevated/35 p-3 shadow-2xl sm:p-5">
        <div className="analytics-grid-overlay opacity-25" />
        <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent/75">Equity architecture</p>
            <h3 className="mt-1 text-2xl font-black uppercase tracking-[-0.03em] text-brand-text-bright">Capital Curve + Drawdown Overlay</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatChip label="current dd" value={`-${currentDrawdown.toFixed(2)}R`} tone={currentDrawdown > 0 ? 'warning' : 'neutral'} />
            <StatChip label="recovery" value={stats.recoveryFactor > 0 ? stats.recoveryFactor.toFixed(2) : '--'} tone="neutral" />
          </div>
        </div>
        <div className="relative z-10">
          <EquityChart stats={stats} t={t} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AnalysisCard title="Edge" eyebrow="alpha quality" icon={Target} sparkValues={rValues.length ? rValues : [0]} tone="accent">
          <TelemetryLine label="expectancy" value={formatR(stats.expectancy, true)} active={stats.expectancy >= 0} />
          <TelemetryLine label="profit factor" value={stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00'} />
          <TelemetryLine label="avg winner" value={formatR(avgWinner, true)} active={avgWinner > 0} />
          <TelemetryLine label="avg loser" value={formatR(avgLoser)} />
        </AnalysisCard>

        <AnalysisCard title="Risk" eyebrow="capital defense" icon={ShieldCheck} sparkValues={stats.equityCurve.map((point) => point.drawdown)} tone="risk">
          <TelemetryLine label="max dd" value={`-${stats.maxDrawdown.toFixed(2)}R`} />
          <TelemetryLine label="recovery" value={stats.recoveryFactor > 0 ? stats.recoveryFactor.toFixed(2) : '--'} />
          <TelemetryLine label="streaks" value={`${stats.maxConsecutiveLosses} loss max`} />
          <TelemetryLine label="volatility" value={`${volatility.toFixed(2)}R`} />
        </AnalysisCard>

        <AnalysisCard title="Context" eyebrow="market fit" icon={Crosshair} sparkValues={stats.performanceByDay.map((day) => day.profit)} tone="cyan">
          <TelemetryLine label="best session" value={bestSession ? `${bestSession.session} ${formatR(bestSession.profit, true)}` : '--'} active={!!bestSession} />
          <TelemetryLine label="best symbol" value={bestSymbol ? `${bestSymbol.symbol} ${formatR(bestSymbol.profit, true)}` : '--'} active={!!bestSymbol} />
          <TelemetryLine label="best day" value={bestDay ? `${bestDay.day} ${formatR(bestDay.profit, true)}` : '--'} />
          <TelemetryLine label="sample" value={`${stats.totalTrades} nodes`} />
        </AnalysisCard>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t.ui.profit_factor, value: stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00', icon: BarChart3, tone: 'text-brand-accent' },
          { label: t.ui.risk_reward, value: `1:${stats.avgRR.toFixed(2)}`, icon: Gauge, tone: 'text-cyan-200' },
          { label: t.ui.day_profile, value: bestDay?.day ?? '--', icon: CalendarDays, tone: 'text-brand-text-bright' },
          { label: t.ui.leading_symbols, value: bestSymbol?.symbol ?? '--', icon: LineChart, tone: 'text-brand-warning' }
        ].map((item) => (
          <div key={item.label} className="analytics-panel flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand-text-dim">{item.label}</p>
              <p className={`mt-1 font-mono text-xl font-black ${item.tone}`}>{item.value}</p>
            </div>
            <item.icon size={20} className="text-brand-text-dim" />
          </div>
        ))}
      </section>
    </div>
  );
};
