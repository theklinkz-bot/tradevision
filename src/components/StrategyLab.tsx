import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, XCircle, Zap } from 'lucide-react';
import { calculateTradeStatistics } from '../services/statsEngine';
import { TradeStats } from '../types';
import { AIStrategyIntelligenceSection } from './strategy-lab/AIStrategyIntelligenceSection';
import { ConsistencyEngineSection } from './strategy-lab/ConsistencyEngineSection';
import { DeploymentValidationSection } from './strategy-lab/DeploymentValidationSection';
import { MarketContextSection } from './strategy-lab/MarketContextSection';
import { PsychologicalAnalyticsSection } from './strategy-lab/PsychologicalAnalyticsSection';
import {
  ClusterTelemetry,
  DistributionBar,
  RiskMetricCard,
  StabilityBar,
  UnderwaterDrawdownChart,
  VerdictTile,
  type ContextRow,
  type ValidationTone,
  createDemoTrades,
  formatR,
  toneStyles
} from './strategy-lab/shared';

interface StrategyLabProps {
  stats: TradeStats;
  isAdmin?: boolean;
}

const densityStorageKey = 'strategy-lab-density-mode';

const strategyLabStyles = `
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
  .strategy-lab--dense .strategy-verdict-bar { border-radius: .35rem !important; padding: .35rem .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar > div { flex-direction: row !important; align-items: center !important; gap: .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar .grid { display: flex !important; flex-wrap: wrap !important; gap: .35rem !important; }
  .strategy-lab--dense .strategy-verdict-bar .grid > div { min-width: 5.5rem; padding: .28rem .45rem !important; }
  .strategy-lab--dense .strategy-verdict-bar a,
  .strategy-lab--dense .strategy-verdict-bar span { padding: .28rem .45rem !important; }
  .strategy-lab--dense #strategy-context .space-y-2 > div { padding-top: .38rem !important; padding-bottom: .38rem !important; }
  .strategy-lab--dense #strategy-context .grid-cols-3,
  .strategy-lab--dense #strategy-context .grid-cols-2 { gap: .45rem !important; }
  .strategy-lab--dense .strategy-empty-state { padding: 2rem !important; gap: .75rem !important; }
`;

const DensityToggle = ({
  denseMode,
  onChange
}: {
  denseMode: boolean;
  onChange: (denseMode: boolean) => void;
}) => (
  <div className="inline-flex rounded border border-brand-border/70 bg-brand-bg/60 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
    {[
      ['STANDARD', false],
      ['DENSE', true]
    ].map(([label, value]) => {
      const active = denseMode === value;
      return (
        <button
          key={label as string}
          type="button"
          onClick={() => onChange(value as boolean)}
          className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest transition-colors ${
            active
              ? 'border border-brand-accent/35 bg-brand-accent/10 text-brand-accent shadow-[0_0_14px_rgba(52,211,153,0.08)]'
              : 'border border-transparent text-brand-text-dim hover:text-brand-text-bright'
          }`}
          aria-pressed={active}
        >
          {label as string}
        </button>
      );
    })}
  </div>
);

export const StrategyLab: React.FC<StrategyLabProps> = ({ stats, isAdmin = false }) => {
  const [demoMode, setDemoMode] = useState(false);
  const [denseMode, setDenseMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(densityStorageKey) === 'dense';
  });
  const demoStats = useMemo(() => calculateTradeStatistics(createDemoTrades()), []);
  const labStats = isAdmin && demoMode ? demoStats : stats;
  const closedTrades = labStats.totalTrades;
  const netR = labStats.equityCurve[labStats.equityCurve.length - 1]?.equity || 0;
  const maxDrawdownAcceptable = labStats.maxDrawdown <= 5;
  const positiveEdge = labStats.expectancy > 0 && labStats.profitFactor >= 1;
  const ready =
    labStats.expectancy > 0 &&
    labStats.profitFactor >= 1.5 &&
    maxDrawdownAcceptable &&
    closedTrades >= 100;
  const notReady = labStats.expectancy <= 0 || labStats.profitFactor < 1;
  const statusTone: ValidationTone = ready ? 'ready' : notReady ? 'fail' : 'caution';
  const status = toneStyles[statusTone];
  const reliability =
    closedTrades >= 100 ? { label: 'RELIABLE SAMPLE FIELD', value: 100, tone: toneStyles.ready } :
    closedTrades >= 30 ? { label: 'DEVELOPING MARKET EXPOSURE', value: Math.min(99, closedTrades), tone: toneStyles.caution } :
    { label: 'INSUFFICIENT MARKET EXPOSURE', value: Math.min(29, closedTrades), tone: toneStyles.caution };

  const checklist = [
    {
      label: 'Expectancy > 0',
      value: formatR(labStats.expectancy),
      tone: labStats.expectancy > 0 ? 'ready' : 'fail'
    },
    {
      label: 'Profit Factor > 1.5',
      value: labStats.profitFactor > 0 ? labStats.profitFactor.toFixed(2) : '0.00',
      tone: labStats.profitFactor > 1.5 ? 'ready' : labStats.profitFactor >= 1 ? 'caution' : 'fail'
    },
    {
      label: 'Max Drawdown acceptable',
      value: `-${labStats.maxDrawdown.toFixed(2)}R`,
      tone: labStats.maxDrawdown <= 5 ? 'ready' : labStats.maxDrawdown <= 10 ? 'caution' : 'fail'
    },
    {
      label: 'Closed trades >= 100',
      value: String(closedTrades),
      tone: closedTrades >= 100 ? 'ready' : 'caution'
    },
    {
      label: 'Winrate stable',
      value: `${labStats.winRate.toFixed(1)}%`,
      tone: labStats.winRate >= 50 ? 'ready' : labStats.winRate >= 45 ? 'caution' : 'fail'
    },
    {
      label: 'Recovery factor positive',
      value: labStats.recoveryFactor > 0 ? labStats.recoveryFactor.toFixed(2) : '0.00',
      tone: labStats.recoveryFactor > 0 ? 'ready' : 'fail'
    }
  ] as const;

  const passedScore = checklist.reduce((score, item) => {
    if (item.tone === 'ready') return score + 1;
    if (item.tone === 'caution') return score + 0.5;
    return score;
  }, 0);
  const readinessScore = Math.round((passedScore / checklist.length) * 100);

  const reason = closedTrades === 0
    ? 'No closed trade sample is available for deployment validation.'
    : ready
      ? 'Edge, risk, and sample reliability are aligned for controlled live deployment.'
      : notReady
        ? 'Core edge is not positive enough for live deployment.'
        : positiveEdge
          ? 'Edge is positive, but sample depth or risk controls still need validation.'
          : 'Validation remains mixed. Continue backtesting before live exposure.';
  const deploymentMeaning = ready
    ? 'READY FOR LIVE DEPLOYMENT'
    : statusTone === 'caution'
      ? 'READY FOR SIMULATED DEPLOYMENT'
      : 'NOT SAFE FOR CAPITAL DEPLOYMENT';
  const aiInsights = [
    positiveEdge && closedTrades < 100
      ? 'Edge quality is positive, but statistical confidence remains weak.'
      : null,
    closedTrades < 30
      ? 'Profitability is concentrated in a limited sample cluster.'
      : null,
    labStats.expectancy > 0 && labStats.profitFactor >= 1.5
      ? 'System shows stable expectancy with limited deployment validation.'
      : null,
    labStats.maxDrawdown > 5
      ? 'Risk pressure is elevated by observed drawdown expansion.'
      : null,
    notReady
      ? 'Core deployment filters reject capital allocation at current metrics.'
      : null
  ].filter(Boolean) as string[];
  const riskTone: ValidationTone = labStats.maxDrawdown <= 3 && labStats.recoveryFactor > 1 ? 'ready' : labStats.maxDrawdown <= 7 && labStats.recoveryFactor > 0 ? 'caution' : 'fail';
  const riskState = riskTone === 'ready' ? 'LOW' : riskTone === 'caution' ? 'ELEVATED' : 'HIGH';
  const tradeReturns = labStats.equityCurve
    .map((point) => point.rMultiple)
    .filter((value): value is number => typeof value === 'number');
  const sortedReturns = [...tradeReturns].sort((a, b) => a - b);
  const winningReturns = tradeReturns.filter((value) => value > 0);
  const losingReturns = tradeReturns.filter((value) => value < 0);
  const breakEvenReturns = tradeReturns.filter((value) => value === 0);
  const avgWinner = winningReturns.length > 0 ? winningReturns.reduce((sum, value) => sum + value, 0) / winningReturns.length : 0;
  const avgLoserAbs = losingReturns.length > 0 ? Math.abs(losingReturns.reduce((sum, value) => sum + value, 0) / losingReturns.length) : 0;
  const payoffRatio = avgLoserAbs > 0 ? avgWinner / avgLoserAbs : avgWinner;
  const medianR = sortedReturns.length > 0
    ? sortedReturns.length % 2 === 0
      ? (sortedReturns[sortedReturns.length / 2 - 1] + sortedReturns[sortedReturns.length / 2]) / 2
      : sortedReturns[Math.floor(sortedReturns.length / 2)]
    : 0;
  const bestR = sortedReturns.length > 0 ? sortedReturns[sortedReturns.length - 1] : 0;
  const worstR = sortedReturns.length > 0 ? sortedReturns[0] : 0;
  const outlierWinners = tradeReturns.filter((value) => value >= Math.max(2.5, avgWinner * 1.8)).length;
  const outlierLosers = tradeReturns.filter((value) => value <= -2).length;
  const outlierProfit = tradeReturns.filter((value) => value >= Math.max(2.5, avgWinner * 1.8)).reduce((sum, value) => sum + value, 0);
  const totalPositiveR = winningReturns.reduce((sum, value) => sum + value, 0);
  const outlierDependency = totalPositiveR > 0 ? (outlierProfit / totalPositiveR) * 100 : 0;
  const edgeScore = Math.round(Math.min(100, Math.max(0,
    (labStats.expectancy > 0 ? 24 : 0) +
    Math.min(24, labStats.profitFactor * 10) +
    Math.min(18, payoffRatio * 8) +
    (labStats.winRate >= 50 ? 16 : labStats.winRate >= 45 ? 9 : 2) +
    Math.min(18, closedTrades / 6)
  )));
  const edgeTone: ValidationTone = edgeScore >= 75 ? 'ready' : edgeScore >= 50 ? 'caution' : 'fail';
  const edgeStatus = edgeScore >= 75 ? 'STRONG EDGE' : edgeScore >= 50 ? 'DEVELOPING EDGE' : edgeScore >= 25 ? 'WEAK EDGE' : 'NO EDGE';
  const rollingWindow = 30;
  const recentReturns = tradeReturns.slice(-rollingWindow);
  const earlyReturns = tradeReturns.slice(0, rollingWindow);
  const rollingExpectancy = recentReturns.length > 0 ? recentReturns.reduce((sum, value) => sum + value, 0) / recentReturns.length : 0;
  const rollingWins = recentReturns.filter((value) => value > 0);
  const rollingLosses = recentReturns.filter((value) => value < 0);
  const rollingProfit = rollingWins.reduce((sum, value) => sum + value, 0);
  const rollingLoss = Math.abs(rollingLosses.reduce((sum, value) => sum + value, 0));
  const rollingProfitFactor = rollingLoss > 0 ? rollingProfit / rollingLoss : rollingProfit;
  const rollingWinrate = recentReturns.length > 0 ? (rollingWins.length / recentReturns.length) * 100 : 0;
  const earlyExpectancy = earlyReturns.length > 0 ? earlyReturns.reduce((sum, value) => sum + value, 0) / earlyReturns.length : 0;
  const recentExpectancy = rollingExpectancy;
  const edgeDecayTone: ValidationTone = tradeReturns.length < 60
    ? 'caution'
    : recentExpectancy >= earlyExpectancy * 0.8 && recentExpectancy > 0
      ? 'ready'
      : recentExpectancy > 0
        ? 'caution'
        : 'fail';
  const edgeDecayLabel = edgeDecayTone === 'ready' ? 'EDGE STABLE' : edgeDecayTone === 'caution' ? 'EDGE DRIFTING' : 'EDGE DECAY DETECTED';
  const drawdownDepths = labStats.equityCurve.map((point) => Math.abs(point.drawdown || 0));
  const avgDrawdown = drawdownDepths.length > 0 ? drawdownDepths.reduce((sum, value) => sum + value, 0) / drawdownDepths.length : 0;
  const largestLoss = losingReturns.length > 0 ? Math.min(...losingReturns) : 0;
  const avgLoss = losingReturns.length > 0 ? losingReturns.reduce((sum, value) => sum + value, 0) / losingReturns.length : 0;
  const avgReturn = tradeReturns.length > 0 ? tradeReturns.reduce((sum, value) => sum + value, 0) / tradeReturns.length : 0;
  const equityVolatility = tradeReturns.length > 1
    ? Math.sqrt(tradeReturns.reduce((sum, value) => sum + Math.pow(value - avgReturn, 2), 0) / tradeReturns.length)
    : 0;
  const riskPressureTone: ValidationTone =
    labStats.maxDrawdown <= 3 && labStats.recoveryFactor > 1 && labStats.maxConsecutiveLosses <= 2 && labStats.expectancy > 0
      ? 'ready'
      : labStats.maxDrawdown <= 7 && labStats.recoveryFactor > 0 && labStats.expectancy > 0
        ? 'caution'
        : 'fail';
  const riskPressureLabel = riskPressureTone === 'ready' ? 'LOW RISK' : riskPressureTone === 'caution' ? 'ELEVATED RISK' : 'HIGH RISK';
  const riskTimelineIndex = riskPressureTone === 'ready' ? 0 : riskPressureTone === 'caution' && labStats.recoveryFactor > 0 ? 2 : riskPressureTone === 'caution' ? 1 : 3;
  const equityStability = Math.max(0, 100 - labStats.maxDrawdown * 10 - equityVolatility * 8);
  const recoverySpeed = Math.min(100, Math.max(0, labStats.recoveryFactor * 35));
  const lossClusterPressure = Math.min(100, labStats.maxConsecutiveLosses * 25);
  const volatilityPressure = Math.min(100, equityVolatility * 28);
  const worstDrawdownIndex = drawdownDepths.reduce((worstIndex, value, index) => value > drawdownDepths[worstIndex] ? index : worstIndex, 0);
  const recoveryIndex = labStats.equityCurve.findIndex((point, index) => index > worstDrawdownIndex && Math.abs(point.drawdown || 0) <= 0.05);
  const recoveryDuration = recoveryIndex > worstDrawdownIndex ? recoveryIndex - worstDrawdownIndex : Math.max(0, labStats.equityCurve.length - 1 - worstDrawdownIndex);
  const lossClusters = tradeReturns.reduce<{ start: number; length: number; severity: ValidationTone }[]>((clusters, value, index) => {
    if (value >= 0) return clusters;
    const previous = clusters[clusters.length - 1];
    if (previous && previous.start + previous.length === index) {
      previous.length += 1;
      previous.severity = previous.length >= 4 ? 'fail' : previous.length >= 2 ? 'caution' : 'ready';
      return clusters;
    }
    clusters.push({ start: index, length: 1, severity: 'ready' });
    return clusters;
  }, []).filter((cluster) => cluster.length >= 2).sort((a, b) => b.length - a.length);
  const worstLossCluster = lossClusters[0]?.length || labStats.maxConsecutiveLosses;
  const drawdownSeverity: ValidationTone = labStats.maxDrawdown <= 3 ? 'ready' : labStats.maxDrawdown <= 7 ? 'caution' : 'fail';
  const capitalVerdict = riskPressureTone === 'ready' ? 'STABLE' : riskPressureTone === 'caution' ? 'PRESSURED' : 'CRITICAL';
  const recoveryQuality = Math.round((recoverySpeed + equityStability + Math.max(0, 100 - lossClusterPressure)) / 3);
  const reboundTone: ValidationTone = recoveryQuality >= 70 ? 'ready' : recoveryQuality >= 40 ? 'caution' : 'fail';
  const bucketSize = 20;
  const periodBuckets = Array.from({ length: Math.ceil(tradeReturns.length / bucketSize) }, (_, index) => {
    const returns = tradeReturns.slice(index * bucketSize, (index + 1) * bucketSize);
    const net = returns.reduce((sum, value) => sum + value, 0);
    return {
      index,
      returns,
      net,
      winrate: returns.length > 0 ? (returns.filter((value) => value > 0).length / returns.length) * 100 : 0
    };
  }).filter((bucket) => bucket.returns.length > 0);
  const greenPeriods = periodBuckets.filter((bucket) => bucket.net > 0).length;
  const redPeriods = periodBuckets.filter((bucket) => bucket.net < 0).length;
  const bestPeriod = periodBuckets.length > 0 ? periodBuckets.reduce((best, bucket) => bucket.net > best.net ? bucket : best, periodBuckets[0]) : null;
  const worstPeriod = periodBuckets.length > 0 ? periodBuckets.reduce((worst, bucket) => bucket.net < worst.net ? bucket : worst, periodBuckets[0]) : null;
  const avgPeriodR = periodBuckets.length > 0 ? periodBuckets.reduce((sum, bucket) => sum + bucket.net, 0) / periodBuckets.length : 0;
  const rollingSlices = tradeReturns.length >= rollingWindow
    ? Array.from({ length: Math.floor(tradeReturns.length / rollingWindow) }, (_, index) => tradeReturns.slice(index * rollingWindow, (index + 1) * rollingWindow)).filter((slice) => slice.length >= 10)
    : [];
  const sliceExpectancies = rollingSlices.map((slice) => slice.reduce((sum, value) => sum + value, 0) / slice.length);
  const sliceWinrates = rollingSlices.map((slice) => (slice.filter((value) => value > 0).length / slice.length) * 100);
  const stabilitySpread = sliceExpectancies.length > 1 ? Math.max(...sliceExpectancies) - Math.min(...sliceExpectancies) : 0;
  const winrateSpread = sliceWinrates.length > 1 ? Math.max(...sliceWinrates) - Math.min(...sliceWinrates) : 0;
  const driftDelta = recentExpectancy - earlyExpectancy;
  const smoothnessScore = Math.max(0, Math.min(100, 100 - equityVolatility * 18 - labStats.maxDrawdown * 6 - lossClusterPressure * 0.25));
  const rhythmScore = Math.max(0, Math.min(100, recoverySpeed * 0.5 + equityStability * 0.5 - Math.max(0, recoveryDuration - 10)));
  const consistencyScore = tradeReturns.length < 30
    ? 0
    : Math.round(Math.max(0, Math.min(100,
      (tradeReturns.length >= 100 ? 18 : tradeReturns.length >= 60 ? 12 : 6) +
      Math.max(0, 24 - stabilitySpread * 14) +
      Math.max(0, 18 - winrateSpread * 0.45) +
      Math.max(0, 18 - equityVolatility * 8) +
      Math.max(0, 12 - lossClusterPressure * 0.12) +
      (driftDelta >= -0.2 ? 10 : driftDelta >= -0.5 ? 5 : 0)
    )));
  const consistencyTone: ValidationTone = tradeReturns.length < 30 ? 'caution' : consistencyScore >= 72 ? 'ready' : consistencyScore >= 45 ? 'caution' : 'fail';
  const consistencyStatus = tradeReturns.length < 30 ? 'INSUFFICIENT DATA' : consistencyScore >= 72 ? 'STABLE' : consistencyScore >= 45 ? 'DEVELOPING' : 'UNSTABLE';
  const driftTone: ValidationTone = tradeReturns.length < 60 ? 'caution' : driftDelta >= -0.15 ? 'ready' : driftDelta >= -0.45 ? 'caution' : 'fail';
  const driftLabel = tradeReturns.length < 60 ? 'INSUFFICIENT DATA' : driftTone === 'ready' ? 'NO DRIFT' : driftTone === 'caution' ? 'MILD DRIFT' : 'PERFORMANCE DRIFT';
  const regime = labStats.totalTrades < 10
    ? 'UNDEFINED'
    : labStats.maxDrawdown > 7
      ? 'VOLATILE'
      : labStats.winRate >= 55 && labStats.expectancy > 0
        ? 'TRENDING'
        : 'STABLE';
  const deploymentStage = closedTrades >= 100 && readinessScore >= 85 ? 3 : closedTrades >= 30 && readinessScore >= 60 ? 2 : positiveEdge ? 1 : 0;
  const systemIndicators = ['VALIDATION ONLINE', 'EDGE MONITOR ACTIVE', 'MARKET SYNCED', 'DEPLOYMENT WATCHING'];
  const rotatingInsights = useMemo(() => {
    const base = [
      closedTrades < 100 ? 'Edge stability remains statistically incomplete.' : 'Sample depth is approaching institutional reliability.',
      labStats.expectancy > 0 ? 'Current expectancy profile is favorable.' : 'Current expectancy profile rejects live deployment.',
      closedTrades < 100 ? 'Deployment confidence limited by sample depth.' : 'Deployment confidence supported by sample depth.',
      labStats.maxDrawdown <= 5 ? 'Risk profile remains within acceptable range.' : 'Risk pressure is elevated by drawdown expansion.'
    ];
    return [...base, ...aiInsights];
  }, [aiInsights, closedTrades, labStats.expectancy, labStats.maxDrawdown]);
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    if (rotatingInsights.length <= 1) return;
    const timer = window.setInterval(() => {
      setInsightIndex((index) => (index + 1) % rotatingInsights.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [rotatingInsights.length]);

  useEffect(() => {
    window.localStorage.setItem(densityStorageKey, denseMode ? 'dense' : 'standard');
  }, [denseMode]);

  const riskInsights = [
    riskPressureTone === 'ready' ? 'Capital preservation remains stable despite localized volatility.' : 'Capital preservation requires continued simulation monitoring.',
    labStats.maxConsecutiveLosses >= 3 ? 'Loss clustering increased recovery pressure during recent executions.' : 'Loss clustering remains contained across the current sample.',
    labStats.recoveryFactor > 0 ? 'Drawdown recovery efficiency remains within deployable tolerance.' : 'Recovery efficiency deteriorating under volatility.',
    equityVolatility > 1.8 ? 'Equity instability detected during high-volatility sequences.' : 'Equity volatility remains controlled inside the current sample.'
  ];
  const edgeInsights = [
    labStats.winRate >= 55 && payoffRatio < 1
      ? 'Winrate is strong, but average win size is not yet compensating enough.'
      : 'Payoff and hit-rate are aligned enough for continued validation.',
    outlierDependency > 35
      ? 'Performance appears dependent on a small number of outlier winners.'
      : 'Return distribution is not materially dependent on outlier winners.',
    edgeDecayTone === 'fail'
      ? 'Recent performance has broken below the early sample baseline.'
      : edgeDecayTone === 'caution'
        ? 'Recent performance is positive but drifting below the early baseline.'
        : 'Recent sample continues to support the original edge baseline.'
  ];
  const consistencyInsights = [
    tradeReturns.length < 30
      ? 'Sample depth is insufficient for consistency validation.'
      : consistencyTone === 'ready'
        ? 'Performance remains stable across recent trade buckets.'
        : 'Performance consistency is still developing across trade buckets.',
    driftTone === 'fail'
      ? 'Recent expectancy is weaker than the early sample.'
      : driftTone === 'caution'
        ? 'Recent expectancy is drifting below the early sample.'
        : 'Recent expectancy remains aligned with the early sample.',
    smoothnessScore < 45
      ? 'Equity curve shows unstable recovery rhythm.'
      : 'Equity smoothness remains within controlled tolerance.',
    redPeriods > greenPeriods
      ? 'Red periods are outnumbering green periods in the current bucket map.'
      : 'Green periods remain dominant in the current bucket map.'
  ];
  const tradePoints = labStats.equityCurve.filter((point) => point.trade > 0);
  const sessionForHour = (hour: number) => {
    if (hour >= 7 && hour < 11) return 'Asia';
    if (hour >= 14 && hour < 17) return 'London';
    if (hour >= 19 && hour < 22) return 'New York';
    return 'Unknown';
  };
  const unknownSessionPoints = tradePoints.filter((point) => {
    if (!point.date) return true;
    const date = new Date(point.date);
    if (Number.isNaN(date.getTime())) return true;
    const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return sessionForHour(gmt7Date.getUTCHours()) === 'Unknown';
  });
  const unknownSessionWins = unknownSessionPoints.filter((point) => (point.rMultiple || 0) > 0).length;
  const unknownSessionProfit = unknownSessionPoints.reduce((sum, point) => sum + (point.rMultiple || 0), 0);
  const sessionRows: ContextRow[] = [
    ...labStats.performanceBySession.map((session) => ({
      label: session.session,
      trades: session.count,
      winRate: session.winRate,
      netR: session.profit,
      expectancy: session.count > 0 ? session.profit / session.count : 0
    })),
    {
      label: 'Unknown',
      trades: unknownSessionPoints.length,
      winRate: unknownSessionPoints.length > 0 ? (unknownSessionWins / unknownSessionPoints.length) * 100 : 0,
      netR: unknownSessionProfit,
      expectancy: unknownSessionPoints.length > 0 ? unknownSessionProfit / unknownSessionPoints.length : 0
    }
  ];
  const symbolRows: ContextRow[] = labStats.symbolEfficiency.map((symbol) => ({
    label: symbol.symbol,
    trades: symbol.count,
    winRate: symbol.winRate,
    netR: symbol.profit,
    expectancy: symbol.count > 0 ? symbol.profit / symbol.count : 0
  }));
  const dayRows: ContextRow[] = labStats.performanceByDay.map((day) => ({
    label: day.day,
    trades: day.count,
    winRate: day.winRate,
    netR: day.profit,
    expectancy: day.count > 0 ? day.profit / day.count : 0
  }));
  const rankedSessions = [...sessionRows].sort((a, b) => b.expectancy - a.expectancy);
  const rankedSymbols = [...symbolRows].sort((a, b) => b.expectancy - a.expectancy);
  const rankedDays = [...dayRows].sort((a, b) => b.expectancy - a.expectancy);
  const bestSession = rankedSessions.find((row) => row.trades > 0) || rankedSessions[0];
  const weakestSession = [...sessionRows].filter((row) => row.trades > 0).sort((a, b) => a.expectancy - b.expectancy)[0] || sessionRows[sessionRows.length - 1];
  const bestSymbol = rankedSymbols.find((row) => row.trades > 0) || rankedSymbols[0];
  const weakestSymbol = [...symbolRows].filter((row) => row.trades > 0).sort((a, b) => a.expectancy - b.expectancy)[0] || symbolRows[0];
  const bestDay = rankedDays.find((row) => row.trades > 0) || rankedDays[0];
  const weakestDay = [...dayRows].filter((row) => row.trades > 0).sort((a, b) => a.expectancy - b.expectancy)[0] || dayRows[0];
  const activeContexts = [...sessionRows, ...symbolRows, ...dayRows].filter((row) => row.trades >= 5);
  const positiveContexts = activeContexts.filter((row) => row.expectancy > 0).length;
  const contextSpread = activeContexts.length > 1
    ? Math.max(...activeContexts.map((row) => row.expectancy)) - Math.min(...activeContexts.map((row) => row.expectancy))
    : 0;
  const contextScore = closedTrades < 30
    ? 0
    : Math.round(Math.max(0, Math.min(100,
      Math.min(24, closedTrades / 4) +
      (bestSession?.expectancy > 0 ? 18 : 0) +
      (bestSymbol?.expectancy > 0 ? 18 : 0) +
      (bestDay?.expectancy > 0 ? 14 : 0) +
      Math.min(14, positiveContexts * 3) +
      Math.min(12, contextSpread * 12)
    )));
  const contextTone: ValidationTone = closedTrades < 30 ? 'caution' : contextScore >= 72 ? 'ready' : contextScore >= 45 ? 'caution' : 'fail';
  const contextStatus = closedTrades < 30
    ? 'INSUFFICIENT DATA'
    : contextScore >= 72
      ? 'STRONG CONTEXT EDGE'
      : contextScore >= 45
        ? 'DEVELOPING CONTEXT EDGE'
        : 'WEAK CONTEXT EDGE';
  const contextRankTone = (row?: ContextRow): ValidationTone => {
    if (!row || row.trades < 5) return 'caution';
    if (row.expectancy > 0) return 'ready';
    if (row.expectancy < 0) return 'fail';
    return 'caution';
  };
  const contextRankLabel = (row?: ContextRow) => {
    if (!row || row.trades < 5) return 'NEUTRAL';
    if (row.expectancy > 0) return 'BEST';
    if (row.expectancy < 0) return 'WEAK';
    return 'NEUTRAL';
  };
  const contextConfidenceMin = Math.min(bestSession?.trades || 0, bestSymbol?.trades || 0, bestDay?.trades || 0);
  const contextConfidenceTone: ValidationTone = contextConfidenceMin >= 30 ? 'ready' : contextConfidenceMin >= 10 ? 'caution' : 'fail';
  const contextConfidenceLabel = contextConfidenceMin >= 30
    ? 'RELIABLE CONTEXT CONFIDENCE'
    : contextConfidenceMin >= 10
      ? 'DEVELOPING CONTEXT CONFIDENCE'
      : 'LOW CONTEXT CONFIDENCE';
  const sessionPositiveProfit = sessionRows.filter((row) => row.netR > 0).reduce((sum, row) => sum + row.netR, 0);
  const symbolPositiveProfit = symbolRows.filter((row) => row.netR > 0).reduce((sum, row) => sum + row.netR, 0);
  const dayPositiveProfit = dayRows.filter((row) => row.netR > 0).reduce((sum, row) => sum + row.netR, 0);
  const contextConcentration = [
    {
      type: 'session',
      label: bestSession?.label || 'unconfirmed',
      share: sessionPositiveProfit > 0 && bestSession ? (Math.max(0, bestSession.netR) / sessionPositiveProfit) * 100 : 0
    },
    {
      type: 'symbol',
      label: bestSymbol?.label || 'unconfirmed',
      share: symbolPositiveProfit > 0 && bestSymbol ? (Math.max(0, bestSymbol.netR) / symbolPositiveProfit) * 100 : 0
    },
    {
      type: 'weekday',
      label: bestDay?.label || 'unconfirmed',
      share: dayPositiveProfit > 0 && bestDay ? (Math.max(0, bestDay.netR) / dayPositiveProfit) * 100 : 0
    }
  ].sort((a, b) => b.share - a.share)[0];
  const concentrationWarning = contextConcentration && contextConcentration.share >= 62
    ? `Edge is concentrated in ${contextConcentration.label} ${contextConcentration.type}. Validate before live deployment.`
    : null;
  const weakestContext = [weakestSession, weakestSymbol, weakestDay]
    .filter((row): row is ContextRow => Boolean(row && row.trades > 0))
    .sort((a, b) => a.expectancy - b.expectancy)[0];
  const contextInsights = [
    bestSession?.trades
      ? `Best timing window is ${bestSession.label}; validate execution rules around that session.`
      : 'Session sample is not yet deep enough for timing confidence.',
    bestSymbol?.trades
      ? `Strongest instrument profile is currently ${bestSymbol.label}.`
      : 'Symbol concentration remains unavailable until more executions close.',
    weakestContext?.expectancy < 0
      ? `Weakest context is ${weakestContext.label}; reduce confidence until it improves.`
      : 'No materially weak context pocket is confirmed yet.',
    closedTrades < 60
      ? 'Context sample is still too shallow for deployment confidence.'
      : `${contextConfidenceLabel.toLowerCase()} across the current timing map.`
  ];
  const datedTradeDays = tradePoints.reduce<Record<string, number>>((days, point) => {
    if (!point.date) return days;
    const date = new Date(point.date);
    if (Number.isNaN(date.getTime())) return days;
    const dayKey = date.toISOString().slice(0, 10);
    days[dayKey] = (days[dayKey] || 0) + 1;
    return days;
  }, {});
  const datedDayCounts = Object.values(datedTradeDays) as number[];
  const datedTimes = tradePoints
    .map((point) => point.date ? new Date(point.date).getTime() : NaN)
    .filter((time) => !Number.isNaN(time));
  const tradeSpanDays = datedTimes.length > 1
    ? Math.max(1, (Math.max(...datedTimes) - Math.min(...datedTimes)) / (24 * 60 * 60 * 1000))
    : Math.max(1, datedDayCounts.length);
  const averageTradesPerDay = datedTimes.length > 0 ? datedTimes.length / tradeSpanDays : 0;
  const maxTradesPerDay = datedDayCounts.length > 0 ? Math.max(...datedDayCounts) : 0;
  const frequencyPressure = Math.min(100, averageTradesPerDay * 18 + maxTradesPerDay * 9);
  const lossStreakPressure = Math.min(100, labStats.maxConsecutiveLosses * 25);
  const drawdownStress = Math.min(100, labStats.maxDrawdown * 12);
  const recoveryFatigue = Math.min(100, recoveryDuration * 5);
  const volatilityStress = Math.min(100, equityVolatility * 35);
  const equityWhiplash = Math.max(0, Math.min(100, 100 - smoothnessScore));
  const emotionalLoad = Math.round((lossStreakPressure + drawdownStress + recoveryFatigue + volatilityStress + equityWhiplash + frequencyPressure) / 6);
  const psychologicalScore = Math.max(0, Math.min(100, 100 - emotionalLoad));
  const psychologicalTone: ValidationTone = psychologicalScore >= 72 ? 'ready' : psychologicalScore >= 45 ? 'caution' : 'fail';
  const psychologicalStatus = psychologicalScore >= 72
    ? 'STABLE'
    : psychologicalScore >= 45
      ? 'PRESSURED'
      : psychologicalScore >= 25
        ? 'HIGH STRESS'
        : 'UNSUSTAINABLE';
  const overtradingTone: ValidationTone = frequencyPressure <= 35 ? 'ready' : frequencyPressure <= 65 ? 'caution' : 'fail';
  const overtradingStatus = overtradingTone === 'ready' ? 'NORMAL ACTIVITY' : overtradingTone === 'caution' ? 'ELEVATED ACTIVITY' : 'OVERTRADING DETECTED';
  const averageStressLevel = emotionalLoad;
  const strategySmoothness = smoothnessScore;
  const pressureZones = [lossStreakPressure, drawdownStress, recoveryFatigue, volatilityStress, equityWhiplash, frequencyPressure].filter((value) => value >= 60).length;
  const psychologicalTimelineIndex = psychologicalStatus === 'STABLE' ? 0 : psychologicalStatus === 'PRESSURED' ? 1 : psychologicalStatus === 'HIGH STRESS' ? 2 : 3;
  const psychologicalInsights = [
    lossClusters.length > 0 || labStats.maxConsecutiveLosses >= 3
      ? 'Loss streaks may pressure discipline after repeated invalidations.'
      : 'Loss sequences remain tolerable for rule-following discipline.',
    recoveryDuration <= 10
      ? 'Recovery rhythm appears psychologically tolerable.'
      : 'Extended recovery windows may create decision fatigue.',
    equityWhiplash > 55
      ? 'Equity whiplash could weaken rule-following consistency.'
      : 'Equity movement is unlikely to disrupt execution discipline.',
    overtradingTone === 'fail'
      ? 'Trade frequency may increase impulsive execution risk.'
      : 'Execution cadence remains unlikely to trigger rapid-fire behavior.'
  ];
  const intelligenceStrengths = [
    payoffRatio >= 1.4 ? 'Strong payoff structure' : null,
    labStats.expectancy > 0 && rollingExpectancy > 0 ? 'Stable expectancy profile' : null,
    rhythmScore >= 70 ? 'Consistent recovery rhythm' : null,
    bestSession?.label === 'New York' && bestSession.expectancy > 0 ? 'Strong New York session edge' : null,
    psychologicalScore >= 72 ? 'Low emotional pressure' : null,
    riskPressureTone === 'ready' ? 'Controlled capital pressure' : null,
    consistencyTone === 'ready' ? 'Repeatable validation buckets' : null
  ].filter(Boolean) as string[];
  const intelligenceWeaknesses = [
    closedTrades < 100 ? 'Sample size remains limited' : null,
    concentrationWarning ? 'Edge concentrated in one context pocket' : null,
    riskPressureTone !== 'ready' ? 'Elevated capital pressure' : null,
    psychologicalTone !== 'ready' ? 'Psychological survivability concerns' : null,
    consistencyTone !== 'ready' ? 'Weak rolling stability' : null,
    contextConfidenceTone !== 'ready' ? 'Context reliability is still developing' : null
  ].filter(Boolean) as string[];
  const intelligenceRedFlags = [
    edgeDecayTone === 'fail' ? 'Edge decay detected' : null,
    recoveryQuality < 40 ? 'Recovery instability' : null,
    outlierDependency > 45 ? 'Extreme outlier dependency' : null,
    overtradingTone === 'fail' ? 'Overtrading pressure' : null,
    contextConfidenceTone === 'fail' ? 'Weak context reliability' : null,
    psychologicalStatus === 'UNSUSTAINABLE' ? 'Execution survivability failure' : null
  ].filter(Boolean) as string[];
  const intelligenceConfidenceScore = Math.round(
    Math.min(35, closedTrades / 3) +
    (consistencyTone === 'ready' ? 25 : consistencyTone === 'caution' ? 14 : 4) +
    (contextConfidenceTone === 'ready' ? 20 : contextConfidenceTone === 'caution' ? 11 : 3) +
    (tradeReturns.length >= rollingWindow ? 20 : 6)
  );
  const intelligenceTone: ValidationTone = intelligenceConfidenceScore >= 75 ? 'ready' : intelligenceConfidenceScore >= 45 ? 'caution' : 'fail';
  const intelligenceConfidence = intelligenceTone === 'ready' ? 'HIGH CONFIDENCE' : intelligenceTone === 'caution' ? 'DEVELOPING CONFIDENCE' : 'LOW CONFIDENCE';
  const deploymentAdvisory =
    closedTrades < 30 || intelligenceConfidence === 'LOW CONFIDENCE'
      ? 'INSUFFICIENT VALIDATION'
      : ready && intelligenceRedFlags.length === 0 && psychologicalTone !== 'fail'
        ? 'READY FOR LIVE DEPLOYMENT'
        : notReady || intelligenceRedFlags.length >= 2
          ? 'HIGH RISK DEPLOYMENT'
          : 'PAPER TRADE ONLY';
  const advisoryTone: ValidationTone =
    deploymentAdvisory === 'READY FOR LIVE DEPLOYMENT'
      ? 'ready'
      : deploymentAdvisory === 'HIGH RISK DEPLOYMENT'
        ? 'fail'
        : 'caution';
  const strongestCharacteristic = intelligenceStrengths[0] || 'No dominant institutional strength confirmed';
  const biggestWeakness = intelligenceWeaknesses[0] || 'No major weakness isolated';
  const deploymentRecommendation =
    deploymentAdvisory === 'READY FOR LIVE DEPLOYMENT'
      ? 'Suitable for controlled live deployment'
      : deploymentAdvisory === 'HIGH RISK DEPLOYMENT'
        ? 'Avoid live deployment until stability improves'
        : deploymentAdvisory === 'INSUFFICIENT VALIDATION'
          ? 'Continue paper validation'
          : riskPressureTone === 'fail' || psychologicalTone === 'fail'
            ? 'Reduce risk allocation'
            : 'Continue paper validation';
  const intelligenceNarrative = [
    labStats.expectancy > 0 && labStats.profitFactor >= 1
      ? `The strategy demonstrates positive expectancy with a ${labStats.profitFactor.toFixed(2)} profit factor, but deployment confidence is governed by sample depth and stability confirmation.`
      : 'The strategy does not yet demonstrate a sufficient positive edge for capital deployment.',
    consistencyTone === 'ready'
      ? 'Performance appears stable across recent validation buckets, supporting repeatability under the current ruleset.'
      : 'Performance repeatability remains incomplete, so the current output should be treated as validation evidence rather than deployment clearance.',
    contextConfidenceTone === 'ready'
      ? `Market context evidence is strongest around ${bestSession?.label || 'the leading session'} and ${bestSymbol?.label || 'the leading symbol'}.`
      : 'Context dependency remains underdeveloped, and timing or symbol concentration should be validated before scaling.',
    psychologicalTone === 'ready'
      ? 'Psychological execution pressure remains manageable under current streak, cadence, and recovery behavior.'
      : 'Execution pressure could challenge discipline if losses cluster or cadence accelerates during live conditions.'
  ];

  if (closedTrades === 0) {
    return (
      <div className={`strategy-lab ${denseMode ? 'strategy-lab--dense' : ''} flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
        <style>{strategyLabStyles}</style>
        <header className="flex items-center justify-between border-b border-brand-border pb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">STRATEGY LAB</h2>
            <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">LIVE DEPLOYMENT VALIDATION // PHASE 1.2</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <DensityToggle denseMode={denseMode} onChange={setDenseMode} />
            {['AI VALIDATION ACTIVE', 'NEURAL ANALYSIS ONLINE'].map((tag) => (
              <span key={tag} className="rounded-full border border-brand-accent/25 bg-brand-accent/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-accent shadow-[0_0_18px_rgba(52,211,153,0.08)]">
                {tag}
              </span>
            ))}
            {isAdmin && (
              <button
                onClick={() => setDemoMode(true)}
                className="rounded-full border border-brand-warning/30 bg-brand-warning/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-warning transition-all hover:bg-brand-warning hover:text-brand-bg"
              >
                DEMO DATA
              </button>
            )}
          </div>
        </header>
        <div className="flex md:hidden">
          <DensityToggle denseMode={denseMode} onChange={setDenseMode} />
        </div>
        <div className="technical-panel strategy-empty-state relative overflow-hidden p-16 text-center flex flex-col items-center gap-4 bg-brand-elevated/30 border-brand-border/60">
          <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10 pointer-events-none" />
          <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
          <div className="strategy-radar pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-brand-accent/20 bg-brand-accent/5 blur-[1px]" />
          <ShieldAlert size={44} className="relative z-10 text-brand-text-dim opacity-40" />
          <p className="relative z-10 text-xl font-black text-brand-text-bright tracking-tight">No closed trades yet. Complete backtest samples to unlock validation.</p>
          <div className="relative z-10 mt-4 rounded-lg border border-brand-border/50 bg-brand-bg/40 px-4 py-3 text-left">
            <p className="label-caps !mb-2">Validation Terminal</p>
            <p className="text-[11px] font-mono uppercase tracking-tight text-brand-text-dim">Validation terminal is online. Execute and close backtest samples to activate readiness scoring.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setDemoMode(true)}
              className="relative z-10 mt-2 rounded-lg border border-brand-warning/30 bg-brand-warning/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-warning transition-all hover:bg-brand-warning hover:text-brand-bg"
            >
              Preview with Demo Data
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`strategy-lab ${denseMode ? 'strategy-lab--dense' : ''} flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <style>{strategyLabStyles}</style>
      <header className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">STRATEGY LAB</h2>
          <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">LIVE DEPLOYMENT VALIDATION // PHASE 1.2</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <DensityToggle denseMode={denseMode} onChange={setDenseMode} />
          {['AI VALIDATION ACTIVE', 'NEURAL ANALYSIS ONLINE'].map((tag) => (
            <span key={tag} className="rounded-full border border-brand-accent/25 bg-brand-accent/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-brand-accent shadow-[0_0_18px_rgba(52,211,153,0.08)]">
              {tag}
            </span>
          ))}
          {isAdmin && (
            <button
              onClick={() => setDemoMode((value) => !value)}
              className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${
                demoMode
                  ? 'border-sky-400/40 bg-sky-400/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.12)]'
                  : 'border-brand-warning/30 bg-brand-warning/10 text-brand-warning hover:bg-brand-warning hover:text-brand-bg'
              }`}
            >
              DEMO DATA
            </button>
          )}
        </div>
      </header>
      <div className="flex md:hidden">
        <DensityToggle denseMode={denseMode} onChange={setDenseMode} />
      </div>

      {demoMode && (
        <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.08)]">
          DEMO MODE // LOCAL PREVIEW ONLY
        </div>
      )}

      <div className="strategy-verdict-bar sticky top-0 z-30 rounded-lg border border-brand-border/70 bg-brand-bg/90 px-3 py-2 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
            {[
              ['Status', status.label, statusTone],
              ['Readiness', `${readinessScore}/100`, statusTone],
              ['Risk', riskPressureLabel.replace(' RISK', ''), riskPressureTone],
              ['Edge', edgeStatus.replace(' EDGE', ''), edgeTone],
              ['Consistency', consistencyStatus, consistencyTone],
              ['Psych', psychologicalStatus, psychologicalTone],
              ['AI Review', deploymentAdvisory.replace(' DEPLOYMENT', ''), advisoryTone]
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded border border-brand-border/50 bg-brand-elevated/30 px-2 py-1.5">
                <p className="text-[7px] font-black uppercase tracking-widest text-brand-text-dim">{label}</p>
                <p className={`truncate text-[10px] font-black uppercase tracking-tight ${toneStyles[tone as ValidationTone].text}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ['AI Review', '#strategy-intelligence'],
              ['Validation', '#strategy-validation'],
              ['Risk', '#strategy-risk'],
              ['Edge', '#strategy-edge'],
              ['Consistency', '#strategy-consistency'],
              ['Context', '#strategy-context'],
              ['Psych', '#strategy-psychology']
            ].map(([label, href]) => (
              <a key={label} href={href} className="rounded border border-brand-border bg-brand-elevated/40 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-brand-text-dim transition-colors hover:border-brand-accent/40 hover:text-brand-accent">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <AIStrategyIntelligenceSection
        deploymentAdvisory={deploymentAdvisory}
        advisoryTone={advisoryTone}
        strongestCharacteristic={strongestCharacteristic}
        biggestWeakness={biggestWeakness}
        deploymentRecommendation={deploymentRecommendation}
        intelligenceConfidence={intelligenceConfidence}
        intelligenceTone={intelligenceTone}
        strengths={intelligenceStrengths}
        weaknesses={intelligenceWeaknesses}
        redFlags={intelligenceRedFlags}
        narrative={intelligenceNarrative}
      />
      <DeploymentValidationSection
        labStats={labStats}
        closedTrades={closedTrades}
        netR={netR}
        status={status}
        statusTone={statusTone}
        readinessScore={readinessScore}
        reason={reason}
        deploymentMeaning={deploymentMeaning}
        regime={regime}
        deploymentStage={deploymentStage}
        systemIndicators={systemIndicators}
        reliability={reliability}
        rotatingInsights={rotatingInsights}
        insightIndex={insightIndex}
        riskTone={riskTone}
        riskState={riskState}
      />
      <details id="strategy-risk" open className="group flex scroll-mt-28 flex-col gap-4">
        <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">RISK INTELLIGENCE</h3>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Capital Protection // Drawdown</p>
          </div>
          <span className={`hidden rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest md:inline-flex ${toneStyles[riskPressureTone].border} ${toneStyles[riskPressureTone].bg} ${toneStyles[riskPressureTone].text}`}>
            {riskPressureLabel}
          </span>
        </summary>

        <div className={`technical-panel relative overflow-hidden border ${toneStyles[riskPressureTone].border} bg-brand-elevated/25 p-4`}>
          <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
          <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-danger/10 to-transparent" />
          <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-3">
            <VerdictTile label="Capital Stability" value={capitalVerdict} tone={riskPressureTone} />
            <VerdictTile label="Risk Pressure" value={riskPressureLabel.replace(' RISK', '')} tone={riskPressureTone} />
            <VerdictTile label="Deployment Safety" value={riskPressureTone === 'ready' ? 'DEPLOYABLE' : riskPressureTone === 'caution' ? 'MONITOR' : 'SUSPEND'} tone={riskPressureTone} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-caps !mb-0">Underwater Drawdown</p>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-danger/70">Equity Submersion</span>
            </div>
            <UnderwaterDrawdownChart data={labStats.equityCurve.map((point) => ({ trade: point.trade, drawdown: point.drawdown || 0 }))} tone={riskPressureTone} />
          </div>

          <div className={`technical-panel relative overflow-hidden p-5 border ${toneStyles[riskPressureTone].border} bg-brand-elevated/25`}>
            <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
            <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-danger/10 to-transparent" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <p className="label-caps !mb-2">Risk Pressure State</p>
                <h4 className={`text-4xl font-black tracking-tighter ${toneStyles[riskPressureTone].text}`}>{riskPressureLabel}</h4>
                <p className="mt-2 max-w-sm text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
                  Drawdown, recovery, loss clustering, and expectancy are compressed into current capital pressure.
                </p>
              </div>
              <div className={`strategy-pulse-ring h-16 w-16 rounded-full border ${toneStyles[riskPressureTone].border} ${toneStyles[riskPressureTone].bg} flex items-center justify-center`}>
                <ShieldAlert size={24} className={toneStyles[riskPressureTone].text} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className={`technical-panel border ${toneStyles[drawdownSeverity].border} bg-brand-elevated/20 p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="label-caps !mb-0">Worst Drawdown Event</p>
              <span className={`rounded-full border ${toneStyles[drawdownSeverity].border} ${toneStyles[drawdownSeverity].bg} px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${toneStyles[drawdownSeverity].text}`}>
                {drawdownSeverity === 'ready' ? 'CONTROLLED' : drawdownSeverity === 'caution' ? 'MATERIAL' : 'SEVERE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RiskMetricCard label="Depth" value={`-${(drawdownDepths[worstDrawdownIndex] || 0).toFixed(2)}R`} tone={drawdownSeverity} />
              <RiskMetricCard label="Recovery" value={`${recoveryDuration} Trades`} tone={recoveryDuration <= 8 ? 'ready' : recoveryDuration <= 18 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Loss Streak" value={String(worstLossCluster)} tone={worstLossCluster <= 2 ? 'ready' : worstLossCluster <= 4 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Event Index" value={`#${Math.max(0, worstDrawdownIndex)}`} tone={drawdownSeverity} />
            </div>
          </div>

          <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-caps !mb-0">Loss Cluster Analysis</p>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Consecutive Loss Telemetry</span>
            </div>
            <ClusterTelemetry clusters={lossClusters} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <RiskMetricCard label="Max Drawdown" value={`-${labStats.maxDrawdown.toFixed(2)}R`} tone={labStats.maxDrawdown <= 5 ? 'ready' : labStats.maxDrawdown <= 10 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Avg Drawdown" value={`-${avgDrawdown.toFixed(2)}R`} tone={avgDrawdown <= 2 ? 'ready' : avgDrawdown <= 5 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Largest Loss" value={formatR(largestLoss)} tone={largestLoss >= -1 ? 'ready' : largestLoss >= -2 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Consec. Losses" value={String(labStats.maxConsecutiveLosses)} tone={labStats.maxConsecutiveLosses <= 2 ? 'ready' : labStats.maxConsecutiveLosses <= 4 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Avg Loss" value={formatR(avgLoss)} tone={avgLoss >= -1 ? 'ready' : avgLoss >= -2 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Recovery" value={labStats.recoveryFactor > 0 ? labStats.recoveryFactor.toFixed(2) : '0.00'} tone={labStats.recoveryFactor > 1 ? 'ready' : labStats.recoveryFactor > 0 ? 'caution' : 'fail'} />
          <RiskMetricCard label="Equity Vol" value={equityVolatility.toFixed(2)} tone={equityVolatility <= 1 ? 'ready' : equityVolatility <= 2 ? 'caution' : 'fail'} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={14} className="text-brand-accent" />
              <p className="label-caps !mb-0">Capital Stability Analysis</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <StabilityBar label="Equity Stability" value={equityStability} tone={equityStability >= 70 ? 'ready' : equityStability >= 40 ? 'caution' : 'fail'} />
              <StabilityBar label="Drawdown Recovery Speed" value={recoverySpeed} tone={recoverySpeed >= 70 ? 'ready' : recoverySpeed > 0 ? 'caution' : 'fail'} />
              <StabilityBar label="Loss Cluster Detection" value={100 - lossClusterPressure} tone={lossClusterPressure <= 35 ? 'ready' : lossClusterPressure <= 70 ? 'caution' : 'fail'} />
              <StabilityBar label="Volatility Pressure" value={100 - volatilityPressure} tone={volatilityPressure <= 35 ? 'ready' : volatilityPressure <= 70 ? 'caution' : 'fail'} />
            </div>
            <div className={`mt-4 rounded-lg border ${toneStyles[reboundTone].border} ${toneStyles[reboundTone].bg} p-4`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="label-caps !mb-0">Recovery Efficiency</p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${toneStyles[reboundTone].text}`}>{recoveryQuality}% Quality</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((segment) => (
                  <span key={segment} className={`h-2 rounded-full ${segment < Math.ceil(recoveryQuality / 12) ? toneStyles[reboundTone].bar : 'bg-brand-border/40'}`} />
                ))}
              </div>
              <p className="mt-3 text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
                Rebound quality blends recovery factor, post-loss stability, and loss-cluster absorption.
              </p>
            </div>
          </div>

          <div className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="label-caps !mb-0">Capital Narrative</p>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-danger strategy-blink" />
            </div>
            <div className="space-y-2">
              {riskInsights.map((insight, index) => (
                <div key={insight} className={`rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight ${index === insightIndex % riskInsights.length ? 'text-brand-text-bright' : 'text-brand-text-dim'}`}>
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="technical-panel p-4 bg-brand-elevated/15 border-brand-border/50">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="label-caps !mb-0">Risk Timeline</p>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Stable To Critical Flow</span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            {['STABLE', 'PRESSURED', 'RECOVERING', 'CRITICAL'].map((stage, index) => {
              const active = index === riskTimelineIndex;
              const passed = index < riskTimelineIndex;
              const tone = active ? riskPressureTone : passed ? 'caution' : 'ready';
              return (
                <div key={stage} className={`relative overflow-hidden rounded-lg border px-3 py-3 ${active ? `${toneStyles[tone].border} ${toneStyles[tone].bg}` : 'border-brand-border/50 bg-brand-bg/30'}`}>
                  {active && <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? toneStyles[tone].text : 'text-brand-text-dim'}`}>{stage}</span>
                    <span className={`h-2 w-2 rounded-full ${active ? toneStyles[tone].bar : 'bg-brand-border'} ${active ? 'strategy-blink' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </details>

      <details id="strategy-edge" open className="group flex scroll-mt-28 flex-col gap-4">
        <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">EDGE VALIDATION</h3>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Payoff // Expectancy</p>
          </div>
          <span className={`hidden rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest md:inline-flex ${toneStyles[edgeTone].border} ${toneStyles[edgeTone].bg} ${toneStyles[edgeTone].text}`}>
            {edgeStatus}
          </span>
        </summary>

        <div className={`technical-panel relative overflow-hidden border ${toneStyles[edgeTone].border} bg-brand-elevated/25 p-5`}>
          <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
          <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
          <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="label-caps !mb-2">Edge Quality Score</p>
              <div className={`text-6xl font-black leading-none tracking-tighter ${toneStyles[edgeTone].text}`}>
                {edgeScore}<span className="text-2xl opacity-50">/100</span>
              </div>
              <p className={`mt-2 text-lg font-black uppercase tracking-tight ${toneStyles[edgeTone].text}`}>{edgeStatus}</p>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
                One-page verdict: edge confirmation, stability, payoff health, and sample trust.
              </p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <VerdictTile label="Has Edge" value={labStats.expectancy > 0 && labStats.profitFactor >= 1 ? 'YES' : 'NO'} tone={labStats.expectancy > 0 && labStats.profitFactor >= 1 ? 'ready' : 'fail'} />
                <VerdictTile label="Stable" value={edgeDecayTone === 'ready' ? 'YES' : edgeDecayTone === 'caution' ? 'WATCH' : 'NO'} tone={edgeDecayTone} />
                <VerdictTile label="Payoff" value={payoffRatio >= 1.4 ? 'HEALTHY' : payoffRatio >= 1 ? 'THIN' : 'WEAK'} tone={payoffRatio >= 1.4 ? 'ready' : payoffRatio >= 1 ? 'caution' : 'fail'} />
                <VerdictTile label="Sample" value={closedTrades >= 100 ? 'TRUSTED' : closedTrades >= 30 ? 'BUILDING' : 'THIN'} tone={closedTrades >= 100 ? 'ready' : closedTrades >= 30 ? 'caution' : 'fail'} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-caps !mb-0">Payoff Structure</p>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Core Terms</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <RiskMetricCard label="Avg Winner" value={formatR(avgWinner)} tone={avgWinner > 1 ? 'ready' : avgWinner > 0 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Avg Loser" value={`-${avgLoserAbs.toFixed(2)}R`} tone={avgLoserAbs <= 1 ? 'ready' : avgLoserAbs <= 1.5 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Payoff Ratio" value={payoffRatio.toFixed(2)} tone={payoffRatio >= 1.4 ? 'ready' : payoffRatio >= 1 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Median R" value={formatR(medianR)} tone={medianR > 0 ? 'ready' : medianR === 0 ? 'caution' : 'fail'} />
              <RiskMetricCard label="Best R" value={formatR(bestR)} tone={bestR > 1 ? 'ready' : 'caution'} />
              <RiskMetricCard label="Worst R" value={formatR(worstR)} tone={worstR >= -1 ? 'ready' : worstR >= -2 ? 'caution' : 'fail'} />
            </div>
          </div>

          <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-caps !mb-0">Distribution</p>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Outcomes + Tails</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <DistributionBar label="Positive R Trades" value={winningReturns.length} total={tradeReturns.length} tone="ready" />
              <DistributionBar label="Negative R Trades" value={losingReturns.length} total={tradeReturns.length} tone="fail" />
              <DistributionBar label="Break-even Trades" value={breakEvenReturns.length} total={tradeReturns.length} tone="caution" />
              <DistributionBar label="Fat-tail Winners" value={outlierWinners} total={tradeReturns.length} tone={outlierDependency > 35 ? 'caution' : 'ready'} />
              <DistributionBar label="Fat-tail Losses" value={outlierLosers} total={tradeReturns.length} tone={outlierLosers > 0 ? 'fail' : 'ready'} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="label-caps !mb-0">Edge Stability</p>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Last 30 Executions</span>
            </div>
            {tradeReturns.length >= rollingWindow ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <StabilityBar label="Rolling Expectancy" value={Math.min(100, Math.max(0, (rollingExpectancy + 1) * 40))} tone={rollingExpectancy > 0 ? 'ready' : 'fail'} />
                <StabilityBar label="Rolling Profit Factor" value={Math.min(100, rollingProfitFactor * 28)} tone={rollingProfitFactor >= 1.5 ? 'ready' : rollingProfitFactor >= 1 ? 'caution' : 'fail'} />
                <StabilityBar label="Rolling Winrate" value={rollingWinrate} tone={rollingWinrate >= 50 ? 'ready' : rollingWinrate >= 45 ? 'caution' : 'fail'} />
              </div>
            ) : (
              <div className="rounded-lg border border-brand-warning/30 bg-brand-warning/10 p-4 text-[10px] font-black uppercase tracking-[0.18em] text-brand-warning">
                Insufficient sample depth for rolling edge validation.
              </div>
            )}
            <div className={`mt-3 rounded-lg border ${toneStyles[edgeDecayTone].border} ${toneStyles[edgeDecayTone].bg} p-3`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-black uppercase tracking-tight ${toneStyles[edgeDecayTone].text}`}>{edgeDecayLabel}</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-dim">
                  Early {formatR(earlyExpectancy)} / Recent {formatR(recentExpectancy)}
                </span>
              </div>
            </div>
          </div>

          <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="label-caps !mb-0">Edge Notes</p>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent strategy-blink" />
            </div>
            <div className="space-y-2">
              {edgeInsights.map((insight, index) => (
                <div key={insight} className={`rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight ${index === insightIndex % edgeInsights.length ? 'text-brand-text-bright' : 'text-brand-text-dim'}`}>
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>

      <ConsistencyEngineSection
        tradeReturnsLength={tradeReturns.length}
        rollingWindow={rollingWindow}
        consistencyTone={consistencyTone}
        consistencyStatus={consistencyStatus}
        consistencyScore={consistencyScore}
        greenPeriods={greenPeriods}
        redPeriods={redPeriods}
        smoothnessScore={smoothnessScore}
        driftLabel={driftLabel}
        driftTone={driftTone}
        rhythmScore={rhythmScore}
        periodBuckets={periodBuckets}
        bestPeriod={bestPeriod}
        worstPeriod={worstPeriod}
        avgPeriodR={avgPeriodR}
        stabilitySpread={stabilitySpread}
        winrateSpread={winrateSpread}
        rollingProfitFactor={rollingProfitFactor}
        driftDelta={driftDelta}
        volatilityPressure={volatilityPressure}
        maxDrawdown={labStats.maxDrawdown}
        earlyExpectancy={earlyExpectancy}
        recentExpectancy={recentExpectancy}
        consistencyInsights={consistencyInsights}
        insightIndex={insightIndex}
      />
      <MarketContextSection
        closedTrades={closedTrades}
        contextScore={contextScore}
        contextTone={contextTone}
        contextStatus={contextStatus}
        contextConfidenceTone={contextConfidenceTone}
        contextConfidenceLabel={contextConfidenceLabel}
        bestSession={bestSession}
        bestSymbol={bestSymbol}
        bestDay={bestDay}
        weakestContext={weakestContext}
        concentrationWarning={concentrationWarning}
        rankedSessions={rankedSessions}
        rankedSymbols={rankedSymbols}
        rankedDays={rankedDays}
        dayRows={dayRows}
        contextInsights={contextInsights}
        insightIndex={insightIndex}
        contextRankTone={contextRankTone}
        contextRankLabel={contextRankLabel}
      />
      <PsychologicalAnalyticsSection
        psychologicalScore={psychologicalScore}
        psychologicalStatus={psychologicalStatus}
        psychologicalTone={psychologicalTone}
        lossStreakPressure={lossStreakPressure}
        drawdownStress={drawdownStress}
        recoveryFatigue={recoveryFatigue}
        volatilityStress={volatilityStress}
        equityWhiplash={equityWhiplash}
        longestLossStreak={labStats.maxConsecutiveLosses}
        emotionalLoad={emotionalLoad}
        recoveryDuration={recoveryDuration}
        averageStressLevel={averageStressLevel}
        strategySmoothness={strategySmoothness}
        pressureZones={pressureZones}
        overtradingStatus={overtradingStatus}
        overtradingTone={overtradingTone}
        averageTradesPerDay={averageTradesPerDay}
        maxTradesPerDay={maxTradesPerDay}
        psychologicalTimelineIndex={psychologicalTimelineIndex}
        psychologicalInsights={psychologicalInsights}
        insightIndex={insightIndex}
      />
      <section className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-brand-accent" />
          <p className="label-caps !mb-0">Decision Checklist</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item) => {
            const tone = toneStyles[item.tone];
            const Icon = item.tone === 'ready' ? CheckCircle2 : item.tone === 'caution' ? AlertTriangle : XCircle;
            const stateLabel = item.tone === 'ready' ? 'PASS' : item.tone === 'caution' ? 'WARNING' : 'FAIL';
            return (
              <div key={item.label} className={`flex items-center justify-between gap-4 rounded-lg border ${tone.border} ${tone.bg} p-3`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={16} className={tone.text} />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-text-bright truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${tone.text}`}>{stateLabel}</span>
                  <span className={`text-xs font-black font-mono ${tone.text}`}>{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};


