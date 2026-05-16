import type React from 'react';
import { BrainCircuit, FileWarning, ShieldCheck, Sparkles } from 'lucide-react';
import { MetricDrilldown, ScoreTrendLine, TelemetryStrip, type ValidationTone, toneStyles } from './shared';

interface AIStrategyIntelligenceSectionProps {
  deploymentAdvisory: string;
  advisoryTone: ValidationTone;
  strongestCharacteristic: string;
  biggestWeakness: string;
  deploymentRecommendation: string;
  intelligenceConfidence: string;
  confidenceScore: number;
  intelligenceTone: ValidationTone;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  narrative: string[];
}

const IntelligencePill = ({ label, tone }: { label: string; tone: ValidationTone }) => (
  <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${toneStyles[tone].border} ${toneStyles[tone].bg} ${toneStyles[tone].text}`}>
    {label}
  </span>
);

const IntelligenceList = ({
  title,
  icon,
  items,
  tone,
  emptyText
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: ValidationTone;
  emptyText: string;
}) => (
  <div className={`technical-panel border ${toneStyles[tone].border} bg-brand-elevated/20 p-5`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="label-caps !mb-0">{title}</p>
      </div>
      <span className={`h-1.5 w-1.5 rounded-full ${toneStyles[tone].bar} strategy-blink`} />
    </div>
    <div className="space-y-2">
      {(items.length > 0 ? items : [emptyText]).map((item) => (
        <div key={item} className="rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight text-brand-text-bright">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export const AIStrategyIntelligenceSection = ({
  deploymentAdvisory,
  advisoryTone,
  strongestCharacteristic,
  biggestWeakness,
  deploymentRecommendation,
  intelligenceConfidence,
  confidenceScore,
  intelligenceTone,
  strengths,
  weaknesses,
  redFlags,
  narrative
}: AIStrategyIntelligenceSectionProps) => (
  <details id="strategy-intelligence" open className="group flex scroll-mt-28 flex-col gap-4">
    <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">AI STRATEGY INTELLIGENCE</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">System Review // Deployment Advisory</p>
      </div>
      <IntelligencePill label={deploymentAdvisory} tone={advisoryTone} />
    </summary>

    <div className={`technical-panel relative overflow-hidden border ${toneStyles[advisoryTone].border} bg-brand-elevated/30 p-5`}>
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
      <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="label-caps !mb-2">
            Executive Deployment Review <MetricDrilldown tone={advisoryTone} content={{ title: 'AI Recommendation', current: deploymentAdvisory, meaning: 'Local synthesis of Strategy Lab evidence, not an external AI call.', signals: ['Readiness', 'Risk', 'Edge', 'Consistency', 'Context', 'Psychology'], ranges: ['Ready: aligned', 'Paper: mixed', 'Insufficient: thin or risky'], why: deploymentRecommendation }} />
          </p>
          <h4 className={`text-4xl font-black uppercase tracking-tighter ${toneStyles[advisoryTone].text}`}>{deploymentAdvisory}</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            <IntelligencePill label={intelligenceConfidence} tone={intelligenceTone} />
            <IntelligencePill label="LOCAL METRICS ONLY" tone="caution" />
          </div>
          <ScoreTrendLine score={confidenceScore} tone={intelligenceTone} label="AI confidence trend" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-brand-border/60 bg-brand-bg/35 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">
              Strongest Characteristic <MetricDrilldown tone="ready" content={{ title: 'Strengths', current: `${strengths.length} signals`, meaning: 'Positive evidence found across local Strategy Lab sections.', signals: strengths.length > 0 ? strengths.slice(0, 3) : ['No confirmed strength yet'], ranges: ['More independent strengths improves confidence'], why: strongestCharacteristic }} />
            </p>
            <p className="mt-2 text-sm font-black uppercase tracking-tight text-brand-success">{strongestCharacteristic}</p>
            <TelemetryStrip items={[{ label: 'CONF', value: `${confidenceScore}%`, tone: intelligenceTone }, { label: 'SIG', value: strengths.length, tone: strengths.length > 0 ? 'ready' : 'caution' }, { label: 'FLAG', value: redFlags.length, tone: redFlags.length > 0 ? 'fail' : 'ready' }]} label="AI strength telemetry" />
          </div>
          <div className="rounded-lg border border-brand-border/60 bg-brand-bg/35 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">
              Biggest Weakness <MetricDrilldown tone="caution" content={{ title: 'Weaknesses', current: `${weaknesses.length} signals`, meaning: 'Weak evidence or unresolved validation gaps.', signals: weaknesses.length > 0 ? weaknesses.slice(0, 3) : ['No major weakness isolated'], ranges: ['Few: manageable', 'Several: caution', 'Many: no scaling'], why: biggestWeakness }} />
            </p>
            <p className="mt-2 text-sm font-black uppercase tracking-tight text-brand-warning">{biggestWeakness}</p>
            <ScoreTrendLine score={Math.max(0, 100 - weaknesses.length * 22 - redFlags.length * 34)} tone={weaknesses.length > 1 || redFlags.length > 0 ? 'caution' : 'ready'} label="Weakness load trend" />
          </div>
          <div className="rounded-lg border border-brand-border/60 bg-brand-bg/35 p-4">
            <p className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">
              Recommendation <MetricDrilldown tone={advisoryTone} content={{ title: 'Red Flags', current: `${redFlags.length} active`, meaning: 'Hard warnings that can override otherwise positive metrics.', signals: redFlags.length > 0 ? redFlags.slice(0, 3) : ['No active red flags'], ranges: ['0: clean', '1+: review', '3+: avoid scaling'], why: deploymentRecommendation }} />
            </p>
            <p className={`mt-2 text-sm font-black uppercase tracking-tight ${toneStyles[advisoryTone].text}`}>{deploymentRecommendation}</p>
            <ScoreTrendLine score={confidenceScore} tone={advisoryTone} label="Recommendation confidence trend" />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <IntelligenceList title="Key Strengths" icon={<ShieldCheck size={14} className="text-brand-success" />} items={strengths} tone="ready" emptyText="No institutional-strength signal confirmed yet." />
      <IntelligenceList title="Primary Weaknesses" icon={<FileWarning size={14} className="text-brand-warning" />} items={weaknesses} tone="caution" emptyText="No major weakness isolated by current metrics." />
      <IntelligenceList title="Red Flags" icon={<FileWarning size={14} className="text-brand-danger" />} items={redFlags} tone={redFlags.length > 0 ? 'fail' : 'ready'} emptyText="No active red flags detected." />
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.78fr_1.22fr]">
      <div className={`technical-panel border ${toneStyles[advisoryTone].border} ${toneStyles[advisoryTone].bg} p-5`}>
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit size={15} className={toneStyles[advisoryTone].text} />
          <p className="label-caps !mb-0">Deployment Recommendation</p>
        </div>
        <h4 className={`text-2xl font-black uppercase tracking-tight ${toneStyles[advisoryTone].text}`}>{deploymentRecommendation}</h4>
        <p className="mt-3 text-[10px] font-mono uppercase tracking-tight text-brand-text-dim">
          Recommendation synthesizes readiness, edge, capital pressure, consistency, market context, and execution survivability.
        </p>
      </div>

      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand-accent" />
            <p className="label-caps !mb-0">AI Narrative Engine</p>
          </div>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${toneStyles[intelligenceTone].text}`}>{intelligenceConfidence}</span>
        </div>
        <div className="space-y-2">
          {narrative.map((paragraph) => (
            <p key={paragraph} className="rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase leading-relaxed tracking-tight text-brand-text-bright">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  </details>
);
