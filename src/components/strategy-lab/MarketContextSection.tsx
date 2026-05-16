import { type ContextRow, type ValidationTone, formatR, toneStyles } from './shared';

interface MarketContextSectionProps {
  closedTrades: number;
  contextScore: number;
  contextTone: ValidationTone;
  contextStatus: string;
  contextConfidenceTone: ValidationTone;
  contextConfidenceLabel: string;
  bestSession?: ContextRow;
  bestSymbol?: ContextRow;
  bestDay?: ContextRow;
  weakestContext?: ContextRow;
  concentrationWarning: string | null;
  rankedSessions: ContextRow[];
  rankedSymbols: ContextRow[];
  rankedDays: ContextRow[];
  dayRows: ContextRow[];
  contextInsights: string[];
  insightIndex: number;
  contextRankTone: (row?: ContextRow) => ValidationTone;
  contextRankLabel: (row?: ContextRow) => string;
}

export const MarketContextSection = ({
  closedTrades,
  contextScore,
  contextTone,
  contextStatus,
  contextConfidenceTone,
  contextConfidenceLabel,
  bestSession,
  bestSymbol,
  bestDay,
  weakestContext,
  concentrationWarning,
  rankedSessions,
  rankedSymbols,
  rankedDays,
  dayRows,
  contextInsights,
  insightIndex,
  contextRankTone,
  contextRankLabel
}: MarketContextSectionProps) => (
  <details id="strategy-context" open className="group flex scroll-mt-28 flex-col gap-4">
    <summary className="flex cursor-pointer list-none items-end justify-between gap-4 border-b border-brand-border pb-3">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-brand-text-bright">MARKET CONTEXT</h3>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-brand-text-dim">Session // Symbol // Timing Edge</p>
      </div>
      <span className={`hidden rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest md:inline-flex ${toneStyles[contextTone].border} ${toneStyles[contextTone].bg} ${toneStyles[contextTone].text}`}>
        {contextStatus}
      </span>
    </summary>

    <div className={`technical-panel relative overflow-hidden border ${toneStyles[contextTone].border} bg-brand-elevated/25 p-5`}>
      <div className="absolute inset-0 dot-matrix strategy-dot-drift opacity-10" />
      <div className="strategy-scanline pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand-accent/10 to-transparent" />
      <div className="relative z-10 grid grid-cols-1 gap-5 xl:grid-cols-[0.48fr_1.52fr]">
        <div>
          <p className="label-caps !mb-2">Context Edge Score</p>
          <div className={`text-6xl font-black leading-none tracking-tighter ${toneStyles[contextTone].text}`}>
            {closedTrades < 30 ? '--' : contextScore}<span className="text-2xl opacity-50">/100</span>
          </div>
          <p className={`mt-2 text-lg font-black uppercase tracking-tight ${toneStyles[contextTone].text}`}>{contextStatus}</p>
          <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-widest ${toneStyles[contextConfidenceTone].border} ${toneStyles[contextConfidenceTone].bg} ${toneStyles[contextConfidenceTone].text}`}>
            {contextConfidenceLabel}
          </div>
        </div>
        <div className="rounded-xl border border-brand-border/60 bg-brand-bg/35 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="label-caps !mb-0">Context Summary</p>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Where Edge Works</span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            {[
              ['Best Session', bestSession?.label || 'N/A', bestSession],
              ['Best Symbol', bestSymbol?.label || 'N/A', bestSymbol],
              ['Best Weekday', bestDay?.label || 'N/A', bestDay],
              ['Weakest Context', weakestContext?.label || 'N/A', weakestContext],
              ['Confidence', contextConfidenceLabel.replace(' CONTEXT CONFIDENCE', ''), undefined]
            ].map(([label, value, row]) => {
              const tone = label === 'Confidence' ? contextConfidenceTone : contextRankTone(row as ContextRow | undefined);
              return (
                <div key={label as string} className={`rounded-lg border ${toneStyles[tone].border} ${toneStyles[tone].bg} p-3`}>
                  <p className="text-[7px] font-black uppercase tracking-widest text-brand-text-dim">{label as string}</p>
                  <p className={`mt-1 truncate text-lg font-black uppercase tracking-tight ${toneStyles[tone].text}`}>{value as string}</p>
                  {row && (
                    <p className="mt-1 text-[8px] font-mono uppercase tracking-tight text-brand-text-dim">
                      {(row as ContextRow).trades}T // {formatR((row as ContextRow).expectancy)} exp
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {concentrationWarning && (
            <div className="mt-3 rounded-lg border border-brand-warning/30 bg-brand-warning/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-brand-warning">
              {concentrationWarning}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Session Ranking</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Best / Neutral / Weak</span>
        </div>
        <div className="space-y-2">
          {rankedSessions.map((session, index) => {
            const tone = contextRankTone(session);
            return (
              <div key={session.label} className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border ${toneStyles[tone].border} bg-brand-bg/35 px-3 py-2`}>
                <span className={`w-7 text-[10px] font-black font-mono ${toneStyles[tone].text}`}>#{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-xs font-black uppercase tracking-tight ${toneStyles[tone].text}`}>{session.label}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${toneStyles[tone].border} ${toneStyles[tone].bg} ${toneStyles[tone].text}`}>{contextRankLabel(session)}</span>
                  </div>
                  <p className="text-[8px] font-mono uppercase tracking-tight text-brand-text-dim">
                    {session.trades} trades // {session.winRate.toFixed(1)}% win // {formatR(session.expectancy)} exp
                  </p>
                </div>
                <span className={`text-sm font-black font-mono ${toneStyles[tone].text}`}>{formatR(session.netR)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Symbol Ranking</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Strongest Instruments</span>
        </div>
        <div className="space-y-2">
          {(rankedSymbols.length > 0 ? rankedSymbols : [{ label: 'N/A', trades: 0, winRate: 0, netR: 0, expectancy: 0 }]).slice(0, 5).map((symbol, index) => {
            const tone = contextRankTone(symbol);
            return (
              <div key={`${symbol.label}-${index}`} className={`rounded-lg border ${toneStyles[tone].border} bg-brand-bg/35 px-3 py-2`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`truncate text-xs font-black uppercase tracking-tight ${toneStyles[tone].text}`}>{symbol.label}</span>
                      <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${toneStyles[tone].border} ${toneStyles[tone].bg} ${toneStyles[tone].text}`}>{contextRankLabel(symbol)}</span>
                    </div>
                    <p className="text-[8px] font-mono uppercase tracking-tight text-brand-text-dim">
                      {symbol.trades} trades // {symbol.winRate.toFixed(1)}% win // {formatR(symbol.expectancy)} exp
                    </p>
                  </div>
                  <span className={`text-sm font-black font-mono ${toneStyles[tone].text}`}>{formatR(symbol.netR)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps !mb-0">Weekday Ranking</p>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Timing Map</span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {rankedDays.slice(0, 6).map((day, index) => {
            const tone = contextRankTone(day);
            return (
              <div key={day.label} className={`rounded-lg border ${toneStyles[tone].border} bg-brand-bg/35 p-3`}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className={`text-xs font-black uppercase tracking-tight ${toneStyles[tone].text}`}>#{index + 1} {day.label}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${toneStyles[tone].border} ${toneStyles[tone].bg} ${toneStyles[tone].text}`}>{contextRankLabel(day)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-brand-text-dim">Trades</p>
                    <p className="font-mono text-sm font-black text-brand-text-bright">{day.trades}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-brand-text-dim">Exp</p>
                    <p className={`font-mono text-sm font-black ${toneStyles[tone].text}`}>{formatR(day.expectancy)}</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-brand-text-dim">Net</p>
                    <p className={`font-mono text-sm font-black ${toneStyles[tone].text}`}>{formatR(day.netR)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex h-8 items-end gap-1 rounded border border-brand-border/40 bg-brand-bg/30 p-1.5">
          {dayRows.map((day) => {
            const tone = day.expectancy > 0 ? 'bg-brand-success' : day.expectancy < 0 ? 'bg-brand-danger' : 'bg-brand-warning';
            return (
              <span
                key={day.label}
                title={day.label}
                className={`flex-1 rounded-sm ${tone}`}
                style={{ height: `${day.trades > 0 ? Math.min(100, 24 + Math.abs(day.netR) * 10) : 12}%`, opacity: day.trades > 0 ? 0.35 + Math.min(0.45, Math.abs(day.expectancy) * 0.4) : 0.18 }}
              />
            );
          })}
        </div>
      </div>

      <div className="technical-panel bg-brand-elevated/20 border-brand-border/60 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="label-caps !mb-0">Context Notes</p>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent strategy-blink" />
        </div>
        <div className="space-y-2">
          {concentrationWarning && (
            <div className="rounded border border-brand-warning/40 bg-brand-warning/10 px-3 py-2 text-[10px] font-black uppercase tracking-tight text-brand-warning">
              {concentrationWarning}
            </div>
          )}
          {contextInsights.map((insight, index) => (
            <div key={insight} className={`rounded border border-brand-border/50 bg-brand-bg/35 px-3 py-2 text-[10px] font-mono uppercase tracking-tight ${index === insightIndex % contextInsights.length ? 'text-brand-text-bright' : 'text-brand-text-dim'}`}>
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  </details>
);
