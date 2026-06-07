import { Activity, Radio, Target } from 'lucide-react';
import type { TradeStats } from '../../types';
import { MetricDrilldown, MicroBars, MiniDistribution, MiniSparkline, RadialGauge, ScoreTrendLine, TelemetryStrip, type ValidationTone, formatR, toneStyles } from './shared';

type ChecklistItem = {
  label: string;
  value: string;
  tone: ValidationTone;
};

interface DeploymentValidationSectionProps {
  labStats: TradeStats;
  closedTrades: number;
  netR: number;
  status: typeof toneStyles[ValidationTone];
  statusTone: ValidationTone;
  readinessScore: number;
  reason: string;
  deploymentMeaning: string;
  regime: string;
  deploymentStage: number;
  systemIndicators: string[];
  reliability: { label: string; value: number; tone: typeof toneStyles[ValidationTone] };
  rotatingInsights: string[];
  insightIndex: number;
  riskTone: ValidationTone;
  riskState: string;
}

export const DeploymentValidationSection = ({
  labStats,
  closedTrades,
  netR,
  status,
  statusTone,
  readinessScore,
  reason,
  deploymentMeaning,
  regime,
  deploymentStage,
  systemIndicators,
  reliability,
  rotatingInsights,
  insightIndex,
  riskTone,
  riskState
}: DeploymentValidationSectionProps) => (
  <details id="strategy-validation" open className="group flex scroll-mt-28 flex-col gap-4">
    <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">DEPLOYMENT VALIDATION</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Readiness // Sample Trust // Deployment State</p>
      </div>
      <span className="rounded border border-brand-border px-2 py-1 text-[8px] font-black uppercase tracking-widest text-brand-text-dim group-open:hidden">Open</span>
      <span className="hidden rounded border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-brand-accent group-open:inline-block">Collapse</span>
    </summary>

    <section className={`technical-panel relative overflow-hidden p-6 border ${status.border} bg-brand-elevated/50 shadow-2xl`}>
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10 pointer-events-none" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
      <div className={`strategy-radar pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border ${status.border} ${status.bg} blur-[1px]`} />
      <div className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full border border-brand-accent/10 bg-[radial-gradient(circle,rgba(217,119,87,0.10),transparent_65%)]" />
      <div className={`absolute inset-x-0 top-0 h-1 ${status.bar}`} />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-end">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 md:hidden">
            {['AI VALIDATION ACTIVE', 'NEURAL ANALYSIS ONLINE'].map((tag) => (
              <span key={tag} className="rounded-full border border-brand-accent/25 bg-brand-accent/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-brand-accent">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${status.bg} ${status.text} border ${status.border} flex items-center justify-center`}>
              <Target size={20} />
            </div>
            <div>
              <p className="label-caps !mb-0">
                Strategy Status <MetricDrilldown tone={statusTone} content={{ title: 'Strategy Status', current: status.label, meaning: 'Deployment readiness based on local validation gates.', signals: ['Expectancy', 'Profit factor', 'Drawdown', 'Closed trades'], ranges: ['Ready: all core gates pass', 'Caution: still validating', 'Fail: unsafe for capital'], why: reason }} />
              </p>
              <h3 className={`text-4xl font-black tracking-tighter ${status.text}`}>{status.label}</h3>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-brand-text-dim font-mono uppercase tracking-tight leading-relaxed">{reason}</p>
          <TelemetryStrip
            items={[
              { label: 'READY', value: `${readinessScore}%`, tone: statusTone },
              { label: 'RISK', value: riskState, tone: riskTone },
              { label: 'NET', value: formatR(netR), tone: netR > 0 ? 'ready' : netR === 0 ? 'caution' : 'fail' }
            ]}
            label="Deployment telemetry strip"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {systemIndicators.map((label, index) => (
              <div key={label} className="rounded border border-brand-border/50 bg-brand-bg/35 px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? status.bar : 'bg-brand-accent/60'} strategy-blink`} style={{ animationDelay: `${index * 0.28}s` }} />
                  <span className="text-[7px] font-black uppercase tracking-[0.16em] text-brand-text-dim">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-brand-bg/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <p className="label-caps !mb-0">
              Live Readiness Score <MetricDrilldown tone={statusTone} content={{ title: 'Readiness Score', current: `${readinessScore}/100`, meaning: 'Checklist score for deployment validation.', signals: ['Positive expectancy', 'Profit factor', 'Drawdown limit', 'Sample depth', 'Winrate', 'Recovery'], ranges: ['85+: strong', '60-84: paper-ready', '<60: incomplete'], why: deploymentMeaning }} />
            </p>
            <span className={`rounded-full border ${status.border} ${status.bg} px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${status.text}`}>
              {regime}
            </span>
          </div>
          <RadialGauge score={readinessScore} tone={statusTone} />
          <ScoreTrendLine score={readinessScore} tone={statusTone} label="Readiness score trend" />
          <div className="grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span key={index} className={`h-1 rounded-full ${index < Math.ceil(readinessScore / 17) ? status.bar : 'bg-brand-border/40'}`} />
            ))}
          </div>
          <p className={`mt-3 text-[10px] font-black uppercase tracking-[0.18em] ${status.text}`}>{deploymentMeaning}</p>
        </div>
      </div>
    </section>

    <section className="technical-panel p-4 bg-brand-elevated/15 border-brand-border/50">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="label-caps !mb-0">Deployment Timeline</p>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Phase 1.2 // Readiness Pipeline</span>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        {['COLLECTING DATA', 'VALIDATING EDGE', 'PAPER READY', 'LIVE READY'].map((stage, index) => {
          const active = index <= deploymentStage;
          const current = index === deploymentStage;
          return (
            <div key={stage} className={`relative overflow-hidden rounded-lg border px-3 py-3 ${active ? `${status.border} ${status.bg}` : 'border-brand-border/50 bg-brand-bg/30'}`}>
              {current && <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className={`text-[9px] font-black uppercase tracking-widest ${active ? status.text : 'text-brand-text-dim'}`}>{stage}</span>
                <span className={`h-2 w-2 rounded-full ${active ? status.bar : 'bg-brand-border'} ${current ? 'strategy-blink' : ''}`} />
              </div>
              <div className="mt-2 h-1 rounded-full bg-brand-border/30">
                <div className={`h-full rounded-full ${active ? status.bar : 'bg-transparent'}`} style={{ width: active ? '100%' : '0%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`technical-panel p-5 border ${reliability.tone.border} bg-brand-elevated/30 lg:col-span-1`}>
        <p className="label-caps !mb-3">
          Statistical Confidence <MetricDrilldown tone={closedTrades >= 100 ? 'ready' : closedTrades >= 30 ? 'caution' : 'fail'} content={{ title: 'Statistical Confidence', current: `${closedTrades} trades`, meaning: 'Sample depth behind the current validation result.', signals: ['Closed trade count', 'Checklist coverage'], ranges: ['100+: reliable', '30-99: developing', '<30: thin'], why: reliability.label }} />
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-black text-brand-text-bright tracking-tighter">{closedTrades}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-dim">{closedTrades} verified executions collected</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${reliability.tone.bg} ${reliability.tone.text} border ${reliability.tone.border}`}>
            {reliability.label}
          </span>
        </div>
        <div className="mt-5 h-2 rounded-full bg-brand-border/30 overflow-hidden">
          <div className={`h-full ${reliability.tone.bar}`} style={{ width: `${Math.min(100, closedTrades)}%` }} />
        </div>
        <MicroBars values={[closedTrades, readinessScore, labStats.winRate, Math.max(0, 100 - labStats.maxDrawdown * 10)]} tone={statusTone} label="Validation confidence bars" />
        {closedTrades < 30 && (
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-warning leading-relaxed">
            Sample exposure is below institutional validation threshold.
          </p>
        )}
      </div>

      <div className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60 lg:col-span-2">
        <p className="label-caps !mb-3">
          Core Validation Metrics <MetricDrilldown tone={statusTone} content={{ title: 'Core Validation Metrics', current: status.label, meaning: 'Primary raw metrics behind readiness.', signals: ['Win rate', 'Expectancy', 'Profit factor', 'Max drawdown', 'Net R'], ranges: ['Positive edge plus controlled risk is preferred'], why: reason }} />
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Win Rate', `${labStats.winRate.toFixed(1)}%`, labStats.winRate >= 50 ? 'ready' : labStats.winRate >= 45 ? 'caution' : 'fail'],
            ['Expectancy', formatR(labStats.expectancy), labStats.expectancy > 0 ? 'ready' : 'fail'],
            ['Profit Factor', labStats.profitFactor > 0 ? labStats.profitFactor.toFixed(2) : '0.00', labStats.profitFactor > 1.5 ? 'ready' : labStats.profitFactor >= 1 ? 'caution' : 'fail'],
            ['Max Drawdown', `-${labStats.maxDrawdown.toFixed(2)}R`, labStats.maxDrawdown <= 5 ? 'ready' : labStats.maxDrawdown <= 10 ? 'caution' : 'fail'],
            ['Recovery Factor', labStats.recoveryFactor > 0 ? labStats.recoveryFactor.toFixed(2) : '0.00', labStats.recoveryFactor > 0 ? 'ready' : 'fail'],
            ['Net R', formatR(netR), netR > 0 ? 'ready' : netR === 0 ? 'caution' : 'fail'],
            ['Closed Trades', String(closedTrades), closedTrades >= 100 ? 'ready' : 'caution']
          ].map(([label, value, tone]) => (
            <div key={label} className="group rounded-lg border border-brand-border/60 bg-brand-bg/40 p-3 transition-all hover:shadow-[0_0_20px_rgba(217,119,87,0.05)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">METRIC // {label}</p>
                <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone as ValidationTone].bar}`} />
              </div>
              <p className="mt-1 text-xl font-black font-mono text-brand-text-bright tracking-tighter">{value}</p>
              <MiniSparkline tone={tone as ValidationTone} />
            </div>
          ))}
        </div>
        <MiniDistribution values={labStats.equityCurve.map((point) => point.rMultiple || 0)} label="Core validation outcome distribution" />
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="technical-panel p-5 bg-brand-elevated/20 border-brand-border/60 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-brand-accent" />
              <p className="label-caps !mb-0">
                Deployment Signal Feed <MetricDrilldown tone={statusTone} content={{ title: 'Signal Feed', current: rotatingInsights[insightIndex] || 'Waiting', meaning: 'Rotating concise interpretation of the strongest local signal.', signals: rotatingInsights.slice(0, 3), ranges: ['Bright text marks the active signal'], why: deploymentMeaning }} />
              </p>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-brand-accent/70">Rotating Signal Feed</span>
          </div>
        <div className="relative overflow-hidden rounded-lg border border-brand-border/50 bg-brand-bg/35 px-4 py-4">
          <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
          <p className="relative z-10 min-h-8 text-[12px] font-mono uppercase tracking-tight text-brand-text-bright">
            {rotatingInsights[insightIndex] || 'System is awaiting stronger directional evidence before deployment escalation.'}
          </p>
          <div className="relative z-10 mt-3 flex gap-1">
            {rotatingInsights.slice(0, 6).map((insight, index) => (
              <span key={`${insight}-${index}`} className={`h-1 flex-1 rounded-full ${index === insightIndex % Math.min(6, rotatingInsights.length) ? status.bar : 'bg-brand-border/50'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`technical-panel p-5 border ${toneStyles[riskTone].border} bg-brand-elevated/25`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="label-caps !mb-1">
              Risk Pressure <MetricDrilldown tone={riskTone} content={{ title: 'Risk Pressure', current: riskState, meaning: 'Deployment risk summary inside the validation section.', signals: ['Market stress', 'Deployment risk', 'Max drawdown'], ranges: ['Low', 'Elevated', 'High'], why: `Drawdown is -${labStats.maxDrawdown.toFixed(2)}R.` }} />
            </p>
            <h3 className={`text-3xl font-black tracking-tighter ${toneStyles[riskTone].text}`}>{riskState}</h3>
          </div>
          <div className={`h-10 w-10 rounded-lg ${toneStyles[riskTone].bg} ${toneStyles[riskTone].text} border ${toneStyles[riskTone].border} flex items-center justify-center`}>
            <Radio size={18} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded border border-brand-border/50 bg-brand-bg/40 p-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Market Stress</p>
            <p className={`text-sm font-black ${toneStyles[riskTone].text}`}>{riskState}</p>
          </div>
          <div className="rounded border border-brand-border/50 bg-brand-bg/40 p-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Deployment Risk</p>
            <p className={`text-sm font-black ${status.text}`}>{statusTone === 'ready' ? 'LOW' : statusTone === 'caution' ? 'ELEVATED' : 'HIGH'}</p>
          </div>
        </div>
        <div className="mt-4 flex h-8 items-end gap-1 rounded border border-brand-border/40 bg-brand-bg/30 p-1.5">
          {[42, 58, 35, 64, 48, 72, 55, 80, 66, 88].map((height, index) => (
            <span key={index} className={`flex-1 rounded-sm ${toneStyles[riskTone].bar}`} style={{ height: `${height}%`, opacity: 0.18 + index * 0.045 }} />
          ))}
        </div>
        <MicroBars values={[labStats.maxDrawdown, labStats.maxConsecutiveLosses, labStats.recoveryFactor, labStats.expectancy]} tone={riskTone} label="Risk pressure micro bars" />
      </div>
    </section>
  </details>
);
