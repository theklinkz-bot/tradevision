import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  PieChart, 
  Activity, 
  TrendingUp, 
  Zap, 
  ArrowDownRight, 
  RefreshCcw, 
  TrendingDown, 
  Database,
  Info,
  BarChart3,
  Target,
  Clock,
  LayoutDashboard, 
  ListFilter
} from 'lucide-react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { TradeStats, AnalysisHistoryItem, Strategy } from '../types';
import { StrategyManager } from './StrategyManager';

export const InfoTooltip = ({ content, language = 'EN' }: { content: string, language?: 'EN' | 'TH' }) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <button className="text-brand-text-dim hover:text-brand-accent transition-colors ml-1 focus:outline-none">
            <Info size={12} />
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-[100] select-none rounded-[4px] bg-brand-elevated px-[15px] py-[10px] text-[11px] leading-tight text-brand-text-bright shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] border border-brand-accent/20 animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <div className="max-w-[200px] uppercase font-mono tracking-tighter leading-relaxed">
              {content}
            </div>
            <RadixTooltip.Arrow className="fill-brand-elevated stroke-brand-accent/20" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export const ProgressCircle = ({ value, size = 100, strokeWidth = 8, color = "var(--brand-accent)" }: { value: number, size?: number, strokeWidth?: number, color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-brand-border/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold font-mono tracking-tight text-brand-text-bright">{value.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export const Sparkline = ({ data, color = "var(--brand-accent)" }: { data: number[], color?: string }) => {
  if (!data || data.length < 2) return <div className="h-full w-full opacity-10 flex items-center justify-center">--</div>;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 90 - ((val - min) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </svg>
    </div>
  );
};

export const DataCard = ({ label, value, mono = true, subValue }: { label: string; value: string | number | null; mono?: boolean; subValue?: string }) => {
  return (
    <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border">
      <label className="label-caps block">{label}</label>
      <div className="flex flex-col">
        <span className={`${mono ? 'monospace-data text-xl' : 'text-xl font-bold text-brand-text-bright'}`}>
          {value ?? '--'}
        </span>
        {subValue && <span className="text-[10px] opacity-40 uppercase mt-1">{subValue}</span>}
      </div>
    </div>
  );
};

export const PriceLevel = ({ label, value, color, icon: Icon }: { label: string; value: number | null; color: string; icon: any }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-brand-bg/30 rounded-lg border border-brand-border/50 group hover:border-brand-accent transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-1.5 h-10 rounded-full ${color}`} />
        <div>
          <span className="label-caps block mb-0">{label}</span>
          <div className="flex items-center gap-2">
            <Icon size={14} className="opacity-40" />
            <span className="monospace-data text-2xl tracking-normal">{value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatsPanelProps {
  stats: TradeStats;
  history: AnalysisHistoryItem[];
  t: any;
  tradingMode: 'live' | 'backtest';
  strategies: Strategy[];
  onAddStrategy: (name: string, color: string) => Promise<Strategy>;
  onUpdateStrategy: (id: string, name: string, color: string) => Promise<void>;
  onDeleteStrategy: (id: string) => Promise<void>;
}

export const StatsPanel = ({ 
  stats, 
  history, 
  t, 
  tradingMode,
  strategies,
  onAddStrategy,
  onUpdateStrategy,
  onDeleteStrategy
}: StatsPanelProps) => {
  const showStrategyAnalysis = tradingMode === 'backtest' && (stats.strategyAnalysis?.length ?? 0) > 0;

  const winRateColor = stats.winRate >= 60 ? 'var(--trade-long)' : stats.winRate >= 45 ? 'var(--brand-accent)' : 'var(--trade-short)';
  const pfColor = stats.profitFactor >= 2 ? 'var(--trade-long)' : stats.profitFactor >= 1 ? 'var(--brand-accent)' : 'var(--trade-short)';
  const expectancyColor = stats.expectancy > 0 ? 'var(--trade-long)' : stats.expectancy < 0 ? 'var(--trade-short)' : 'var(--status-neutral)';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
      {/* Primary Large Metrics: Win Rate (3 cols) */}
      <motion.div 
        whileHover={{ y: -3, scale: 1.005 }}
        className="lg:col-span-3 min-h-[160px] technical-panel p-4 flex flex-col items-center justify-center gap-3 bg-brand-elevated relative group overflow-hidden shadow-lg border-brand-border/40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-text-bright/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between w-full relative z-10">
          <label className="label-caps !mb-0 flex items-center text-brand-text-dim text-[10px]">
            <PieChart size={12} className="mr-2 opacity-50" />
            {t.ui.probability_spectrum}
            <InfoTooltip content={t.analytics.winrate} />
          </label>
          <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest text-[8px]">{t.ui.system_accuracy}</span>
        </div>

        <div className="relative z-10 flex items-center gap-8">
          <ProgressCircle value={stats.winRate} size={100} strokeWidth={8} color={winRateColor} />
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] label-caps !mb-0 opacity-40">Positive</span>
              <span className="text-xl font-bold font-mono text-trade-long tracking-tighter">
                {history.filter(h => h.status === 'Win').length.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] label-caps !mb-0 opacity-40">Negative</span>
              <span className="text-xl font-bold font-mono text-trade-short tracking-tighter">
                {history.filter(h => h.status === 'Loss').length.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Large Metrics: Profit Factor (3 cols) */}
      <motion.div 
        whileHover={{ y: -3, scale: 1.005 }}
        className="lg:col-span-3 min-h-[160px] technical-panel p-4 flex flex-col justify-between bg-brand-elevated relative group overflow-hidden shadow-lg border-brand-border/40"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-text-bright/[0.01] to-transparent pointer-events-none" />
        <Sparkline data={stats.equityCurve.map(e => e.equity)} color={pfColor} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <label className="label-caps !mb-0 flex items-center text-brand-text-dim text-[10px]">
              <Activity size={12} className="mr-2 opacity-50" />
              {t.ui.profit_factor}
              <InfoTooltip content={t.analytics.pf} />
            </label>
            <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">{t.ui.eff_coeff}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-brand-text-bright font-mono tracking-tighter">
              {stats.profitFactor > 0 ? stats.profitFactor.toFixed(2) : '0.00'}
            </span>
            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${stats.profitFactor >= 2 ? 'bg-trade-long/10 text-trade-long' : stats.profitFactor >= 1 ? 'bg-brand-accent/10 text-brand-accent' : 'bg-trade-short/10 text-trade-short'}`}>
              {stats.profitFactor >= 2 ? 'HIGH' : stats.profitFactor >= 1 ? 'OPTIMAL' : 'LOW'}
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-2 border-t border-brand-border/10 mt-3 flex justify-between items-center text-[9px] font-mono uppercase">
          <div className="flex flex-col">
            <span className="opacity-20 lowercase italic">Baseline</span>
            <span className="text-brand-text-bright/40 text-[8px]">1.00 PF</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="opacity-20 lowercase italic">Contr.</span>
            <span className={`font-bold ${stats.profitFactor >= 1 ? "text-trade-long" : "text-trade-short"}`}>
              {stats.profitFactor >= 1 ? '+' : ''}{((stats.profitFactor - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Medium Metrics: R:R, Expectancy, Max DD (2 cols each) */}
      <motion.div 
        whileHover={{ y: -3 }}
        className="lg:col-span-2 technical-panel py-2 px-3 flex flex-col gap-1 relative group transition-all hover:border-brand-border shadow-md"
      >
        <div className="flex items-center justify-between">
          <label className="label-caps !mb-0 flex items-center opacity-60">
            <TrendingUp size={10} className="mr-2 opacity-50" />
            {t.ui.risk_reward}
            <InfoTooltip content={t.analytics.avgrr} />
          </label>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-brand-text-bright font-mono tracking-tighter leading-none mb-1">
            1:{stats.avgRR.toFixed(2)}
          </span>
          <div className="w-full bg-brand-border/20 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.avgRR / 5) * 100)}%` }}
              className={`h-full ${stats.avgRR >= 2 ? 'bg-trade-long' : stats.avgRR >= 1 ? 'bg-brand-accent' : 'bg-trade-short'}`}
              style={{ opacity: 0.6 }}
            />
          </div>
        </div>
        <p className="text-[7px] text-brand-text-dim/20 uppercase tracking-widest font-mono text-center">STATISTICAL MEAN RETURN NODE</p>
      </motion.div>

      <motion.div 
        whileHover={{ y: -3 }}
        className="lg:col-span-2 technical-panel py-2 px-3 flex flex-col gap-1 bg-brand-elevated relative group transition-all hover:border-brand-border shadow-md overflow-hidden"
      >
        <div className="absolute inset-0 dot-matrix opacity-10 group-hover:opacity-20 transition-opacity" />
        
        <div className="flex items-center justify-between relative z-10">
          <label className="label-caps !mb-0 flex items-center opacity-60">
            <Zap size={10} className="mr-2 opacity-30" />
            {t.ui.statistical_edge}
            <InfoTooltip content={t.analytics.expectancy} />
          </label>
          <div className="text-[8px] font-mono text-brand-text-dim opacity-20 uppercase tracking-tighter">{t.ui.yield_node}</div>
        </div>

        <div className="flex flex-col relative z-10">
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold font-mono tracking-tighter leading-none mb-1 ${expectancyColor === 'var(--trade-long)' ? 'text-trade-long' : expectancyColor === 'var(--trade-short)' ? 'text-trade-short' : 'text-brand-text-dim'}`}>
              {stats.expectancy > 0 ? '+' : ''}{stats.expectancy.toFixed(2)}
              <span className="text-xs ml-0.5 opacity-40">R</span>
            </span>
            <span className={`text-[10px] font-mono font-bold opacity-60`}>
               {(stats.expectancy * 100).toFixed(0)}% <span className="text-[8px] opacity-40">EFF</span>
            </span>
          </div>
          
          <div className="mt-1 h-1 w-full bg-brand-border/20 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, (Math.abs(stats.expectancy) / 1.5) * 100))}%` }}
              className={`h-full ${expectancyColor === 'var(--trade-long)' ? 'bg-trade-long' : expectancyColor === 'var(--trade-short)' ? 'bg-trade-short' : 'bg-status-neutral'}`}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ opacity: 0.6 }}
            />
          </div>
        </div>
        
        <p className="text-[7px] text-brand-text-dim/20 uppercase tracking-widest font-mono text-center relative z-10">
          Mean System Yield Capability
        </p>
      </motion.div>

      <motion.div 
        whileHover={{ y: -3 }}
        className="lg:col-span-2 technical-panel py-2 px-3 flex flex-col gap-1 relative group transition-all hover:border-trade-short/30 shadow-md"
      >
        <div className="flex items-center justify-between">
          <label className="label-caps !mb-0 flex items-center text-trade-short/70 font-bold">
            <ArrowDownRight size={10} className="mr-2" />
            {t.ui.max_drawdown_label}
            <InfoTooltip content={t.analytics.maxdd} />
          </label>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-trade-short font-mono tracking-tighter leading-none mb-1">
            -{stats.maxDrawdown.toFixed(2)}R
          </span>
          <div className="flex gap-1 h-1">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className={`h-full flex-1 rounded-sm ${i <= Math.min(10, Math.ceil(stats.maxDrawdown)) ? 'bg-trade-short/40' : 'bg-brand-border/20'}`} />
            ))}
          </div>
        </div>
        <p className="text-[7px] text-brand-text-dim/20 uppercase tracking-widest font-mono text-trade-short/40 text-center">{t.ui.risk_boundary}</p>
      </motion.div>

      {/* Small Tiles */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-0.5">
        {[
          { label: 'Recovery Factor', value: stats.recoveryFactor > 0 ? stats.recoveryFactor.toFixed(2) : '--', icon: RefreshCcw, tooltip: 'recovery', desc: 'NET PROFIT / MAX DD', hasSpark: true, sparkColor: 'var(--brand-accent)' },
          { label: 'Consecutive Loss', value: stats.maxConsecutiveLosses || '0', icon: TrendingDown, tooltip: 'consecutive_loss', desc: 'MAX SEQUENCE RISK', color: 'text-trade-short' },
          { label: 'Dataset Nodes', value: stats.totalTrades, icon: Database, tooltip: 'total_trades', desc: 'TOTAL TRADE EVENTS', color: 'text-brand-text-dim' }
        ].map((tile, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -1 }}
            className="technical-panel py-2 px-3 flex flex-col gap-0.5 relative overflow-hidden group shadow-sm transition-colors border-brand-border/30 hover:border-brand-border/60"
          >
            {tile.hasSpark && stats.equityCurve.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 h-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkline data={stats.equityCurve.map(e => e.equity).slice(-10)} color={tile.sparkColor} />
              </div>
            )}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 min-w-0 font-mono">
                <tile.icon size={10} className={`${tile.color || 'text-brand-text-dim'} opacity-50`} />
                <span className="text-[7px] label-caps !mb-0 font-bold truncate opacity-60">{tile.label}</span>
              </div>
              <InfoTooltip content={t.analytics[tile.tooltip] || tile.desc} />
            </div>
            <div className="flex flex-col relative z-20">
              <span className={`text-lg font-bold font-mono tracking-tighter leading-tight ${tile.color || 'text-brand-text-bright'}`}>
                {tile.value}
              </span>
              <span className="text-[6px] font-mono text-brand-text-dim/20 uppercase tracking-tighter italic">{tile.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Metrics Section */}
      <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        <div className="technical-panel p-4 flex flex-col gap-3 bg-brand-elevated/20 overflow-hidden border-brand-border/40">
          <h3 className="label-caps border-b border-brand-border/20 pb-2 flex items-center shrink-0 opacity-80">
            <BarChart3 size={14} className="mr-2 opacity-40" />
            {t.ui.leading_symbols}
            <InfoTooltip content="Asset-specific performance attribution." />
          </h3>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] scrollbar-hide">
            {stats.symbolEfficiency.slice(0, 5).map((s) => (
              <div key={s.symbol} className="flex items-center justify-between p-2.5 bg-brand-text-bright/[0.01] rounded border border-brand-border/20 group hover:border-brand-border/40 transition-all min-w-[200px] sm:min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-1 h-6 rounded-full shrink-0 ${s.profit > 0 ? 'bg-trade-long' : s.profit < 0 ? 'bg-trade-short' : 'bg-status-neutral'}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="monospace-data font-bold text-xs truncate">{s.symbol}</span>
                      <span className="text-[8px] uppercase font-bold opacity-20 tracking-tight truncate">{s.count} NODES</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-right shrink-0 ml-4">
                  <div className="hidden xs:block">
                    <p className="text-[7px] uppercase font-bold whitespace-nowrap opacity-40">Win Rate</p>
                    <p className="text-[10px] font-mono font-bold text-brand-text-bright opacity-80">{s.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[7px] uppercase font-bold whitespace-nowrap opacity-40">Profit</p>
                    <p className={`text-[10px] font-mono font-bold ${s.profit > 0 ? 'text-trade-long' : s.profit < 0 ? 'text-trade-short' : 'text-brand-text-dim'}`}>
                      {s.profit > 0 ? '+' : ''}{s.profit.toFixed(1)}R
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="technical-panel p-4 flex flex-col gap-3 bg-brand-elevated/20 overflow-hidden border-brand-border/40">
          <h3 className="label-caps border-b border-brand-border/20 pb-2 flex items-center shrink-0 opacity-80">
            <Target size={14} className="mr-2 opacity-40" />
            {t.ui.directional_bias}
            <InfoTooltip content="Performance split between Bullish (Long) and Bearish (Short) setups." />
          </h3>
          <div className="flex flex-col gap-2 h-full justify-center">
            <div className="flex items-center justify-between p-3 bg-brand-text-bright/[0.01] border border-brand-border/20 rounded-xl group hover:border-trade-long/20 transition-colors">
              <div className="flex flex-col min-w-0 mr-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingUp className="text-trade-long/40 group-hover:text-trade-long shrink-0 transition-colors" size={13} />
                  <span className="label-caps !mb-0 text-brand-text-dim group-hover:text-trade-long text-[9px] truncate transition-colors">Bullish Exp.</span>
                </div>
                <span className="text-[8px] font-mono opacity-20 uppercase truncate">{stats.biasAnalysis.long.count} Nodes</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold font-mono text-brand-text-bright opacity-80 group-hover:text-trade-long transition-colors">{stats.biasAnalysis.long.winRate.toFixed(1)}%</span>
                <div className="text-[8px] uppercase font-bold opacity-30 whitespace-nowrap">Win Prob</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-text-bright/[0.01] border border-brand-border/20 rounded-xl group hover:border-trade-short/20 transition-colors">
              <div className="flex flex-col min-w-0 mr-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingDown className="text-trade-short/40 group-hover:text-trade-short shrink-0 transition-colors" size={13} />
                  <span className="label-caps !mb-0 text-brand-text-dim group-hover:text-trade-short text-[9px] truncate transition-colors">Bearish Cont.</span>
                </div>
                <span className="text-[8px] font-mono opacity-20 uppercase truncate">{stats.biasAnalysis.short.count} Nodes</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold font-mono text-brand-text-bright opacity-80 group-hover:text-trade-short transition-colors">{stats.biasAnalysis.short.winRate.toFixed(1)}%</span>
                <div className="text-[8px] uppercase font-bold opacity-30 whitespace-nowrap">Win Prob</div>
              </div>
            </div>
          </div>
        </div>

        <div className="technical-panel p-4 flex flex-col gap-3 bg-brand-elevated/10 backdrop-blur-sm border border-brand-border/40 hover:border-brand-border transition-colors shadow-lg relative overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
          <h3 className="label-caps border-b border-brand-border/20 pb-2 flex items-center shrink-0 text-brand-text-dim relative z-10">
            <Clock size={14} className="mr-2 opacity-40" />
            {t.ui.day_profile}
            <InfoTooltip content="Daily probability distribution of returns." />
          </h3>
          <div className="relative w-full h-[150px] overflow-hidden pt-2 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.performanceByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" vertical={false} opacity={0.05} />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--brand-text-dim)" 
                  fontSize={9} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--brand-text-dim)', fontFamily: 'monospace', opacity: 0.3 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'var(--brand-text-dim)', fillOpacity: 0.05}} 
                  contentStyle={{ backgroundColor: 'var(--brand-elevated)', border: '1px solid var(--brand-border)', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace', backdropFilter: 'blur(10px)'}} 
                  itemStyle={{ color: 'var(--brand-accent)', fontFamily: 'monospace' }}
                />
                <Bar 
                  dataKey="profit" 
                  radius={[2, 2, 0, 0]} 
                  barSize={16}
                >
                  {stats.performanceByDay.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.profit > 0 ? 'var(--trade-long)' : entry.profit < 0 ? 'var(--trade-short)' : 'var(--brand-text-dim)'} 
                      fillOpacity={Math.abs(entry.profit) > 0 ? 0.3 + (Math.abs(entry.profit) / 10) : 0.1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto pt-4 border-t border-brand-border/10 text-[9px] font-mono italic lowercase tracking-widest text-center opacity-20 relative z-10">
            Intraday Volatility Cycles
          </div>
        </div>
      </div>

      {showStrategyAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
        >
          <div className="technical-panel p-6 flex flex-col gap-6 bg-brand-elevated/20 overflow-hidden border-brand-border/40 lg:col-span-2">
            <h3 className="label-caps border-b border-brand-border/20 pb-3 flex items-center shrink-0 opacity-80">
              <Zap size={14} className="mr-2 opacity-40 text-brand-accent" />
              Strategy Alpha Distribution
              <InfoTooltip content="Profit/Loss attribution per execution strategy Algorithm." />
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.strategyAnalysis} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.05} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={10} 
                      width={100}
                      tick={{ fill: 'var(--brand-text-dim)', fontStyle: 'italic', fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--brand-text-bright)', opacity: 0.05 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-brand-bg/95 backdrop-blur-md border border-brand-border p-2 rounded shadow-2xl">
                              <p className="text-[10px] font-bold text-brand-text-bright mb-1 uppercase tracking-widest">{payload[0].payload.name}</p>
                              <p className="text-[12px] font-mono font-bold text-brand-accent">{payload[0].value?.toFixed(2)}R Net</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                      {stats.strategyAnalysis?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || 'var(--brand-accent)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] scrollbar-hide pr-1">
                {stats.strategyAnalysis?.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-3 bg-brand-text-bright/[0.01] rounded border border-brand-border/20 group hover:border-brand-border/40 transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: s.color || 'var(--brand-border)' }} />
                      <div className="flex flex-col min-w-0">
                        <span className="monospace-data font-bold text-xs truncate">{s.name}</span>
                        <span className="text-[8px] uppercase font-bold opacity-20 tracking-tight truncate">{s.count} NODES</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0 ml-4">
                      <div>
                        <p className="text-[7px] uppercase font-bold whitespace-nowrap opacity-40">Win Rate</p>
                        <p className="text-[10px] font-mono font-bold text-brand-text-bright opacity-80">{s.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[7px] uppercase font-bold whitespace-nowrap opacity-40">Profit</p>
                        <p className={`text-[10px] font-mono font-bold ${s.profit > 0 ? 'text-trade-long' : s.profit < 0 ? 'text-trade-short' : 'text-brand-text-dim'}`}>
                          {s.profit > 0 ? '+' : ''}{s.profit.toFixed(1)}R
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <StrategyManager 
            strategies={strategies}
            onAdd={onAddStrategy}
            onUpdate={onUpdateStrategy}
            onDelete={onDeleteStrategy}
          />
        </motion.div>
      )}
    </div>
  );
};
