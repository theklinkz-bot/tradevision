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
  | 'avgRR'
  | 'sharpeRatio'
  | 'sequenceTape'
  | 'rDistribution';

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
    avgRR: 'Your average reward compared with the risk you planned.',
    sharpeRatio: 'Sharpe Ratio measures return per unit of risk. Above 1.0 is solid, above 2.0 is excellent. Calculated as mean R divided by standard deviation of R.',
    sequenceTape: 'Each chip is one closed trade. Green = win, red = loss, gray = break-even. Highlighted chips are your current streak — useful for spotting runs before they become a problem.',
    rDistribution: 'Shows how your R-multiples are spread across buckets of 0.5R. A healthy edge clusters wins to the right of zero. A wide or left-skewed spread signals inconsistency.'
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
    avgRR: 'ผลตอบแทนเฉลี่ยเมื่อเทียบกับความเสี่ยงที่วางไว้',
    sharpeRatio: 'Sharpe Ratio วัดผลตอบแทนต่อหนึ่งหน่วยความเสี่ยง ค่าเกิน 1.0 ถือว่าดี เกิน 2.0 ยอดเยี่ยม คำนวณจากค่าเฉลี่ย R หารด้วยค่าเบี่ยงเบนมาตรฐานของ R',
    sequenceTape: 'แต่ละ chip คือเทรดที่ปิดแล้ว chip สีเขียว = ชนะ สีแดง = แพ้ สีเทา = เสมอ chip ที่ไฮไลต์คือ streak ปัจจุบัน ช่วยให้เห็นแนวโน้มซ้ำๆ ก่อนที่มันจะเป็นปัญหา',
    rDistribution: 'แสดงการกระจายของ R-multiple แบ่งเป็นช่วงละ 0.5R edge ที่ดีจะกองกำไรอยู่ทางขวาของเส้น 0 ถ้ากระจายกว้างหรือกองอยู่ซ้ายแสดงว่าผลลัพธ์ยังไม่นิ่ง'
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

const getNinjaAdvisorCopy = (stats?: TradeStats) => {
  if (!stats || stats.totalTrades === 0) {
    return {
      tone: 'standby',
      title: 'คำแนะนำจากการวิเคราะห์',
      message: 'ยังไม่มี node ให้ด่า เอ้ย ให้ดู ไปเก็บภาพมาก่อน'
    };
  }

  if (stats.totalTrades < 8 && stats.winRate >= 80) {
    return {
      tone: 'warning',
      title: 'Sample ยังบาง',
      message: 'Winrate โหด แต่ node ยังน้อย อย่าเพิ่งทำตัวเป็น legend'
    };
  }

  if (stats.totalTrades < 12) {
    return {
      tone: 'warning',
      title: 'Sample ยังไม่พอ',
      message: 'Node ยังน้อยไปว่ะ ไปเก็บภาพเพิ่มก่อนค่อยเชื่อ stat'
    };
  }

  if (stats.maxDrawdown >= 6) {
    return {
      tone: 'danger',
      title: 'Risk เริ่มเสียงดัง',
      message: 'Drawdown เริ่มกัดพอร์ตแล้ว หยุดซ่าแล้วลด risk ก่อน'
    };
  }

  if (stats.expectancy > 0 && stats.profitFactor >= 2 && stats.winRate >= 55) {
    return {
      tone: 'positive',
      title: 'Stat มีของ',
      message: 'Stat ดีจัด ถ้าวินัยไม่พัง เทรดจริงมีลุ้นรวยไม่ไหว'
    };
  }

  if (stats.avgRR < 1) {
    return {
      tone: 'warning',
      title: 'RR ยังไม่คุ้ม',
      message: 'Reward ไม่จ่ายพอสำหรับ risk ที่รับอยู่ แก้ geometry ก่อน'
    };
  }

  if (stats.expectancy < 0) {
    return {
      tone: 'danger',
      title: 'Edge ยังไม่มา',
      message: 'ตอนนี้ยังไม่ใช่เวลาซิ่ง เป็นเวลาตรวจเบรก'
    };
  }

  return {
    tone: 'positive',
    title: 'Edge online',
    message: 'ระบบเริ่มมีไฟเขียว แต่สมองมึงต้อง online ด้วย'
  };
};

export const NinjaAdvisorButton = ({ stats }: { stats?: TradeStats }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const advice = getNinjaAdvisorCopy(stats);

  return (
    <div
      className="ninja-advisor"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`ninja-advisor__trigger ninja-advisor__trigger--${advice.tone}`}
        aria-label="คำแนะนำจากการวิเคราะห์"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <span className="font-display font-black text-sm leading-none">K</span>
        <span className="ninja-advisor__ping" />
      </button>
      {isOpen && (
        <div className="ninja-advisor__panel" role="tooltip">
          <div className="ninja-advisor__header">
            <span>AI ADVISOR</span>
            <span>{advice.title}</span>
          </div>
          <p>{advice.message}</p>
        </div>
      )}
    </div>
  );
};

const TradeSequenceTape = ({ rValues, language }: { rValues: number[]; language: 'EN' | 'TH'; }) => {
  const recent = rValues.slice(-40);
  // compute current streak
  let streakCount = 0;
  let streakType: 'win' | 'loss' | 'be' | null = null;
  for (let i = recent.length - 1; i >= 0; i--) {
    const type = recent[i] > 0 ? 'win' : recent[i] < 0 ? 'loss' : 'be';
    if (streakType === null) { streakType = type; streakCount = 1; }
    else if (type === streakType) { streakCount++; }
    else break;
  }
  const streakLabel = streakType === 'win'
    ? (language === 'TH' ? `ชนะ ${streakCount} ต่อ` : `${streakCount} win streak`)
    : streakType === 'loss'
      ? (language === 'TH' ? `แพ้ ${streakCount} ต่อ` : `${streakCount} loss streak`)
      : '--';
  const streakTone = streakType === 'win' ? 'text-brand-accent' : streakType === 'loss' ? 'text-brand-danger' : 'text-brand-text-dim';

  if (recent.length === 0) return (
    <p className="font-mono text-[10px] text-brand-text-dim uppercase tracking-widest opacity-50 py-2">
      No trades to display yet
    </p>
  );

  return (
    <section className="analytics-panel relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-brand-elevated/35 p-4 shadow-2xl sm:p-5">
      <div className="analytics-grid-overlay opacity-20" />
      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2">
        <MetricTooltip tooltipKey="sequenceTape" language={language}>
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent/75">Trade Sequence</p>
            <h3 className="mt-1 text-xl font-display font-bold tracking-tight text-brand-text-bright">Node Outcome Tape</h3>
          </div>
        </MetricTooltip>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs font-black ${streakTone}`}>{streakLabel}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-brand-text-dim">
            last {recent.length}
          </span>
        </div>
      </div>
      <div className="relative z-10 flex flex-wrap gap-1.5">
        {recent.map((r, i) => {
          const isWin = r > 0;
          const isLoss = r < 0;
          const chipClass = isWin
            ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent'
            : isLoss
              ? 'bg-brand-danger/20 border-brand-danger/40 text-brand-danger'
              : 'bg-white/[0.06] border-white/[0.12] text-brand-text-dim';
          const isCurrentStreak = i >= recent.length - streakCount;
          return (
            <div
              key={i}
              title={`${r > 0 ? '+' : ''}${r.toFixed(2)}R`}
              className={`relative flex h-7 min-w-[28px] items-center justify-center rounded-md border px-1.5 font-mono text-[9px] font-black tabular-nums transition-opacity ${chipClass} ${isCurrentStreak ? 'ring-1 ring-current ring-offset-1 ring-offset-black/50' : 'opacity-70'}`}
            >
              {r > 0 ? '+' : ''}{r.toFixed(1)}
            </div>
          );
        })}
      </div>
      <div className="relative z-10 mt-3 flex gap-4 border-t border-white/[0.05] pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand-accent/60" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-text-dim">Win</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand-danger/60" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-text-dim">Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-white/20" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-text-dim">BE</span>
        </div>
        <span className="ml-auto font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-brand-text-dim/60">highlighted = current streak</span>
      </div>
    </section>
  );
};

const RDistributionChart = ({ rValues, language }: { rValues: number[]; language: 'EN' | 'TH' }) => {
  if (rValues.length < 3) return (
    <p className="font-mono text-[10px] text-brand-text-dim uppercase tracking-widest opacity-50 py-2">
      {rValues.length === 0 ? 'No trades to display yet' : `Need ${3 - rValues.length} more trade${3 - rValues.length === 1 ? '' : 's'} for distribution`}
    </p>
  );

  const sortedR = [...rValues].sort((a, b) => a - b);
  const mid = Math.floor(sortedR.length / 2);
  const medianR = sortedR.length % 2 === 0
    ? (sortedR[mid - 1] + sortedR[mid]) / 2
    : sortedR[mid];

  const rawMin = sortedR[0];
  const rawMax = sortedR[sortedR.length - 1];
  const q1 = sortedR[Math.floor(sortedR.length * 0.25)] ?? rawMin;
  const q3 = sortedR[Math.floor(sortedR.length * 0.75)] ?? rawMax;
  const iqr = q3 - q1;
  const fenceHigh = iqr > 0 ? Math.min(rawMax, q3 + 3 * iqr) : rawMax;
  const fenceLow = iqr > 0 ? Math.max(rawMin, q1 - 3 * iqr) : rawMin;
  const min = Math.floor(fenceLow * 2) / 2;
  const max = Math.ceil(fenceHigh * 2) / 2;
  const range = max - min || 1;
  const bucketSize = range <= 10 ? 0.5 : range <= 20 ? 1 : Math.ceil((range / 40) * 2) / 2;
  const buckets: { label: string; count: number; from: number; to: number; hasOverflow?: boolean }[] = [];

  for (let b = min; b < max; b = parseFloat((b + bucketSize).toFixed(6))) {
    const from = parseFloat(b.toFixed(6));
    const to = parseFloat((b + bucketSize).toFixed(6));
    const isLast = to >= max;
    const count = rValues.filter((r) => r >= from && (isLast ? r <= rawMax : r < to)).length;
    const hasOverflow = isLast && rawMax > fenceHigh;
    buckets.push({ label: `${from >= 0 ? '+' : ''}${from.toFixed(1)}`, count, from, to, hasOverflow });
  }

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <section className="analytics-panel relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-brand-elevated/35 p-4 shadow-2xl sm:p-5">
      <div className="analytics-grid-overlay opacity-20" />
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2">
        <MetricTooltip tooltipKey="rDistribution" language={language}>
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-brand-accent/75">Distribution</p>
            <h3 className="mt-1 text-xl font-display font-bold tracking-tight text-brand-text-bright">R-Multiple Distribution</h3>
          </div>
        </MetricTooltip>
        <div className="flex gap-2">
          <div className="rounded-xl border border-brand-border/30 bg-brand-elevated/30 px-3 py-2">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-brand-text-dim">median</p>
            <p className={`mt-0.5 font-mono text-sm font-black tabular-nums ${medianR >= 0 ? 'text-brand-accent' : 'text-brand-danger'}`}>
              {medianR >= 0 ? '+' : ''}{medianR.toFixed(2)}R
            </p>
          </div>
          <div className="rounded-xl border border-brand-border/30 bg-brand-elevated/30 px-3 py-2">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-brand-text-dim">sample</p>
            <p className="mt-0.5 font-mono text-sm font-black tabular-nums text-brand-text-bright">{rValues.length}</p>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex h-28 items-end gap-px overflow-hidden rounded-xl border border-brand-border/20 bg-brand-bg/30 px-2 pb-0 pt-2">
        {buckets.map((bucket, i) => {
          const heightPct = (bucket.count / maxCount) * 100;
          const isPositive = bucket.from >= 0;
          const isNearZero = bucket.from < 0 && bucket.to > 0;
          const barColor = isNearZero
            ? 'bg-brand-text-dim/20'
            : isPositive
              ? 'bg-brand-accent/60'
              : 'bg-brand-danger/60';
          const tipLabel = bucket.hasOverflow
            ? `${bucket.label}R+ — ${bucket.count} trades`
            : `${bucket.label}R — ${bucket.count} trades`;
          return (
            <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end" title={tipLabel}>
              <div
                className={`w-full rounded-t-sm transition-all ${barColor}`}
                style={{ height: `${Math.max(2, heightPct)}%` }}
              />
              {bucket.count > 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded border border-brand-border/30 bg-brand-elevated px-1 py-0.5 font-mono text-[7px] font-bold text-brand-text-bright opacity-0 transition-opacity group-hover:opacity-100">
                  {bucket.count}{bucket.hasOverflow ? '+' : ''}
                </span>
              )}
            </div>
          );
        })}
        {/* zero line */}
        {min !== max && (
          <div className="pointer-events-none absolute inset-y-0 border-l border-dashed border-brand-border/50"
            style={{ left: `${Math.max(0, Math.min(100, ((0 - min) / (max - min)) * 100))}%` }}
          />
        )}
      </div>
      <div className="relative z-10 mt-1.5 flex justify-between px-2">
        <span className="font-mono text-[10px] text-brand-text-dim">{min.toFixed(1)}R</span>
        <span className="font-mono text-[10px] text-brand-text-dim">0R</span>
        <span className="font-mono text-[10px] text-brand-text-dim">{rawMax > fenceHigh ? `${max.toFixed(1)}R+` : `${max.toFixed(1)}R`}</span>
      </div>
    </section>
  );
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
    className="analytics-intel-card analytics-micro-card group relative min-h-[132px] overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4 sm:min-h-[158px] sm:p-5"
  >
    <div className="analytics-grid-overlay opacity-15" />
    <div className="relative z-10 flex h-full min-h-[78px] flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="analytics-micro-label font-mono text-[9px] font-black uppercase tracking-[0.24em] text-cyan-200/75">micro telemetry</p>
          <p className="mt-2 text-sm font-black leading-snug tracking-[-0.02em] text-brand-text-bright">
            Equity pulse from the last closed nodes
          </p>
        </div>
        <RadioTower className="analytics-micro-icon shrink-0 text-cyan-200/80" size={20} />
      </div>
      <MetricTooltip tooltipKey="sample" language={language}>
        <div className="flex items-center justify-between border-t border-cyan-300/10 pt-3 font-mono">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">sample</span>
          <span className="analytics-micro-value text-sm font-black text-cyan-100">{stats.totalTrades} nodes</span>
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
          <h3 className="mt-1.5 text-3xl font-black uppercase tracking-[0.01em] text-brand-text-bright leading-none">{title}</h3>
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
  const sharpeRatio = volatility > 0 ? rAverage / volatility : null;
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
            className="analytics-core-card relative min-h-[360px] overflow-hidden rounded-[22px] border border-brand-accent/20 bg-white/[0.035] p-5 shadow-[0_0_54px_-30px_rgba(217,119,87,0.45)] sm:p-6"
          >
            <div className="analytics-telemetry-sweep" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-brand-accent/85">Performance Core</p>
                  </div>
                  <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-brand-text-bright sm:text-4xl">
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
                      <span className="analytics-winrate text-[clamp(4.6rem,10vw,8.4rem)] leading-none">
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
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent via-brand-warning to-brand-accent shadow-[0_0_24px_rgba(217,119,87,0.35)]"
                    />
                  </div>
                </div>

                <div className="analytics-confidence-strip grid min-w-0 gap-x-5 rounded-2xl border border-white/[0.08] bg-black/20 p-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <h3 className="mt-1 text-xl font-display font-bold tracking-tight text-brand-text-bright sm:text-2xl">Capital Curve + Drawdown Overlay</h3>
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

      <TradeSequenceTape rValues={rValues} language={language} />
      <RDistributionChart rValues={rValues} language={language} />

      <section className="grid gap-4 lg:grid-cols-3">
        <AnalysisCard title="Edge" eyebrow="alpha quality" icon={Target} sparkValues={rValues.length ? rValues : [0]} tone="accent" language={language} tooltipKey="expectancy">
          <TelemetryLine label="expectancy" value={formatR(stats.expectancy, true)} active={stats.expectancy >= 0} tooltipKey="expectancy" language={language} />
          <TelemetryLine label="sharpe ratio" value={sharpeRatio !== null ? sharpeRatio.toFixed(2) : '--'} active={sharpeRatio !== null && sharpeRatio >= 1} tooltipKey="sharpeRatio" language={language} />
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

      <section className="analytics-summary-rail analytics-panel relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-brand-elevated/35 p-3">
        <div className="analytics-grid-overlay opacity-10" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-brand-accent/75">Signal snapshot</p>
            <p className="mt-0.5 text-xs font-semibold text-brand-text-dim">Fast read across edge, risk, and market fit</p>
          </div>
          <span className="rounded-full border border-brand-accent/20 bg-brand-accent/[0.06] px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-brand-accent">
            {stats.totalTrades} nodes
          </span>
        </div>
        <div className="relative z-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t.ui.profit_factor, value: stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00', icon: BarChart3, tone: 'is-positive', tooltipKey: 'profitFactor' as const, meta: 'edge efficiency' },
            { label: t.ui.risk_reward, value: `1:${stats.avgRR.toFixed(2)}`, icon: Gauge, tone: 'is-cyan', tooltipKey: 'avgRR' as const, meta: 'reward geometry' },
            { label: t.ui.day_profile, value: bestDay?.day ?? '--', icon: CalendarDays, tone: 'is-neutral', tooltipKey: 'bestDay' as const, meta: 'timing advantage' },
            { label: t.ui.leading_symbols, value: bestSymbol?.symbol ?? '--', icon: LineChart, tone: 'is-warning', tooltipKey: 'bestSymbol' as const, meta: 'best performer' }
          ].map((item) => (
            <MetricTooltip key={item.label} tooltipKey={item.tooltipKey} language={language}>
              <div className={`analytics-summary-cell ${item.tone}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="analytics-summary-dot" aria-hidden="true" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-brand-text-dim">{item.label}</p>
                  </div>
                  <p className="analytics-summary-value mt-1 truncate font-mono text-xl font-black">{item.value}</p>
                  <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-brand-text-dim/70">{item.meta}</p>
                </div>
                <div className="analytics-summary-icon">
                  <item.icon size={15} />
                </div>
              </div>
            </MetricTooltip>
          ))}
        </div>
      </section>
    </div>
  );
};
