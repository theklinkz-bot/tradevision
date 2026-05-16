import { Brain, Gauge, Waves } from 'lucide-react';
import { StabilityBar, VerdictTile, type ValidationTone, toneStyles } from './shared';

interface PsychologicalAnalyticsSectionProps {
  psychologicalScore: number;
  psychologicalStatus: string;
  psychologicalTone: ValidationTone;
  lossStreakPressure: number;
  drawdownStress: number;
  recoveryFatigue: number;
  volatilityStress: number;
  equityWhiplash: number;
  longestLossStreak: number;
  emotionalLoad: number;
  recoveryDuration: number;
  averageStressLevel: number;
  strategySmoothness: number;
  pressureZones: number;
  overtradingStatus: string;
  overtradingTone: ValidationTone;
  averageTradesPerDay: number;
  maxTradesPerDay: number;
  psychologicalTimelineIndex: number;
  psychologicalInsights: string[];
  insightIndex: number;
}

const PsychMetricCard = ({ label, value, tone }: { label: string; value: string; tone: ValidationTone }) => (
  <div className="group rounded-lg border border-brand-border/60 bg-brand-bg/40 p-3 transition-all hover:shadow-[0_0_18px_rgba(251,191,36,0.05)]">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">PSYCH // {label}</p>
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].bar} strategy-blink`} />
    </div>
    <p className={`mt-1 text-lg font-black font-mono tracking-tighter ${toneStyles[tone].text}`}>{value}</p>
  </div>
);

export const PsychologicalAnalyticsSection = ({
  psychologicalScore,
  psychologicalStatus,
  psychologicalTone,
  lossStreakPressure,
  drawdownStress,
  recoveryFatigue,
  volatilityStress,
  equityWhiplash,
  longestLossStreak,
  emotionalLoad,
  recoveryDuration,
  averageStressLevel,
  strategySmoothness,
  pressureZones,
  overtradingStatus,
  overtradingTone,
  averageTradesPerDay,
  maxTradesPerDay,
  psychologicalTimelineIndex,
  psychologicalInsights,
  insightIndex
}: PsychologicalAnalyticsSectionProps) => (
  <details id="strategy-psychology" open className="group flex scroll-mt-28 flex-col gap-4">
    <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">PSYCHOLOGICAL ANALYTICS</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Discipline Load // Tilt Resistance</p>
      </div>
      <span className={`hidden rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest md:inline-flex ${toneStyles[psychologicalTone].border} ${toneStyles[psychologicalTone].bg} ${toneStyles[psychologicalTone].text}`}>
        {psychologicalStatus}
      </span>
    </summary>

    <div className={`technical-panel relative overflow-hidden border ${toneStyles[psychologicalTone].border} bg-brand-elevated/25 p-5`}>
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-warning/10 to-transparent" />
      <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-[0.6fr_1.4fr]">
        <div>
          <p className="label-caps !mb-2">Execution Survivability Score</p>
          <div className={`text-6xl font-black leading-none tracking-tighter ${toneStyles[psychologicalTone].text}`}>
            {psychologicalScore}<span className="text-2xl opacity-50">/100</span>
          </div>
          <p className={`mt-2 text-lg font-black uppercase tracking-tight ${toneStyles[psychologicalTone].text}`}>{psychologicalStatus}</p>
          <p className="mt-3 max-w-sm text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
            Measures whether a trader can keep executing the rules through loss pressure, fatigue, and rapid-fire temptation.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <VerdictTile label="Discipline Load" value={`${Math.round(emotionalLoad)}%`} tone={psychologicalTone} />
          <VerdictTile label="Tilt Risk" value={pressureZones <= 1 ? 'LOW' : pressureZones <= 3 ? 'WATCH' : 'HIGH'} tone={pressureZones <= 1 ? 'ready' : pressureZones <= 3 ? 'caution' : 'fail'} />
          <VerdictTile label="Behavior" value={overtradingStatus.replace(' ACTIVITY', '').replace(' DETECTED', '')} tone={overtradingTone} />
          <VerdictTile label="Rule Stability" value={`${Math.round(strategySmoothness)}%`} tone={strategySmoothness >= 70 ? 'ready' : strategySmoothness >= 45 ? 'caution' : 'fail'} />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-brand-warning" />
            <p className="label-caps !mb-0">Execution Pressure</p>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Discipline Telemetry</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StabilityBar label="Invalidation Fatigue" value={lossStreakPressure} tone={lossStreakPressure <= 35 ? 'ready' : lossStreakPressure <= 70 ? 'caution' : 'fail'} />
          <StabilityBar label="Tilt Risk" value={drawdownStress} tone={drawdownStress <= 35 ? 'ready' : drawdownStress <= 70 ? 'caution' : 'fail'} />
          <StabilityBar label="Recovery Tolerance" value={recoveryFatigue} tone={recoveryFatigue <= 35 ? 'ready' : recoveryFatigue <= 70 ? 'caution' : 'fail'} />
          <StabilityBar label="Impulse Pressure" value={volatilityStress} tone={volatilityStress <= 35 ? 'ready' : volatilityStress <= 70 ? 'caution' : 'fail'} />
          <StabilityBar label="Rule-Following Strain" value={equityWhiplash} tone={equityWhiplash <= 35 ? 'ready' : equityWhiplash <= 70 ? 'caution' : 'fail'} />
        </div>
      </div>

      <div className={`technical-panel border ${toneStyles[overtradingTone].border} ${toneStyles[overtradingTone].bg} p-5`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="label-caps !mb-2">Overtrading Pressure</p>
            <h4 className={`text-2xl font-black uppercase tracking-tight ${toneStyles[overtradingTone].text}`}>{overtradingStatus}</h4>
          </div>
          <Gauge size={24} className={toneStyles[overtradingTone].text} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PsychMetricCard label="Cadence" value={`${averageTradesPerDay.toFixed(1)}/D`} tone={overtradingTone} />
          <PsychMetricCard label="Cluster Peak" value={String(maxTradesPerDay)} tone={overtradingTone} />
        </div>
        <p className="mt-3 text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
          Detects trade clustering, rapid-fire execution risk, and fatigue from repeated same-day decisions.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <PsychMetricCard label="Invalidations" value={String(longestLossStreak)} tone={longestLossStreak <= 2 ? 'ready' : longestLossStreak <= 4 ? 'caution' : 'fail'} />
      <PsychMetricCard label="Discipline Load" value={`${Math.round(emotionalLoad)}%`} tone={psychologicalTone} />
      <PsychMetricCard label="Recovery Wait" value={`${recoveryDuration} Trades`} tone={recoveryDuration <= 8 ? 'ready' : recoveryDuration <= 18 ? 'caution' : 'fail'} />
      <PsychMetricCard label="Stress Avg" value={`${Math.round(averageStressLevel)}%`} tone={averageStressLevel <= 35 ? 'ready' : averageStressLevel <= 70 ? 'caution' : 'fail'} />
      <PsychMetricCard label="Behavioral Stability" value={`${Math.round(strategySmoothness)}%`} tone={strategySmoothness >= 70 ? 'ready' : strategySmoothness >= 45 ? 'caution' : 'fail'} />
      <PsychMetricCard label="Tilt Zones" value={String(pressureZones)} tone={pressureZones <= 1 ? 'ready' : pressureZones <= 3 ? 'caution' : 'fail'} />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Waves size={14} className="text-brand-warning" />
            <p className="label-caps !mb-0">Discipline Timeline</p>
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Calm To Rule Break</span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {['CALM', 'PRESSURED', 'FATIGUED', 'UNSUSTAINABLE'].map((stage, index) => {
            const active = index === psychologicalTimelineIndex;
            const passed = index < psychologicalTimelineIndex;
            const tone: ValidationTone = active ? psychologicalTone : passed ? 'caution' : 'ready';
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

      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="label-caps !mb-0">Execution Survivability</p>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-warning strategy-blink" />
        </div>
        <div className="space-y-2">
          {psychologicalInsights.map((insight, index) => (
            <div key={insight} className={`rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight ${index === insightIndex % psychologicalInsights.length ? 'text-brand-text-bright' : 'text-brand-text-dim'}`}>
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  </details>
);
