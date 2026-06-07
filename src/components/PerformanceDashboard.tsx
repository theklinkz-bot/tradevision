import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  ShieldAlert, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { TradeStats, TranslationSchema } from '../types';
import { EquityChart } from './EquityChart';
import { InsightPanel } from './InsightPanel';

interface PerformanceDashboardProps {
  stats: TradeStats;
  t: TranslationSchema;
  isSidebarCollapsed?: boolean;
}

const MetricTooltip = ({ content, thaiContent }: { content: string, thaiContent: string }) => (
  <RadixTooltip.Provider delayDuration={200}>
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <button className="p-1 hover:text-brand-accent transition-colors opacity-40 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent/40 rounded">
          <Info size={12} />
        </button>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content 
          side="top" 
          align="center" 
          sideOffset={5}
          className="z-[100] bg-brand-elevated/95 backdrop-blur-md border border-brand-border p-3 rounded-lg shadow-2xl max-w-[280px] animate-in fade-in zoom-in duration-200"
        >
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-brand-text-bright leading-relaxed italic">
              "{content}"
            </p>
            <div className="h-[1px] bg-brand-border opacity-30" />
            <p className="text-[11px] text-brand-text-dim font-medium leading-relaxed">
              {thaiContent}
            </p>
          </div>
          <RadixTooltip.Arrow className="fill-brand-border" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ stats, t, isSidebarCollapsed }) => {
  const p = t.performance;

  const sessionData = React.useMemo(
    () => stats.performanceBySession ?? [],
    [stats.performanceBySession]
  );

  const bestSession = sessionData.length > 0 ? [...sessionData].sort((a, b) => b.profit - a.profit)[0] : null;
  const worstSession = sessionData.length > 0 ? [...sessionData].sort((a, b) => a.profit - b.profit)[0] : null;

  const bestSetup = stats.strategyAnalysis && stats.strategyAnalysis.length > 0 
    ? [...stats.strategyAnalysis].sort((a, b) => b.profit - a.profit)[0]
    : null;

  const worstSetup = stats.strategyAnalysis && stats.strategyAnalysis.length > 0
    ? [...stats.strategyAnalysis].sort((a, b) => a.profit - b.profit)[0]
    : null;

  // Color logic helpers
  const getWinRateState = (wr: number) => {
    if (wr >= 60) {
      return {
        text: 'text-brand-success',
        border: 'border-brand-success/30',
        bg: 'bg-brand-success/10',
        bar: 'bg-brand-success',
        glow: 'shadow-brand-success/10',
        dot: 'bg-brand-success'
      };
    }
    if (wr >= 45) {
      return {
        text: 'text-brand-warning',
        border: 'border-brand-warning/30',
        bg: 'bg-brand-warning/10',
        bar: 'bg-brand-warning',
        glow: 'shadow-brand-warning/10',
        dot: 'bg-brand-warning'
      };
    }
    return {
      text: 'text-brand-danger',
      border: 'border-brand-danger/30',
      bg: 'bg-brand-danger/10',
      bar: 'bg-brand-danger',
      glow: 'shadow-brand-danger/10',
      dot: 'bg-brand-danger'
    };
  };

  const currentEquity = stats.equityCurve[stats.equityCurve.length - 1]?.equity || 0;
  const peakEquity = Math.max(...stats.equityCurve.map(d => d.equity));
  const closedTradeNodes = stats.equityCurve.filter(point => typeof point.rMultiple === 'number');
  const wins = closedTradeNodes.filter(point => (point.rMultiple || 0) > 0).length;
  const losses = closedTradeNodes.filter(point => (point.rMultiple || 0) < 0).length;
  const breakEvens = Math.max(0, stats.totalTrades - wins - losses);
  const hasClosedTrades = stats.totalTrades > 0;
  const winRateState = getWinRateState(stats.winRate);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Primary Winrate Hero */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'md:grid-cols-3 xl:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
        <div className={`sm:col-span-2 md:col-span-2 min-h-[220px] bg-brand-elevated rounded-xl border ${winRateState.border} p-6 shadow-2xl ${winRateState.glow} relative overflow-hidden ring-1 ring-white/[0.03]`}>
          <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
          <div className={`absolute inset-x-0 top-0 h-1 ${winRateState.bar}`} />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${winRateState.dot} shadow-[0_0_12px_currentColor]`} />
                  <span className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.24em]">{p.win_rate}</span>
                  <MetricTooltip 
                    content="Win Rate: The percentage of total closed trades that resulted in a profit."
                    thaiContent="อัตราการชนะ: เปอร์เซ็นต์ของไม้ที่ปิดแล้วและจบด้วยกำไร"
                  />
                </div>
                <h3 className="text-sm font-bold text-brand-text-bright uppercase tracking-widest">Winning Trade Ratio</h3>
              </div>
              <div className={`px-3 py-1 rounded-full border ${winRateState.border} ${winRateState.bg} text-[9px] font-black uppercase tracking-widest ${winRateState.text}`}>
                {hasClosedTrades ? `${wins}/${stats.totalTrades}` : 'No Data'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_170px] gap-6 items-end">
              <div className="min-w-0">
                {hasClosedTrades ? (
                  <div className={`text-7xl lg:text-8xl font-black tracking-tighter leading-none ${winRateState.text}`}>
                    {stats.winRate.toFixed(1)}
                    <span className="text-3xl lg:text-4xl opacity-50 ml-1">%</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-xl font-display font-bold tracking-tight text-brand-text-bright leading-tight">
                      No closed trades yet
                    </div>
                    <p className="text-[10px] text-brand-text-dim font-mono uppercase tracking-widest">
                      Upload a screenshot to log your first trade
                    </p>
                  </div>
                )}
                <div
                  role="progressbar"
                  aria-valuenow={hasClosedTrades ? stats.winRate : 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Win rate"
                  className="mt-4 h-2 w-full rounded-full bg-brand-bg border border-brand-border overflow-hidden"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hasClosedTrades ? Math.min(100, Math.max(0, stats.winRate)) : 0}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full ${winRateState.bar}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                <div className="rounded-lg border border-brand-border bg-brand-bg/40 p-3">
                  <span className="text-[8px] font-black text-brand-text-dim uppercase tracking-widest">Wins / Closed</span>
                  <div className="mt-1 text-xl font-black font-mono text-brand-text-bright">
                    {wins}<span className="text-brand-text-dim/50 mx-1">/</span>{stats.totalTrades}
                  </div>
                </div>
                <div className="rounded-lg border border-brand-border bg-brand-bg/40 p-3">
                  <span className="text-[8px] font-black text-brand-text-dim uppercase tracking-widest">Losses + Break-even</span>
                  <div className="mt-1 text-xl font-black font-mono text-brand-text-bright">
                    <span className="text-brand-danger">{losses}</span>
                    <span className="text-brand-text-dim/50 mx-1">+</span>
                    <span className="text-brand-text-dim">{breakEvens}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scannable Insights Bar (AI Section from Analytics) */}
      <div className="flex flex-col gap-2">
        <h4 className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em] ml-1">{t.ui.ai_neural_insights}</h4>
        <InsightPanel stats={stats} t={t} />
      </div>

      {/* 3. Supporting Metrics Bar */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'md:grid-cols-3 xl:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-5'}`}>
        {/* Net Profit */}
        <div className="bg-brand-elevated/25 p-5 rounded-xl border border-brand-border/70 flex flex-col justify-between shadow-sm group opacity-90">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest block">{p.net_profit}</span>
              <MetricTooltip 
                content="Net Profit: The total profit or loss generated by all closed trades, adjusted for risk units (R)."
                thaiContent="กำไรสุทธิ: ผลรวมกำไรหรือขาดทุนจากทุกไม้ที่ปิดแล้ว โดยคิดเป็นหน่วยความเสี่ยง (R)"
              />
            </div>
            <div className={`text-4xl font-black tracking-tighter leading-none ${currentEquity >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
              {currentEquity >= 0 ? '+' : ''}{currentEquity.toFixed(2)}R
            </div>
          </div>
          <p className="text-[10px] text-brand-text-dim font-medium uppercase mt-4">{p.net_profit_desc}</p>
        </div>

        {/* Expectancy */}
        <div className="md:col-span-2 bg-brand-elevated/35 p-5 rounded-xl border border-brand-border/80 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em] block">{p.system_edge}</span>
                  <MetricTooltip 
                    content="Expectancy: average profit per trade (you gain/lose this per trade on average)"
                    thaiContent="ค่าเฉลี่ยกำไรต่อไม้ (โดยรวมเล่น 1 ไม้ ได้/เสียเท่าไหร่)"
                  />
                </div>
                <span className="text-base font-bold text-brand-text-bright">{p.expectancy}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-dim">
                <Target size={18} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <div className="text-6xl font-display font-bold tracking-tight text-brand-text-bright leading-none">
                {stats.expectancy.toFixed(2)}
                <span className="text-2xl opacity-50 ml-1 italic">R</span>
              </div>
            </div>
            
            <div className="text-[10px] text-brand-text-dim font-medium leading-relaxed max-w-[240px]">
              EACH VERIFIED SIGNAL GENERATES AN ESTIMATED RETURN OF <span className="text-brand-text-bright font-bold">{stats.expectancy.toFixed(2)} UNIT(S)</span> PER RISK NODE.
            </div>
          </div>
        </div>

        {/* Max Drawdown */}
        <div className={`bg-brand-elevated/25 p-5 rounded-xl border flex flex-col justify-between shadow-sm transition-colors duration-300 opacity-90 ${stats.maxDrawdown > 5 ? 'border-brand-danger/40 bg-brand-danger/5' : 'border-brand-border/70'}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest block">{p.max_drawdown}</span>
              <MetricTooltip 
                content="Max Drawdown: The largest peak-to-trough decline in equity, representing your maximum exposure/risk."
                thaiContent="Drawdown สูงสุด: ระยะขาดทุนที่ลึกที่สุดจากจุดสูงสุด สื่อถึงความเสี่ยงสูงสุดที่คุณเคยเผชิญ"
              />
            </div>
            <div className={`text-4xl font-black tracking-tighter leading-none ${stats.maxDrawdown > 5 ? 'text-brand-danger' : 'text-brand-text-bright'}`}>
              -{stats.maxDrawdown.toFixed(2)}R
            </div>
          </div>
          <p className="text-[10px] text-brand-text-dim font-medium uppercase mt-4">{p.max_dd_desc}</p>
        </div>

        {/* Closed Trades */}
        <div className="bg-brand-elevated/25 p-5 rounded-xl border border-brand-border/70 flex flex-col justify-between shadow-sm opacity-90">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest block">Closed Trades</span>
              <MetricTooltip 
                content="Closed Trades: Completed Win, Loss, and Break-even trades included in the analytics engine."
                thaiContent="ไม้ที่ปิดแล้ว: รวม Win, Loss และ Break-even ที่ถูกนำไปคำนวณใน Analytics"
              />
            </div>
            <div className="text-2xl font-bold tracking-tighter text-brand-text-bright">
              {stats.totalTrades}
            </div>
          </div>
          <p className="text-[10px] text-brand-text-dim font-medium uppercase mt-4">Wins {wins} / Losses {losses} / BE {breakEvens}</p>
        </div>
      </div>

      {/* 4. Charts Section (Reused from Analytics) */}
      <div className="bg-brand-elevated/30 rounded-2xl border border-brand-border/50 p-1 px-4 pb-4">
        <div className="flex items-baseline justify-between pt-4 mb-2">
          <h4 className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em] ml-1">Analytics Architecture</h4>
          <div className="text-[9px] font-mono opacity-20 uppercase">Core Systems Synchronized</div>
        </div>
        <EquityChart stats={stats} t={t} />
      </div>

      {/* 4. Strategic Analysis & Edge Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-brand-elevated/50 rounded-xl border border-brand-border p-8 shadow-md">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-text-dim">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text-bright uppercase tracking-widest">{p.edge_analysis}</h3>
                <p className="text-[10px] text-brand-text-dim font-bold uppercase tracking-[0.2em]">Metadata Analytics Matrix</p>
              </div>
            </div>
            
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest mb-1">{p.suggested_action}</span>
              <div className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${stats.maxConsecutiveLosses >= 3 ? 'text-brand-danger border-brand-danger/30 bg-brand-danger/5' : 'text-brand-success border-brand-success/30 bg-brand-success/5'}`}>
                {stats.maxConsecutiveLosses >= 3 ? 'Protocol: Suspend' : 'Protocol: Maintain'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Setup Perf */}
            <div className={`flex flex-col gap-4 ${isSidebarCollapsed ? 'xl:col-span-1' : ''}`}>
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em]">{p.setup_performance}</h4>
                <MetricTooltip 
                  content="Setup Performance: Efficiency of individual trading strategies based on average R-multiple."
                  thaiContent="ประสิทธิภาพตามรูปแบบการเทรด: สรุปความได้เปรียบของแต่ละกลยุทธ์ตามค่าเฉลี่ย R-multiple"
                />
              </div>
              <div className="space-y-3">
                {stats.strategyAnalysis?.slice(0, 3).map((strat, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-brand-bg/40 rounded-lg border border-brand-border">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-brand-text-bright uppercase">{strat.name}</span>
                      <span className={`text-[9px] font-black uppercase transition-opacity ${strat.avgR > 0.5 ? 'text-brand-success' : strat.avgR < 0 ? 'text-brand-danger' : 'opacity-0'}`}>
                        {strat.avgR > 0.5 ? p.trade_more : p.avoid}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold monospace-data text-brand-text-bright">{strat.avgR.toFixed(2)}R</div>
                      <div className="text-[9px] font-bold text-brand-text-dim uppercase tracking-tighter">{strat.count} Trades</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Perf */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em]">{p.session_performance}</h4>
                <MetricTooltip 
                  content="Session Performance: Win rate and yield distribution across different global trading sessions."
                  thaiContent="ประสิทธิภาพตามช่วงเวลา: ผลตอบแทนและอัตราการชนะแบ่งตามช่วงเวลาตลาดโลก"
                />
              </div>
              <div className="space-y-3">
                {sessionData.length === 0 ? (
                  <p className="text-[10px] text-brand-text-dim font-mono uppercase opacity-50 py-2">No session data yet</p>
                ) : sessionData.map((session, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-3.5 rounded-lg border ${session.session === bestSession?.session ? 'bg-brand-accent/5 border-brand-accent/30 ring-1 ring-brand-accent/10' : 'bg-brand-bg/40 border-brand-border'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-text-bright uppercase">{(p as any)[session.session.toLowerCase()] || session.session}</span>
                      <span className="text-[9px] font-bold text-brand-text-dim uppercase">{session.count} Executions</span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-brand-text-dim uppercase mb-0.5">Win%</span>
                        <span className="text-xs font-bold tabular-nums text-brand-text-bright">{session.winRate.toFixed(0)}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-brand-text-dim uppercase mb-0.5">Yield</span>
                        <span className={`text-xs font-black tabular-nums ${session.profit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>{session.profit.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavior Node */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-brand-text-dim uppercase tracking-[0.2em]">{p.risk_behavior}</h4>
                <MetricTooltip 
                  content="Risk Behavior: Analysis of trading discipline and negative streak endurance."
                  thaiContent="พฤติกรรมความเสี่ยง: การวิเคราะห์วินัยและการรับมือช่วงที่แพ้ติดต่อกัน"
                />
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{p.discipline_rate}</span>
                      <MetricTooltip 
                        content="Discipline Rate: Percentage of trades that strictly followed the predefined entry and exit protocols."
                        thaiContent="อัตราวินัย: เปอร์เซ็นต์ของไม้ที่เทรดตามกฎจุดเข้าและจุดออกที่วางไว้อย่างเคร่งครัด"
                      />
                    </div>
                    <span className="text-lg font-bold text-brand-text-bright italic">94%</span>
                  </div>
                  <div className="w-full h-1 bg-brand-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-brand-accent/80 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{p.consecutive_losses}</span>
                      <MetricTooltip 
                        content="Consecutive Losses: The current or maximum number of losing trades in a row."
                        thaiContent="จำนวนการแพ้ติดต่อกัน: จำนวนไม้ที่แพ้ต่อเนื่องกัน ณ ปัจจุบัน หรือสูงสุดที่เคยเกิดขึ้น"
                      />
                    </div>
                    <span className={`text-lg font-bold italic ${stats.maxConsecutiveLosses >= 3 ? 'text-brand-danger' : 'text-brand-text-bright'}`}>
                      {stats.maxConsecutiveLosses} Nodes
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2.5 h-2.5 rounded shadow-sm ${i < stats.maxConsecutiveLosses ? 'bg-brand-danger' : 'bg-brand-elevated border border-brand-border'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Lockdown Access */}
        <div
          role={stats.maxConsecutiveLosses >= 3 ? 'alert' : undefined}
          aria-live={stats.maxConsecutiveLosses >= 3 ? 'assertive' : undefined}
          className={`rounded-xl border p-8 flex flex-col justify-between transition-all shadow-lg backdrop-blur-md ${stats.maxConsecutiveLosses >= 3 ? 'bg-brand-danger/20 border-brand-danger/40 ring-2 ring-brand-danger/10' : 'bg-brand-elevated/50 border-brand-border opacity-60 hover:opacity-100'}`}
        >
          <div className="flex flex-col items-center text-center gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-xl transition-all duration-700 ${stats.maxConsecutiveLosses >= 3 ? 'bg-brand-danger text-white border-brand-danger/40 animate-pulse' : 'bg-brand-elevated text-brand-text-dim border-brand-border'}`}>
              <ShieldAlert size={32} />
            </div>
            
            <div className="space-y-1">
              <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${stats.maxConsecutiveLosses >= 3 ? 'text-brand-danger' : 'text-brand-text-dim'}`}>
                {stats.maxConsecutiveLosses >= 3 ? 'Active Suspension' : 'Protocol Ready'}
              </h4>
              <p className="text-[10px] text-brand-text-dim font-bold uppercase leading-relaxed max-w-[200px]">
                {stats.maxConsecutiveLosses >= 3 
                  ? "SYSTEM HAS DETECTED NEURAL FATIGUE. ALL MARKETS SUSPENDED."
                  : "BEHAVIORAL OVERRIDE IS ARMED BUT DISENGAGED."}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-brand-border">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black text-brand-text-dim uppercase tracking-widest">{p.lockdown_timer}</span>
              <div className="text-3xl font-display font-bold tracking-tight text-brand-text-bright">
                00:00:00
              </div>
            </div>
            
            <button className={`w-full py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-[0.98] ${stats.maxConsecutiveLosses >= 3 ? 'bg-brand-danger text-white hover:opacity-90 shadow-brand-danger/40' : 'bg-brand-bg text-brand-text-dim border border-brand-border hover:bg-brand-elevated hover:text-brand-text-bright'}`}>
              {p.initiate_lockdown}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
