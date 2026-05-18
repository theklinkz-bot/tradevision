import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp, ArrowDownRight } from 'lucide-react';
import { InfoTooltip } from './StatsPanel';
import { TradeStats } from '../types';

interface EquityChartProps {
  stats: TradeStats;
  t: any;
}

export const EquityChart = ({ stats, t }: EquityChartProps) => {
  const [visibleSeries, setVisibleSeries] = React.useState({
    equity: true,
    movingAverage: true,
    drawdown: true,
  });

  const { chartData, maxDrawdownInfo, maxRecoveryTrades } = React.useMemo(() => {
    let maxEquity = 0;
    let maxDD = 0;
    let maxDDIndex = -1;
    let peakIndex = -1;
    
    // For recovery time calculation
    let currentRecoveryStart = -1;
    let maxRecovery = 0;

    const data = stats.equityCurve.map((d, i, arr) => {
      // High Water Mark
      if (d.equity > maxEquity) {
        maxEquity = d.equity;
        peakIndex = i;
        currentRecoveryStart = -1; // We hit a new peak
      } else {
        // We are below peak
        const currentDD = maxEquity - d.equity;
        if (currentDD > maxDD) {
          maxDD = currentDD;
          maxDDIndex = i;
        }

        const recoveryTime = i - peakIndex;
        if (recoveryTime > maxRecovery) {
          maxRecovery = recoveryTime;
        }
      }
      
      // Calculate 5-trade Moving Average
      const windowSize = 5;
      const start = Math.max(0, i - windowSize + 1);
      const sub = arr.slice(start, i + 1);
      const ma = sub.reduce((acc, curr) => acc + curr.equity, 0) / sub.length;

      const currentDDValue = maxEquity > 0 ? maxEquity - d.equity : 0;
      const currentDDPercent = maxEquity > 0 ? (currentDDValue / maxEquity) * 100 : 0;

      return {
        ...d,
        hwm: maxEquity,
        movingAverage: Number(ma.toFixed(2)),
        drawdownValue: currentDDValue,
        drawdownPercent: currentDDPercent
      };
    });

    const maxDDPeak = maxDDIndex !== -1 ? data[maxDDIndex].hwm : 0;
    const maxDDPercent = maxDDPeak > 0 ? (maxDD / maxDDPeak) * 100 : 0;

    return { 
      chartData: data, 
      maxDrawdownInfo: { value: maxDD, percent: maxDDPercent, index: maxDDIndex },
      maxRecoveryTrades: maxRecovery
    };
  }, [stats.equityCurve]);

  const currentEquity = chartData.at(-1)?.equity ?? 0;
  const currentDrawdown = chartData.at(-1)?.drawdownValue ?? 0;
  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((current) => ({ ...current, [series]: !current[series] }));
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="analytics-equity-chart-shell relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-black/20 p-3.5 shadow-[0_22px_64px_-44px_rgba(0,0,0,0.9)] transition-colors hover:border-brand-accent/20">
        <div className="analytics-grid-overlay opacity-25" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-2.5">
            <h3 className="flex items-center font-mono text-[10px] font-black uppercase tracking-[0.22em] text-brand-text-bright">
              <TrendingUp size={13} className="mr-2 text-brand-accent" />
              {t.ui.performance_architecture}
              <InfoTooltip content="Capital curve with moving average smoothing and an integrated drawdown pressure layer." />
            </h3>
            <div className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-brand-text-dim">
              <button
                type="button"
                onClick={() => toggleSeries('equity')}
                aria-pressed={visibleSeries.equity}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 ${visibleSeries.equity ? 'border-brand-accent/25 bg-brand-accent/[0.08] text-brand-text-bright shadow-[0_0_16px_rgba(52,211,153,0.12)]' : 'border-white/[0.06] bg-white/[0.02] opacity-45 hover:opacity-75'}`}
              >
                <i className="h-0.5 w-4 bg-brand-accent shadow-[0_0_10px_rgba(52,211,153,0.55)]" /> Equity
              </button>
              <button
                type="button"
                onClick={() => toggleSeries('movingAverage')}
                aria-pressed={visibleSeries.movingAverage}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-warning/30 ${visibleSeries.movingAverage ? 'border-brand-warning/25 bg-brand-warning/[0.07] text-brand-text-bright' : 'border-white/[0.06] bg-white/[0.02] opacity-45 hover:opacity-75'}`}
              >
                <i className="h-0.5 w-4 bg-brand-warning/60" /> MA(5)
              </button>
              <button
                type="button"
                onClick={() => toggleSeries('drawdown')}
                aria-pressed={visibleSeries.drawdown}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-trade-short/30 ${visibleSeries.drawdown ? 'border-trade-short/25 bg-trade-short/[0.07] text-brand-text-bright' : 'border-white/[0.06] bg-white/[0.02] opacity-45 hover:opacity-75'}`}
              >
                <i className="h-0.5 w-4 bg-trade-short/50" /> Drawdown
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.34}/>
                  <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--trade-short)" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="var(--trade-short)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 8" stroke="var(--brand-border)" vertical opacity={0.18} />
              
              <XAxis 
                dataKey="trade" 
                stroke="var(--brand-text-dim)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `T${val}`}
                tick={{ fill: 'var(--brand-text-dim)', fontFamily: 'monospace', opacity: 0.3 }}
                dy={10}
              />
              
              <YAxis 
                yAxisId="equity"
                stroke="var(--brand-text-dim)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}R`}
                tick={{ fill: 'var(--brand-text-dim)', fontFamily: 'monospace', opacity: 0.3 }}
                dx={-10}
              />
              <YAxis yAxisId="drawdown" orientation="right" hide domain={[0, 'dataMax + 1']} />

              <Tooltip 
                cursor={{ stroke: 'var(--brand-text-dim)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }}
                content={(props) => {
                  const { active, payload } = props;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const dd = data.hwm - data.equity;
                    return (
                      <div className="bg-brand-elevated/95 backdrop-blur-xl border border-brand-accent/20 p-3 rounded-xl shadow-2xl flex flex-col gap-2 z-50 min-w-[170px]">
                        <div className="flex justify-between items-center border-b border-brand-border/20 pb-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-brand-accent tracking-tighter">{data.symbol || 'SYSTEM'}</span>
                          <span className="text-[8px] font-mono opacity-40">{data.date ? new Date(data.date).toLocaleDateString() : 'T'+data.trade}</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="opacity-40 uppercase">Equity</span>
                            <span className="font-bold text-brand-text-bright">{data.equity.toFixed(2)}R</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="opacity-40 uppercase">Delta</span>
                            <span className={`font-bold ${data.rMultiple > 0 ? 'text-trade-long' : data.rMultiple < 0 ? 'text-trade-short' : 'text-brand-text-dim'}`}>
                              {data.rMultiple > 0 ? '+' : ''}{data.rMultiple?.toFixed(2)}R
                            </span>
                          </div>
                          {dd > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-trade-short uppercase font-bold">Drawdown</span>
                              <span className="font-bold text-trade-short">-{dd.toFixed(2)}R</span>
                            </div>
                          )}
                          <div className="pt-1.5 mt-1.5 border-t border-brand-border/10 flex justify-between items-center text-[8px] font-mono opacity-30">
                            <span>ROLL_MA(5)</span>
                            <span>{data.movingAverage.toFixed(2)}R</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {visibleSeries.drawdown && (
                <Area
                  yAxisId="drawdown"
                  type="monotone"
                  dataKey="drawdownValue"
                  stroke="var(--trade-short)"
                  strokeOpacity={0.34}
                  strokeWidth={1}
                  fill="url(#drawdownFill)"
                  isAnimationActive={false}
                />
              )}

              {visibleSeries.equity && (
                <Area 
                  yAxisId="equity"
                  type="monotone" 
                  dataKey="equity" 
                  stroke="var(--brand-accent)" 
                  strokeWidth={2.4} 
                  fill="url(#equityGradient)"
                  fillOpacity={1}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    if (payload.trade === 0) return null;
                    const isMaxDD = index === maxDrawdownInfo.index;
                    return (
                      <g key={`dot-${index}`}>
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isMaxDD ? 5 : (payload.rMultiple > 0 ? 3 : 2)} 
                          fill={isMaxDD ? 'var(--trade-short)' : (payload.rMultiple > 0 ? 'var(--trade-long)' : payload.rMultiple < 0 ? 'var(--trade-short)' : 'var(--status-neutral)')}
                          className={isMaxDD ? "animate-pulse" : "opacity-80"}
                        />
                        {isMaxDD && (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={10} 
                            fill="var(--trade-short)"
                            className="opacity-20 animate-ping"
                          />
                        )}
                      </g>
                    );
                  }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: 'var(--brand-text-bright)', stroke: 'var(--brand-accent)' }}
                />
              )}

              {/* Peak to Trough Indicator at Max DD */}
              {visibleSeries.drawdown && maxDrawdownInfo.index !== -1 && (
                <ReferenceLine 
                  yAxisId="equity"
                  x={chartData[maxDrawdownInfo.index].trade} 
                  stroke="var(--trade-short)" 
                  strokeDasharray="3 3" 
                  opacity={0.38}
                  label={{ 
                    position: 'top', 
                    value: t.ui.max_drawdown_label.toUpperCase(), 
                    fill: 'var(--trade-short)', 
                    fontSize: 8, 
                    fontFamily: 'monospace',
                    className: 'font-bold'
                  }} 
                />
              )}

              {/* Moving Average Line */}
              {visibleSeries.movingAverage && (
                <Area
                  yAxisId="equity"
                  type="monotone"
                  dataKey="movingAverage"
                  stroke="var(--brand-warning)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  fill="none"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-2xl border border-brand-accent/15 bg-brand-accent/[0.055] p-3.5">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">current equity</p>
          <p className={`mt-1.5 font-mono text-xl font-black ${currentEquity >= 0 ? 'text-brand-accent' : 'text-trade-short'}`}>
            {currentEquity >= 0 ? '+' : ''}{currentEquity.toFixed(2)}R
          </p>
        </div>
        <div className="rounded-2xl border border-trade-short/15 bg-trade-short/[0.055] p-3.5">
          <div className="flex items-center gap-2">
            <ArrowDownRight size={13} className="text-trade-short" />
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">{t.ui.max_drawdown_label}</p>
          </div>
          <p className="mt-1.5 font-mono text-xl font-black text-trade-short">-{maxDrawdownInfo.value.toFixed(2)}R</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-brand-text-dim">{t.ui.resistance}</p>
          <p className="mt-1.5 font-mono text-xl font-black text-brand-text-bright">{maxRecoveryTrades}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-text-dim">{t.ui.trades_to_recover}</p>
        </div>
      </aside>
    </div>
  );
};
