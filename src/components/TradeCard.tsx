import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trash2, 
  Activity, 
  ChevronRight, 
  StickyNote, 
  Plus 
} from 'lucide-react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { AnalysisHistoryItem, TranslationSchema } from '../types';
import { calculateRMultiple } from '../lib/tradeUtils';

export const NoteTooltip = ({ note, t }: { note: string, t: TranslationSchema }) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <button className="text-brand-accent hover:text-brand-accent/80 transition-all flex items-center justify-center p-1 rounded-full bg-brand-accent/10 border border-brand-accent/20">
            <StickyNote size={12} />
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-[150] select-none rounded bg-brand-bg/80 backdrop-blur-md px-4 py-3 text-[11px] leading-relaxed text-brand-text-bright shadow-2xl border border-brand-accent/30 animate-in fade-in zoom-in-95 duration-200 w-64"
            sideOffset={5}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 border-b border-brand-border/50 pb-2">
                <StickyNote size={12} className="text-brand-accent" />
                <span className="label-caps mb-0 text-[10px]">{t.capture.trade_notes}</span>
              </div>
              <p className="font-mono whitespace-pre-wrap break-words opacity-90">{note}</p>
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export const PurgeButton = ({ onPurge, tradeId, t }: { onPurge: (id: string) => void, tradeId: string, t: TranslationSchema }) => {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirming) {
      onPurge(tradeId);
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={200}>
        <RadixTooltip.Trigger asChild>
          <button
            onClick={handleClick}
            className={`
              relative min-w-10 h-[34px] px-2 flex items-center justify-center rounded border transition-all duration-300 overflow-hidden
              ${confirming ? 'bg-brand-danger border-brand-danger shadow-lg shadow-brand-danger/20' : 'bg-brand-bg/40 border-white/5 hover:bg-brand-danger/10 hover:border-brand-danger/30'}
              group
            `}
          >
            {confirming ? (
              <span className="text-[9px] font-black text-white uppercase tracking-tighter relative z-10 whitespace-nowrap px-1">
                {t.ui.confirm_purge}
              </span>
            ) : (
              <Trash2 
                size={14} 
                className="relative z-10 transition-all duration-300 text-brand-danger/60 group-hover:text-brand-danger group-hover:opacity-100" 
              />
            )}
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-brand-danger/5 blur-xl" />
            </div>

            {confirming && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-white"
              />
            )}
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-50 bg-brand-bg border border-brand-danger/30 p-2 rounded shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <div className="flex flex-col items-center">
              <p className="text-[9px] font-mono font-bold text-brand-danger uppercase tracking-widest leading-none">
                {t.ui.purge_node}
              </p>
            </div>
            <RadixTooltip.Arrow className="fill-brand-bg" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export const TradeRow: React.FC<{ 
  item: AnalysisHistoryItem, 
  onEdit: (item: AnalysisHistoryItem) => void, 
  onDelete: (id: string) => void,
  t: TranslationSchema
}> = ({ 
  item, 
  onEdit, 
  onDelete,
  t
}) => {
  return (
    <motion.tr 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.95,
        filter: 'blur(10px) brightness(2)',
        transition: { duration: 0.6 }
      }}
      className="hover:bg-brand-elevated/30 transition-colors group"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded bg-brand-bg border border-brand-border group-hover:border-brand-accent transition-colors">
            <Activity size={14} className="text-brand-accent" />
          </div>
          <span className="monospace-data font-bold">{item.symbol}</span>
        </div>
      </td>
      <td className="p-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.side === 'Long' ? 'bg-trade-long/20 text-trade-long' : 'bg-trade-short/20 text-trade-short'}`}>
          {item.side}
        </span>
      </td>
      <td className="p-4">
        <span className="monospace-data opacity-80">{item.levels.entry?.toLocaleString()}</span>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-0.5">
          <span className="monospace-data text-[10px] text-trade-long">+{item.levels.takeProfit?.toLocaleString()}</span>
          <span className="monospace-data text-[10px] text-trade-short">-{item.levels.stopLoss?.toLocaleString()}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Win' ? 'bg-trade-long' : item.status === 'Loss' ? 'bg-trade-short' : 'bg-status-neutral opacity-40 animate-pulse'}`} />
          <span className={`text-[10px] uppercase font-bold tracking-wider ${item.status === 'Win' ? 'text-trade-long/80' : item.status === 'Loss' ? 'text-trade-short/80' : 'opacity-40'}`}>{item.status}</span>
        </div>
      </td>
      <td className="p-4">
        {item.status !== 'Pending' ? (
          <span className={`monospace-data text-[10px] font-bold ${calculateRMultiple(item) > 0 ? 'text-trade-long' : calculateRMultiple(item) < 0 ? 'text-trade-short' : 'text-brand-text-dim opacity-50'}`}>
            {calculateRMultiple(item) > 0 ? '+' : ''}{calculateRMultiple(item).toFixed(2)}R
          </span>
        ) : (
          <span className="monospace-data text-[10px] opacity-20">---</span>
        )}
      </td>
      <td className="p-4">
        {item.strategyName ? (
          <span
            className="inline-flex max-w-[120px] items-center gap-1 rounded border px-2 py-1 text-[9px] font-black uppercase tracking-tighter"
            style={{
              borderColor: item.strategyColor ? `${item.strategyColor}55` : undefined,
              backgroundColor: item.strategyColor ? `${item.strategyColor}18` : undefined,
              color: item.strategyColor || undefined
            }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.strategyColor || 'currentColor' }} />
            <span className="truncate">{item.strategyName}</span>
          </span>
        ) : (
          <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-dim/35">Unlinked</span>
        )}
      </td>
      <td className="p-4 max-[1500px]:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono opacity-40 uppercase">{item.date}</span>
          {item.notes && (
            <NoteTooltip note={item.notes} t={t} />
          )}
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {!item.notes && (
            <button
              onClick={() => onEdit({ ...item, notes: '' })}
              className="p-2 bg-brand-bg border border-brand-border rounded text-brand-text-dim hover:text-brand-accent hover:border-brand-accent transition-all"
              title={t.ui.save + " Note"}
            >
              <Plus size={14} />
            </button>
          )}
          <PurgeButton 
            tradeId={item.id}
            onPurge={onDelete}
            t={t}
          />
          <button 
            onClick={() => onEdit(item)}
            className="h-[34px] min-w-[82px] px-3 py-1.5 bg-brand-elevated border border-brand-border rounded text-[10px] font-bold uppercase tracking-widest hover:bg-brand-accent hover:border-brand-accent hover:text-white transition-all active:scale-95"
          >
            {t.ui.edit_node}
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export const MobileLogItem: React.FC<{ 
  item: AnalysisHistoryItem, 
  onDelete: (id: string) => void, 
  onEdit: (item: AnalysisHistoryItem) => void,
  t: TranslationSchema
}> = ({ 
  item, 
  onDelete, 
  onEdit,
  t
}) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const dragX = React.useRef(0);

  return (
    <div className="relative overflow-hidden bg-brand-bg group">
      {/* Purge Action Layer (Behind) */}
      <div className="absolute inset-0 flex justify-end bg-trade-short/20">
        <div className="w-20 h-full flex items-center justify-center border-l border-trade-short/30">
          <PurgeButton tradeId={item.id} onPurge={onDelete} t={t} />
        </div>
      </div>

      {/* Main Content Layer (Draggable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => {
          dragX.current = info.offset.x;
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) {
            setIsSwiped(true);
          } else {
            setIsSwiped(false);
          }
        }}
        animate={{ x: isSwiped ? -80 : 0 }}
        className="relative z-10 bg-brand-bg border-b border-brand-border/30 p-4 flex flex-col gap-3 active:bg-brand-elevated/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-brand-elevated border border-brand-border">
              <Activity size={14} className="text-brand-accent" />
            </div>
            <div className="flex flex-col">
              <span className="monospace-data font-bold text-sm tracking-tight">{item.symbol}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono opacity-40 uppercase tracking-tighter">{item.date}</span>
                {item.notes && (
                  <div className="flex items-center gap-1 px-1 py-0.5 rounded bg-brand-accent/10 border border-brand-accent/20">
                    <StickyNote size={10} className="text-brand-accent" />
                    <span className="text-[8px] font-bold text-brand-accent uppercase">Note</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${item.side === 'Long' ? 'bg-trade-long/10 text-trade-long border border-trade-long/20' : 'bg-trade-short/10 text-trade-short border border-trade-short/20'}`}>
              {item.side}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Win' ? 'bg-trade-long' : item.status === 'Loss' ? 'bg-trade-short' : 'bg-status-neutral animate-pulse opacity-40'}`} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] label-caps opacity-40">Entry</span>
            <span className="monospace-data text-[10px]">{item.levels.entry?.toLocaleString() || '---'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] label-caps opacity-40">SL / TP</span>
            <div className="flex flex-col">
              <span className="monospace-data text-[10px] text-trade-long">+{item.levels.takeProfit?.toLocaleString() || '---'}</span>
              <span className="monospace-data text-[10px] text-trade-short">-{item.levels.stopLoss?.toLocaleString() || '---'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[8px] label-caps opacity-40">Result</span>
            {item.status !== 'Pending' ? (
              <span className={`monospace-data text-[10px] font-black ${calculateRMultiple(item) > 0 ? 'text-trade-long' : calculateRMultiple(item) < 0 ? 'text-trade-short' : 'text-brand-text-dim opacity-40'}`}>
                {calculateRMultiple(item) > 0 ? '+' : ''}{calculateRMultiple(item).toFixed(2)}R
              </span>
            ) : (
              <span className="monospace-data text-[10px] opacity-30 italic">ANALYZING...</span>
            )}
          </div>
        </div>

        <div className="rounded border border-brand-border/50 bg-brand-elevated/25 px-2 py-1">
          <span className="text-[8px] label-caps opacity-40">Strategy</span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.strategyColor || 'rgba(148,163,184,.35)' }} />
            <span className="text-[9px] font-black uppercase tracking-tight text-brand-text-bright">
              {item.strategyName || 'Unlinked'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <button 
            onClick={() => onEdit(item)}
            className="flex-1 py-2 bg-brand-elevated border border-brand-border rounded text-[9px] font-bold uppercase tracking-[2px] active:bg-brand-accent active:text-white transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight size={12} className="text-brand-accent" />
            {t.ui.edit_protocol}
          </button>
          <div className="lg:hidden text-[8px] font-mono opacity-20 uppercase flex items-center gap-1">
            <ChevronRight size={10} className="animate-pulse" />
            {t.ui.slide_to_purge}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
