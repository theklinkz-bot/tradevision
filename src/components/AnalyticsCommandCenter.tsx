import React from 'react';
import { createPortal } from 'react-dom';
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
import { AnalysisHistoryItem, Strategy, TradeStats, TranslationSchema } from '../types';
import { EquityChart } from './EquityChart';

interface AnalyticsCommandCenterProps {
  stats: TradeStats;
  history: AnalysisHistoryItem[];
  t: TranslationSchema;
  language: 'EN' | 'TH';
  strategies: Strategy[];
  selectedStrategyId: string;
  onStrategyChange: (strategyId: string) => void;
}

type TooltipKey =
  | 'winrate'
  | 'closedTrades'
  | 'expectancy'
  | 'netR'
  | 'maxDrawdown'
  | 'confidence'
  | 'winsLosses'
  | 'latestNode'
  | 'mode'
  | 'currentDrawdown'
  | 'recovery'
  | 'profitFactor'
  | 'avgWinner'
  | 'avgLoser'
  | 'streaks'
  | 'volatility'
  | 'bestSession'
  | 'bestSymbol'
  | 'bestDay'
  | 'sample'
  | 'avgRR';

const ANALYTICS_TOOLTIPS: Record<'EN' | 'TH', Record<TooltipKey, string>> = {
  EN: {
    winrate: 'This shows how often your trades win overall.',
    closedTrades: 'Only finished trades count here, so open ideas stay out of the score.',
    expectancy: 'Average expected return per trade over time.',
    netR: 'Your total result measured in R, so position size does not distort the view.',
    maxDrawdown: 'This is the biggest dip your account experienced before recovering.',
    confidence: 'A quick read on whether your sample and edge look reliable enough to trust.',
    winsLosses: 'A simple split of wins, losses, and break-even trades.',
    latestNode: 'The newest trade signal currently feeding this dashboard.',
    mode: 'A plain-language status for whether your edge looks healthy or needs review.',
    currentDrawdown: 'How far the current curve is below its previous high.',
    recovery: 'How strongly profits have recovered compared with the worst dip.',
    profitFactor: 'How much your winners made compared with what your losers gave back.',
    avgWinner: 'The average size of your winning trades.',
    avgLoser: 'The average size of your losing trades.',
    streaks: 'The longest losing run, useful for knowing what pain to expect.',
    volatility: 'How jumpy your trade results are from one trade to the next.',
    bestSession: 'The trading session that has produced the cleanest result so far.',
    bestSymbol: 'The symbol that has contributed the most R.',
    bestDay: 'The weekday where your execution has worked best.',
    sample: 'How many closed trades are included in this read.',
    avgRR: 'Your average reward compared with the risk you planned.'
  },
  TH: {
    winrate: 'บอกว่าทั้งหมดแล้วคุณเทรดชนะบ่อยแค่ไหน',
    closedTrades: 'นับเฉพาะออเดอร์ที่ปิดแล้ว เพื่อไม่ให้ไอเดียที่ยังค้างมาปนคะแนน',
    expectancy: 'ค่าเฉลี่ยว่าแต่ละเทรดควรทำผลตอบแทนได้ประมาณเท่าไรในระยะยาว',
    netR: 'ผลรวมทั้งหมดเป็นหน่วย R เพื่อให้ขนาดไม้ไม่ทำให้ภาพเพี้ยน',
    maxDrawdown: 'จุดที่บัญชีย่อลึกที่สุดก่อนจะฟื้นกลับมา',
    confidence: 'สรุปเร็ว ๆ ว่าข้อมูลและ edge ตอนนี้น่าเชื่อแค่ไหน',
    winsLosses: 'แยกจำนวนชนะ แพ้ และเสมอแบบตรงไปตรงมา',
    latestNode: 'สัญญาณหรือเทรดล่าสุดที่กำลังป้อนข้อมูลให้หน้านี้',
    mode: 'สถานะภาษาคนว่า edge ยังดูดีอยู่หรือควรกลับไปทบทวน',
    currentDrawdown: 'ตอนนี้กราฟทุนย่อลงจากจุดสูงสุดล่าสุดเท่าไร',
    recovery: 'กำไรฟื้นกลับมาแรงแค่ไหนเมื่อเทียบกับช่วงย่อลึกสุด',
    profitFactor: 'ฝั่งที่ชนะทำเงินได้มากแค่ไหนเมื่อเทียบกับฝั่งที่แพ้',
    avgWinner: 'ขนาดเฉลี่ยของเทรดที่ชนะ',
    avgLoser: 'ขนาดเฉลี่ยของเทรดที่แพ้',
    streaks: 'ช่วงแพ้ต่อเนื่องที่ยาวที่สุด ใช้ประเมินแรงกดดันที่ต้องรับได้',
    volatility: 'ผลลัพธ์แต่ละเทรดเหวี่ยงมากแค่ไหน',
    bestSession: 'ช่วงตลาดที่ทำผลงานได้ดีที่สุดจนถึงตอนนี้',
    bestSymbol: 'สินทรัพย์ที่สร้าง R ให้มากที่สุด',
    bestDay: 'วันในสัปดาห์ที่ execution ทำงานดีที่สุด',
    sample: 'จำนวนเทรดปิดแล้วที่ถูกนำมาคิดในหน้านี้',
    avgRR: 'ผลตอบแทนเฉลี่ยเมื่อเทียบกับความเสี่ยงที่วางไว้'
  }
};

const MetricTooltip = ({
  tooltipKey,
  language,
  children,
}: {
  tooltipKey?: TooltipKey;
  language: 'EN' | 'TH';
  children: React.ReactNode;
}) => {
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, placement: 'top' as 'top' | 'bottom' });

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = Math.min(292, Math.max(220, window.innerWidth - 28));
    const gap = 12;
    const estimatedHeight = 86;
    const hasTopRoom = rect.top > estimatedHeight + gap + 10;
    const placement = hasTopRoom ? 'top' : 'bottom';
    const rawLeft = rect.left + rect.width / 2;
    const left = Math.min(window.innerWidth - tooltipWidth / 2 - 10, Math.max(tooltipWidth / 2 + 10, rawLeft));
    const top = placement === 'top' ? rect.top - gap : rect.bottom + gap;

    setPosition({ top, left, placement });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  if (!tooltipKey) return <>{children}</>;
  const tooltipText = ANALYTICS_TOOLTIPS[language][tooltipKey];

  return (
    <span
      ref={triggerRef}
      className="analytics-tip-trigger"
      tabIndex={0}
      onMouseEnter={() => {
        updatePosition();
        setIsOpen(true);
      }}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => {
        updatePosition();
        setIsOpen(true);
      }}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      {isOpen && createPortal(
        <span
          className={`analytics-tip analytics-tip--${position.placement}`}
          role="tooltip"
          style={{
            top: position.top,
            left: position.left,
            transform: position.placement === 'top'
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)'
          }}
        >
          {tooltipText}
        </span>,
        document.body
      )}
    </span>
  );
};

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

const TelemetryLine = ({ label, value, active = false, tooltipKey, language }: { label: string; value: string; active?: boolean; tooltipKey?: TooltipKey; language: 'EN' | 'TH' }) => (
  <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/[0.04] py-1.5 last:border-b-0">
    <MetricTooltip tooltipKey={tooltipKey} language={language}>
      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-dim">{label}</span>
    </MetricTooltip>
    <MetricTooltip tooltipKey={tooltipKey} language={language}>
      <span className={`min-w-0 truncate text-right font-mono text-xs font-black ${active ? 'text-brand-accent' : 'text-brand-text-bright'}`}>{value}</span>
    </MetricTooltip>
  </div>
);

const StatChip = ({ label, value, tone = 'neutral', tooltipKey, language }: { label: string; value: string | number; tone?: 'positive' | 'negative' | 'warning' | 'neutral'; tooltipKey?: TooltipKey; language: 'EN' | 'TH' }) => {
  const toneClass = {
    positive: 'border-brand-accent/25 bg-brand-accent/[0.07] text-brand-accent',
    negative: 'border-brand-danger/25 bg-brand-danger/[0.07] text-brand-danger',
    warning: 'border-brand-warning/25 bg-brand-warning/[0.07] text-brand-warning',
    neutral: 'border-white/[0.08] bg-white/[0.03] text-brand-text-bright'
  }[tone];

  return (
    <MetricTooltip tooltipKey={tooltipKey} language={language}>
      <div className={`rounded-xl border px-3.5 py-2.5 ${toneClass}`}>
        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-brand-text-dim">{label}</div>
        <div className="mt-0.5 font-mono text-base font-black tabular-nums">{value}</div>
      </div>
    </MetricTooltip>
  );
};

const IntelligenceMetricCard = ({
  label,
  value,
  eyebrow,
  tone,
  tooltipKey,
  language,
}: {
  label: string;
  value: string;
  eyebrow: string;
  tone: 'positive' | 'negative' | 'warning' | 'cyan';
  tooltipKey: TooltipKey;
  language: 'EN' | 'TH';
}) => {
  const toneClass = {
    positive: 'border-brand-accent/22 bg-brand-accent/[0.055] text-brand-accent',
    negative: 'border-brand-danger/24 bg-brand-danger/[0.06] text-brand-danger',
    warning: 'border-brand-warning/24 bg-brand-warning/[0.055] text-brand-warning',
    cyan: 'border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-200'
  }[tone];
  const rMatch = value.match(/^(.*?)(R)$/);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16 }}
      className={`analytics-intel-card group relative min-h-[104px] overflow-hidden rounded-2xl border p-4 sm:min-h-[118px] sm:p-4 ${toneClass}`}
    >
      <div className="analytics-grid-overlay opacity-15" />
      <MetricTooltip tooltipKey={tooltipKey} language={language}>
        <div className="relative z-10 min-w-0">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-brand-text-dim">{eyebrow}</p>
          <h3 className="sr-only">{label}</h3>
          <p className="analytics-side-metric-value mt-1.5 text-[17px] font-black leading-none tabular-nums text-current sm:text-[18px]">
            {rMatch ? (
              <>
                <span>{rMatch[1]}</span>
                <span className="analytics-r-suffix">R</span>
              </>
            ) : value}
          </p>
        </div>
      </MetricTooltip>
    </motion.article>
  );
};

const MicroTelemetryCard = ({ stats, language }: { stats: TradeStats; language: 'EN' | 'TH' }) => (
  <motion.article
    whileHover={{ y: -2 }}
    transition={{ duration: 0.16 }}
    className="analytics-intel-card group relative min-h-[132px] overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4 sm:min-h-[158px] sm:p-5"
  >
    <div className="analytics-grid-overlay opacity-15" />
    <div className="relative z-10 flex h-full min-h-[78px] flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200/75">micro telemetry</p>
          <p className="mt-2 text-sm font-black leading-snug tracking-[-0.02em] text-brand-text-bright">
            Equity pulse from the last closed nodes
          </p>
        </div>
        <RadioTower className="shrink-0 text-cyan-200/80" size={20} />
      </div>
      <MetricTooltip tooltipKey="sample" language={language}>
        <div className="flex items-center justify-between border-t border-cyan-300/10 pt-3 font-mono">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">sample</span>
          <span className="text-sm font-black text-cyan-100">{stats.totalTrades} nodes</span>
        </div>
      </MetricTooltip>
    </div>
  </motion.article>
);

export const StrategyCommandPill = ({
  strategies,
  selectedStrategyId,
  onStrategyChange,
  placement = 'header',
}: {
  strategies: Strategy[];
  selectedStrategyId: string;
  onStrategyChange: (strategyId: string) => void;
  placement?: 'header' | 'core';
}) => {
  const isAllActive = selectedStrategyId === 'all' || selectedStrategyId === '';

  return (
    <div className={`analytics-strategy-pill analytics-strategy-pill--${placement}`} role="tablist" aria-label="Strategy mapping selector">
      <button
        type="button"
        role="tab"
        aria-selected={isAllActive}
        className={isAllActive ? 'is-active' : ''}
        onClick={() => onStrategyChange('all')}
        title="All strategies"
      >
        ALL
      </button>
      {strategies.map((strategy) => {
        const isActive = selectedStrategyId === strategy.id;
        return (
          <button
            key={strategy.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? 'is-active' : ''}
            onClick={() => onStrategyChange(strategy.id)}
            title={strategy.name}
          >
            <span className="strategy-color-dot" style={{ backgroundColor: strategy.color }} />
            <span className="truncate">{strategy.name}</span>
          </button>
        );
      })}
    </div>
  );
};

const AnalysisCard = ({
  title,
  eyebrow,
  icon: Icon,
  children,
  sparkValues,
  tone = 'accent',
  language,
  tooltipKey,
}: {
  title: string;
  eyebrow: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  sparkValues: number[];
  tone?: 'accent' | 'risk' | 'cyan';
  language: 'EN' | 'TH';
  tooltipKey?: TooltipKey;
}) => (
  <motion.section
    whileHover={{ y: -3 }}
    transition={{ duration: 0.18 }}
    className="analytics-panel group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-elevated/50 p-4 shadow-2xl"
  >
    <div className="analytics-grid-overlay opacity-20" />
    <div className="relative z-10 flex items-start justify-between gap-4">
      <MetricTooltip tooltipKey={tooltipKey} language={language}>
        <div>
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-brand-accent/70">{eyebrow}</p>
          <h3 className="mt-1.5 text-lg font-black uppercase tracking-[-0.02em] text-brand-text-bright">{title}</h3>
        </div>
      </MetricTooltip>
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-brand-accent">
        <Icon size={18} />
      </div>
    </div>
    <div className="relative z-10 mt-4 space-y-2">{children}</div>
    <div className="relative z-10 mt-4 flex items-end justify-between border-t border-white/[0.05] pt-3">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand-text-dim">micro trend</span>
      <MiniBars values={sparkValues} tone={tone} />
    </div>
  </motion.section>
);

export const AnalyticsCommandCenter = ({
  stats,
  history,
  t,
  language,
  strategies,
  selectedStrategyId,
  onStrategyChange,
}: AnalyticsCommandCenterProps) => {
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
  const selectedStrategy = strategies.find((strategy) => strategy.id === selectedStrategyId);
  const mappedTradeCount = selectedStrategy
    ? history.filter((item) => item.strategyId === selectedStrategy.id).length
    : 0;
  const strategyContext = selectedStrategy
    ? `${selectedStrategy.name} mapping selected // ${mappedTradeCount || selectedStrategy.tradeCount || 0} linked nodes`
    : selectedStrategyId === 'all' || selectedStrategyId === ''
      ? `All strategy mappings // ${history.length} total nodes`
      : 'No strategy mapping selected // add mappings from Strategy Mapping';

  return (
    <div className="analytics-command relative isolate flex flex-col gap-4 xl:gap-5">
      <section className="analytics-hero relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-brand-bg p-4 shadow-[0_28px_86px_-45px_rgba(0,0,0,0.95)] sm:p-5 lg:p-6">
        <div className="analytics-grid-overlay" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-accent/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-24 w-2/3 -translate-x-1/2 bg-brand-accent/10 blur-3xl" />

        <div className="relative z-10 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="analytics-core-card relative min-h-[360px] overflow-hidden rounded-[22px] border border-brand-accent/20 bg-white/[0.035] p-5 shadow-[0_0_54px_-30px_rgba(52,211,153,0.72)] sm:p-6"
          >
            <div className="analytics-telemetry-sweep" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-brand-accent/85">Performance Core</p>
                  </div>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-brand-text-bright sm:text-4xl">
                    Trading Performance Command Center
                  </h2>
                  <p className="mt-2 max-w-2xl font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-text-dim">
                    {strategyContext}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="min-w-0">
                  <MetricTooltip tooltipKey="winrate" language={language}>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-text-dim">primary signal / winrate</p>
                    <div className={`mt-2 flex items-end gap-2 ${winRateTone === 'negative' ? 'text-brand-danger' : winRateTone === 'warning' ? 'text-brand-warning' : 'text-brand-accent'}`}>
                      <span className="analytics-winrate text-[clamp(4.6rem,10vw,8.4rem)] font-black leading-none tracking-[-0.08em]">
                        {stats.winRate.toFixed(1)}
                      </span>
                      <span className="mb-2 text-[clamp(2.1rem,4vw,3.2rem)] font-black opacity-50">%</span>
                    </div>
                  </MetricTooltip>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full border border-white/[0.08] bg-black/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent via-cyan-300 to-brand-accent shadow-[0_0_24px_rgba(52,211,153,0.55)]"
                    />
                  </div>
                </div>

                <div className="grid min-w-0 gap-x-5 rounded-2xl border border-white/[0.08] bg-black/20 p-3 sm:grid-cols-2 xl:grid-cols-4">
                  <TelemetryLine label="confidence" value={`${confidence}%`} active tooltipKey="confidence" language={language} />
                  <TelemetryLine label="wins / losses / be" value={`${wins} / ${losses} / ${breakEvens}`} tooltipKey="winsLosses" language={language} />
                  <TelemetryLine label="latest node" value={latestTrade ? latestTrade.symbol : 'standby'} tooltipKey="latestNode" language={language} />
                  <TelemetryLine label="mode" value={stats.expectancy >= 0 ? 'edge online' : 'risk review'} active={stats.expectancy >= 0} tooltipKey="mode" language={language} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid content-start gap-2.5">
            <IntelligenceMetricCard
              label="Expectancy"
              value={formatR(stats.expectancy, true)}
              eyebrow="expectancy"
              tone={stats.expectancy >= 0 ? 'positive' : 'negative'}
              tooltipKey="expectancy"
              language={language}
            />
            <IntelligenceMetricCard
              label="Net R"
              value={formatR(netR, true)}
              eyebrow="net r"
              tone={netR >= 0 ? 'positive' : 'negative'}
              tooltipKey="netR"
              language={language}
            />
            <IntelligenceMetricCard
              label="Max DD"
              value={`-${stats.maxDrawdown.toFixed(2)}R`}
              eyebrow="max drawdown"
              tone={stats.maxDrawdown > 5 ? 'negative' : 'warning'}
              tooltipKey="maxDrawdown"
              language={language}
            />
            <MicroTelemetryCard stats={stats} language={language} />
          </div>
        </div>
      </section>

      <section className="analytics-panel relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-brand-elevated/35 p-3 shadow-2xl sm:p-4">
        <div className="analytics-grid-overlay opacity-25" />
        <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent/75">Equity architecture</p>
            <h3 className="mt-1 text-xl font-black uppercase tracking-[-0.03em] text-brand-text-bright sm:text-2xl">Capital Curve + Drawdown Overlay</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatChip label="current dd" value={`-${currentDrawdown.toFixed(2)}R`} tone={currentDrawdown > 0 ? 'warning' : 'neutral'} tooltipKey="currentDrawdown" language={language} />
            <StatChip label="recovery" value={stats.recoveryFactor > 0 ? stats.recoveryFactor.toFixed(2) : '--'} tone="neutral" tooltipKey="recovery" language={language} />
          </div>
        </div>
        <div className="relative z-10">
          <EquityChart stats={stats} t={t} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AnalysisCard title="Edge" eyebrow="alpha quality" icon={Target} sparkValues={rValues.length ? rValues : [0]} tone="accent" language={language} tooltipKey="expectancy">
          <TelemetryLine label="expectancy" value={formatR(stats.expectancy, true)} active={stats.expectancy >= 0} tooltipKey="expectancy" language={language} />
          <TelemetryLine label="profit factor" value={stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00'} tooltipKey="profitFactor" language={language} />
          <TelemetryLine label="avg winner" value={formatR(avgWinner, true)} active={avgWinner > 0} tooltipKey="avgWinner" language={language} />
          <TelemetryLine label="avg loser" value={formatR(avgLoser)} tooltipKey="avgLoser" language={language} />
        </AnalysisCard>

        <AnalysisCard title="Risk" eyebrow="capital defense" icon={ShieldCheck} sparkValues={stats.equityCurve.map((point) => point.drawdown)} tone="risk" language={language} tooltipKey="maxDrawdown">
          <TelemetryLine label="max dd" value={`-${stats.maxDrawdown.toFixed(2)}R`} tooltipKey="maxDrawdown" language={language} />
          <TelemetryLine label="recovery" value={stats.recoveryFactor > 0 ? stats.recoveryFactor.toFixed(2) : '--'} tooltipKey="recovery" language={language} />
          <TelemetryLine label="streaks" value={`${stats.maxConsecutiveLosses} loss max`} tooltipKey="streaks" language={language} />
          <TelemetryLine label="volatility" value={`${volatility.toFixed(2)}R`} tooltipKey="volatility" language={language} />
        </AnalysisCard>

        <AnalysisCard title="Context" eyebrow="market fit" icon={Crosshair} sparkValues={stats.performanceByDay.map((day) => day.profit)} tone="cyan" language={language} tooltipKey="bestSession">
          <TelemetryLine label="best session" value={bestSession ? `${bestSession.session} ${formatR(bestSession.profit, true)}` : '--'} active={!!bestSession} tooltipKey="bestSession" language={language} />
          <TelemetryLine label="best symbol" value={bestSymbol ? `${bestSymbol.symbol} ${formatR(bestSymbol.profit, true)}` : '--'} active={!!bestSymbol} tooltipKey="bestSymbol" language={language} />
          <TelemetryLine label="best day" value={bestDay ? `${bestDay.day} ${formatR(bestDay.profit, true)}` : '--'} tooltipKey="bestDay" language={language} />
          <TelemetryLine label="sample" value={`${stats.totalTrades} nodes`} tooltipKey="sample" language={language} />
        </AnalysisCard>
      </section>

      <section className="analytics-summary-grid grid gap-1 sm:grid-cols-2 xl:grid-cols-4 xl:gap-1.5">
        {[
          { label: t.ui.profit_factor, value: stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00', icon: BarChart3, tone: 'text-brand-accent', tooltipKey: 'profitFactor' as const },
          { label: t.ui.risk_reward, value: `1:${stats.avgRR.toFixed(2)}`, icon: Gauge, tone: 'text-cyan-200', tooltipKey: 'avgRR' as const },
          { label: t.ui.day_profile, value: bestDay?.day ?? '--', icon: CalendarDays, tone: 'text-brand-text-bright', tooltipKey: 'bestDay' as const },
          { label: t.ui.leading_symbols, value: bestSymbol?.symbol ?? '--', icon: LineChart, tone: 'text-brand-warning', tooltipKey: 'bestSymbol' as const }
        ].map((item) => (
          <div key={item.label}>
            <MetricTooltip tooltipKey={item.tooltipKey} language={language}>
              <div className="analytics-panel flex min-h-[64px] items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-brand-text-dim">{item.label}</p>
                  <p className={`mt-0.5 font-mono text-base font-black ${item.tone}`}>{item.value}</p>
                </div>
                <div className="ml-2 rounded-lg border border-white/[0.06] bg-black/15 p-1.5 text-brand-text-dim">
                  <item.icon size={16} />
                </div>
              </div>
            </MetricTooltip>
          </div>
        ))}
      </section>
    </div>
  );
};
