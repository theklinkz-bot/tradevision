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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4 mt-4">
      {/* Enhanced Equity Curve Chart */}
      <div className="technical-panel p-4 flex flex-col gap-4 bg-brand-elevated/20 backdrop-blur-md border border-brand-border/40 hover:border-brand-border/60 transition-colors shadow-lg relative overflow-hidden group/chart">
        <div className="absolute inset-0 dot-matrix opacity-20 pointer-events-none" />
        
        <div className="flex flex-col border-b border-brand-border/30 pb-3 relative z-10 gap-2">
          <div className="flex items-center justify-between">
            <h3 className="label-caps flex items-center text-brand-text-bright mb-0 text-[10px]">
              <TrendingUp size={12} className="text-brand-accent mr-2" />
              {t.ui.performance_architecture}
              <InfoTooltip content="Comprehensive yield curve with drawdown zones and moving average smoothing." />
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-0.5 bg-brand-accent" />
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">Equity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-0.5 bg-brand-warning opacity-50" />
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">MA(5)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[9px] font-mono">
            <span className="text-trade-short font-bold">{t.ui.max_drawdown_label}: {maxDrawdownInfo.value.toFixed(2)}R</span>
            <span className="opacity-20 border-r border-brand-border h-2" />
            <span className="text-brand-accent font-bold">{t.ui.resistance}: {maxRecoveryTrades} NODES</span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--trade-short)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--trade-short)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" vertical={false} opacity={0.05} />
              
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
                stroke="var(--brand-text-dim)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}R`}
                tick={{ fill: 'var(--brand-text-dim)', fontFamily: 'monospace', opacity: 0.3 }}
                dx={-10}
              />

              <Tooltip 
                cursor={{ stroke: 'var(--brand-text-dim)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.2 }}
                content={(props) => {
                  const { active, payload } = props;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const dd = data.hwm - data.equity;
                    return (
                      <div className="bg-brand-elevated/95 backdrop-blur-xl border border-brand-border/40 p-3 rounded shadow-2xl flex flex-col gap-2 z-50 min-w-[170px]">
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

              {/* High Water Mark Shaded Area */}
              <Area
                type="monotone"
                dataKey="hwm"
                stroke="none"
                fill="url(#drawdownFill)"
                connectNulls
                baseLine={0}
                isAnimationActive={false}
              />

              {/* Main Equity Area */}
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="var(--brand-accent)" 
                strokeWidth={2} 
                fill="var(--brand-bg)" // Use background color to 'mask' the hwm area, leaving only the gap
                fillOpacity={0.9}
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

              {/* Peak to Trough Indicator at Max DD */}
              {maxDrawdownInfo.index !== -1 && (
                <ReferenceLine 
                  x={chartData[maxDrawdownInfo.index].trade} 
                  stroke="var(--trade-short)" 
                  strokeDasharray="3 3" 
                  opacity={0.3}
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
              <Area
                type="monotone"
                dataKey="movingAverage"
                stroke="var(--brand-warning)"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Numerical Drawdown Chart (Focusing on Delta decay) */}
      <div className="technical-panel p-4 flex flex-col gap-4 bg-brand-elevated/20 backdrop-blur-md border border-brand-border/30 hover:border-brand-border/60 transition-colors shadow-lg relative overflow-hidden group/drawdown">
        <div className="absolute inset-0 dot-matrix opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-trade-short/[0.03] to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-brand-border/20 pb-3 relative z-10">
          <h3 className="label-caps flex items-center text-trade-short/70 mb-0 text-[10px]">
            <ArrowDownRight size={12} className="mr-2" />
            {t.ui.strict_delta_excursion}
            <InfoTooltip content="Magnified view of capital decay. Each point represents the distance from the current High Water Mark." />
          </h3>
          <div className="text-[8px] font-mono text-trade-short font-bold animate-pulse tracking-widest">{t.ui.risk_boundary}</div>
        </div>

        <div className="h-[280px] w-full pt-2 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--trade-short)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--trade-short)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" vertical={false} opacity={0.05} />
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
                stroke="var(--brand-text-dim)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'var(--brand-text-dim)', fontFamily: 'monospace', opacity: 0.2 }}
                tickFormatter={(val) => `-${val}R`}
                dx={-10}
              />
              <Tooltip 
                content={(props) => {
                  const { active, payload } = props;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-brand-elevated/95 backdrop-blur-xl border border-trade-short/30 p-2 rounded shadow-xl flex flex-col gap-1 z-50">
                        <span className="text-[8px] font-mono opacity-40 uppercase">Drawdown at T{data.trade}</span>
                        <span className="text-sm font-bold font-mono text-trade-short">-{data.drawdownValue.toFixed(2)}R</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="drawdownValue" 
                stroke="var(--trade-short)" 
                strokeWidth={1.5}
                fill="url(#drawdownGradient)"
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  if (index === maxDrawdownInfo.index) {
                    return (
                      <circle cx={cx} cy={cy} r={4} fill="var(--trade-short)" className="animate-ping" />
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between items-end relative z-10 px-2 mt-[-10px]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] label-caps opacity-30">{t.ui.peak_decay}</span>
            <span className="text-lg font-bold font-mono text-trade-short">
              -{maxDrawdownInfo.value.toFixed(2)}R 
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[7px] label-caps opacity-30">{t.ui.resistance}</span>
            <span className="text-xs font-bold font-mono text-brand-text-bright opacity-60">{maxRecoveryTrades} Trades</span>
          </div>
        </div>
      </div>
    </div>
  );
};
