import { RiskMetricCard, StabilityBar, VerdictTile, type ValidationTone, formatR, toneStyles } from './shared';

type PeriodBucket = {
  index: number;
  returns: number[];
  net: number;
  winrate: number;
};

interface ConsistencyEngineSectionProps {
  tradeReturnsLength: number;
  rollingWindow: number;
  consistencyTone: ValidationTone;
  consistencyStatus: string;
  consistencyScore: number;
  greenPeriods: number;
  redPeriods: number;
  smoothnessScore: number;
  driftLabel: string;
  driftTone: ValidationTone;
  rhythmScore: number;
  periodBuckets: PeriodBucket[];
  bestPeriod: PeriodBucket | null;
  worstPeriod: PeriodBucket | null;
  avgPeriodR: number;
  stabilitySpread: number;
  winrateSpread: number;
  rollingProfitFactor: number;
  driftDelta: number;
  volatilityPressure: number;
  maxDrawdown: number;
  earlyExpectancy: number;
  recentExpectancy: number;
  consistencyInsights: string[];
  insightIndex: number;
}

export const ConsistencyEngineSection = ({
  tradeReturnsLength,
  rollingWindow,
  consistencyTone,
  consistencyStatus,
  consistencyScore,
  greenPeriods,
  redPeriods,
  smoothnessScore,
  driftLabel,
  driftTone,
  rhythmScore,
  periodBuckets,
  bestPeriod,
  worstPeriod,
  avgPeriodR,
  stabilitySpread,
  winrateSpread,
  rollingProfitFactor,
  driftDelta,
  volatilityPressure,
  maxDrawdown,
  earlyExpectancy,
  recentExpectancy,
  consistencyInsights,
  insightIndex
}: ConsistencyEngineSectionProps) => (
  <details id="strategy-consistency" open className="group flex scroll-mt-28 flex-col gap-4">
    <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">CONSISTENCY ENGINE</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Stability // Drift Control</p>
      </div>
      <span className={`hidden rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest md:inline-flex ${toneStyles[consistencyTone].border} ${toneStyles[consistencyTone].bg} ${toneStyles[consistencyTone].text}`}>
        {consistencyStatus}
      </span>
    </summary>

    <div className={`technical-panel relative overflow-hidden border ${toneStyles[consistencyTone].border} bg-brand-elevated/25 p-5`}>
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
      <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="label-caps !mb-2">Consistency Score</p>
          <div className={`text-6xl font-black leading-none tracking-tighter ${toneStyles[consistencyTone].text}`}>
            {tradeReturnsLength < 30 ? '--' : consistencyScore}<span className="text-2xl opacity-50">/100</span>
          </div>
          <p className={`mt-2 text-lg font-black uppercase tracking-tight ${toneStyles[consistencyTone].text}`}>{consistencyStatus}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <VerdictTile label="Buckets" value={`${greenPeriods}G/${redPeriods}R`} tone={greenPeriods >= redPeriods ? 'ready' : 'fail'} />
          <VerdictTile label="Smoothness" value={`${Math.round(smoothnessScore)}%`} tone={smoothnessScore >= 70 ? 'ready' : smoothnessScore >= 45 ? 'caution' : 'fail'} />
          <VerdictTile label="Drift" value={driftLabel.replace('INSUFFICIENT DATA', 'THIN')} tone={driftTone} />
          <VerdictTile label="Rhythm" value={`${Math.round(rhythmScore)}%`} tone={rhythmScore >= 70 ? 'ready' : rhythmScore >= 45 ? 'caution' : 'fail'} />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Period Consistency</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">20-Trade Buckets</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <RiskMetricCard label="Green" value={String(greenPeriods)} tone="ready" />
          <RiskMetricCard label="Red" value={String(redPeriods)} tone={redPeriods <= greenPeriods ? 'caution' : 'fail'} />
          <RiskMetricCard label="Best" value={bestPeriod ? formatR(bestPeriod.net) : '0.00R'} tone="ready" />
          <RiskMetricCard label="Worst" value={worstPeriod ? formatR(worstPeriod.net) : '0.00R'} tone={worstPeriod && worstPeriod.net < 0 ? 'fail' : 'caution'} />
          <RiskMetricCard label="Avg Period" value={formatR(avgPeriodR)} tone={avgPeriodR > 0 ? 'ready' : avgPeriodR === 0 ? 'caution' : 'fail'} />
        </div>
        <div className="mt-4 flex h-8 items-end gap-1 rounded border border-brand-border/40 bg-brand-bg/30 p-1.5">
          {periodBuckets.map((bucket) => (
            <span
              key={bucket.index}
              className={`flex-1 rounded-sm ${bucket.net > 0 ? 'bg-brand-success' : bucket.net < 0 ? 'bg-brand-danger' : 'bg-brand-warning'}`}
              style={{ height: `${Math.min(100, 24 + Math.abs(bucket.net) * 12)}%`, opacity: 0.35 + Math.min(0.45, Math.abs(bucket.net) * 0.04) }}
            />
          ))}
        </div>
      </div>

      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Rolling Stability</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Window Variance</span>
        </div>
        {tradeReturnsLength >= rollingWindow ? (
          <div className="grid grid-cols-1 gap-3">
            <StabilityBar label="Expectancy Stability" value={Math.max(0, 100 - stabilitySpread * 35)} tone={stabilitySpread <= 0.5 ? 'ready' : stabilitySpread <= 1 ? 'caution' : 'fail'} />
            <StabilityBar label="Winrate Stability" value={Math.max(0, 100 - winrateSpread * 1.5)} tone={winrateSpread <= 12 ? 'ready' : winrateSpread <= 25 ? 'caution' : 'fail'} />
            <StabilityBar label="Profit Factor Stability" value={Math.min(100, rollingProfitFactor * 30)} tone={rollingProfitFactor >= 1.5 ? 'ready' : rollingProfitFactor >= 1 ? 'caution' : 'fail'} />
            <StabilityBar label="Recent vs Earlier Drift" value={Math.max(0, Math.min(100, 60 + driftDelta * 40))} tone={driftTone} />
          </div>
        ) : (
          <div className="rounded-lg border border-brand-warning/30 bg-brand-warning/10 p-4 text-[10px] font-black uppercase tracking-[0.18em] text-brand-warning">
            Insufficient sample depth for rolling consistency validation.
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Equity Smoothness</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Curve Rhythm</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StabilityBar label="Smoothness" value={smoothnessScore} tone={smoothnessScore >= 70 ? 'ready' : smoothnessScore >= 45 ? 'caution' : 'fail'} />
          <StabilityBar label="Volatility Pressure" value={100 - volatilityPressure} tone={volatilityPressure <= 35 ? 'ready' : volatilityPressure <= 70 ? 'caution' : 'fail'} />
          <StabilityBar label="Drawdown Interrupt" value={100 - Math.min(100, maxDrawdown * 12)} tone={maxDrawdown <= 5 ? 'ready' : maxDrawdown <= 10 ? 'caution' : 'fail'} />
          <StabilityBar label="Recovery Rhythm" value={rhythmScore} tone={rhythmScore >= 70 ? 'ready' : rhythmScore >= 45 ? 'caution' : 'fail'} />
        </div>
      </div>

      <div className={`technical-panel border ${toneStyles[driftTone].border} ${toneStyles[driftTone].bg} p-5`}>
        <p className="label-caps !mb-2">Drift Detection</p>
        <h4 className={`text-2xl font-black uppercase tracking-tight ${toneStyles[driftTone].text}`}>{driftLabel}</h4>
        <p className="mt-3 text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
          Early {formatR(earlyExpectancy)} / Recent {formatR(recentExpectancy)}
        </p>
      </div>
    </div>

    <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label-caps !mb-0">Consistency Narrative</p>
        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent strategy-blink" />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {consistencyInsights.map((insight, index) => (
          <div key={insight} className={`rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight ${index === insightIndex % consistencyInsights.length ? 'text-brand-text-bright' : 'text-brand-text-dim'}`}>
            {insight}
          </div>
        ))}
      </div>
    </div>
  </details>
);
