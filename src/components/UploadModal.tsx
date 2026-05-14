import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ShieldCheck, 
  Zap, 
  X, 
  AlertTriangle, 
  Search, 
  CheckCircle2,
  Activity,
  Plus,
  Palette,
  Check
} from 'lucide-react';
import { AnalysisHistoryItem, TradeStatus, Strategy, TranslationSchema } from '../types';

interface SignalValidationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisHistoryItem | null;
  onConfirm: () => void;
  onDataChange: (data: AnalysisHistoryItem) => void;
  recentSymbols: string[];
  strategies: Strategy[];
  onAddStrategy: (name: string, color: string) => Promise<Strategy>;
  t: TranslationSchema;
}

const STRATEGY_COLORS = [
  '#6366f1', // Indigo
  '#22d3ee', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#a855f7'  // Purple
];

export const SignalValidationOverlay = ({ 
  isOpen, 
  onClose, 
  data, 
  onConfirm, 
  onDataChange,
  recentSymbols,
  strategies,
  onAddStrategy,
  t
}: SignalValidationOverlayProps) => {
  const [isAddingStrategy, setIsAddingStrategy] = React.useState(false);
  const [newStrategyName, setNewStrategyName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(STRATEGY_COLORS[0]);
  const [isSavingStrategy, setIsSavingStrategy] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleAddStrategy = async () => {
    if (!newStrategyName.trim()) return;
    setIsSavingStrategy(true);
    try {
      const newStrategy = await onAddStrategy(newStrategyName.trim(), selectedColor);
      onDataChange({
        ...data,
        strategyId: newStrategy.id,
        strategyName: newStrategy.name,
        strategyColor: newStrategy.color
      });
      setNewStrategyName('');
      setIsAddingStrategy(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStrategy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-bg/90 backdrop-blur-xl"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="technical-panel w-full max-w-5xl bg-brand-elevated relative z-10 border-brand-accent/30 shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* Left: Visual Evidence (Screenshot) */}
          <div className="md:w-1/2 p-6 bg-black/40 flex flex-col gap-4 border-r border-brand-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-brand-accent" />
                <span className="label-caps mb-0 text-[10px]">{t.ui.neural_visual_input}</span>
              </div>
              <span className="text-[9px] font-mono opacity-40">FRAME_READY // LATENCY_LOW</span>
            </div>
            <div className="relative flex-1 bg-brand-bg rounded border border-brand-border/50 overflow-hidden group">
              <img 
                src={data.imageUrl} 
                alt="Scan Evidence" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 border-[20px] border-black/5 pointer-events-none" />
            </div>
            <div className="p-3 bg-brand-accent/5 border border-brand-accent/10 rounded flex items-start gap-3">
              <ShieldCheck size={14} className="text-brand-accent shrink-0 mt-0.5" />
              <p className="text-[9px] text-brand-text-dim uppercase leading-relaxed tracking-wider">
                {t.ui.validate_levels_desc}
              </p>
            </div>
          </div>

          {/* Right: Detected Signal Data */}
          <div className="md:w-1/2 p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h3 className="label-caps mb-0 text-brand-text-bright flex items-center gap-2">
                  <Zap size={16} className="text-brand-accent" />
                  {t.ui.signal_validation_protocol}
                </h3>
                <p className="text-[9px] text-brand-text-dim uppercase tracking-[2px] mt-1">{t.ui.manual_calibration}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-brand-text-dim hover:text-brand-text-bright transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="label-caps text-[10px]">{t.ui.pair_ticker}</label>
                  {data.symbol && !recentSymbols.includes(data.symbol.toUpperCase()) && (
                    <div className="flex items-center gap-1 text-[9px] text-brand-warning font-bold uppercase tracking-tighter">
                      <AlertTriangle size={10} />
                      <span>New / Custom Pair</span>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    list="symbols-list"
                    className={`w-full bg-brand-bg border p-3 monospace-data rounded text-sm transition-all outline-none ${
                      data.symbol && !recentSymbols.includes(data.symbol.toUpperCase()) 
                        ? 'border-brand-warning/50 focus:border-brand-warning shadow-lg shadow-brand-warning/10' 
                        : 'border-brand-border focus:border-brand-accent'
                    }`}
                    placeholder="e.g. XAUUSD"
                    value={data.symbol}
                    onChange={e => onDataChange({...data, symbol: e.target.value.toUpperCase()})}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <Search size={14} />
                  </div>
                </div>
                {data.symbol && !recentSymbols.includes(data.symbol.toUpperCase()) && (
                  <p className="text-[8px] text-brand-warning/70 font-mono uppercase mt-1 leading-tight">
                    Symbol not detected in recent history. Manual overwrite accepted.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label-caps text-[10px]">{t.ui.bias_direction}</label>
                <select 
                  className="bg-brand-bg border border-brand-border p-3 monospace-data rounded text-sm focus:border-brand-accent transition-colors outline-none"
                  value={data.side}
                  onChange={e => onDataChange({...data, side: e.target.value as any})}
                >
                  <option value="Long">LONG</option>
                  <option value="Short">SHORT</option>
                  <option value="Neutral">NEUTRAL</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="label-caps text-[10px] flex justify-between items-center">
                  {t.ui.strategy_mapping}
                  <button 
                    onClick={() => setIsAddingStrategy(!isAddingStrategy)}
                    className="text-[9px] text-brand-accent hover:underline flex items-center gap-1 normal-case"
                  >
                    <Plus size={10} /> {t.ui.new_strategy}
                  </button>
                </label>
                
                {isAddingStrategy ? (
                  <div className="p-3 bg-brand-bg border border-brand-accent/30 rounded-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        className="flex-1 bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs focus:border-brand-accent outline-none"
                        placeholder="Strategy Name..."
                        value={newStrategyName}
                        onChange={e => setNewStrategyName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddStrategy()}
                      />
                      <button 
                        disabled={isSavingStrategy || !newStrategyName}
                        onClick={handleAddStrategy}
                        className="px-3 bg-brand-accent text-white rounded text-[10px] font-bold uppercase disabled:opacity-50"
                      >
                        {isSavingStrategy ? '...' : t.ui.save}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette size={10} className="text-brand-text-dim" />
                      <div className="flex gap-1.5">
                        {STRATEGY_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`w-4 h-4 rounded-full border border-white/20 transition-transform ${selectedColor === c ? 'scale-125 border-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                    {strategies.length > 0 ? (
                      strategies.map(s => (
                        <button
                          key={s.id}
                          onClick={() => onDataChange({
                            ...data, 
                            strategyId: data.strategyId === s.id ? undefined : s.id,
                            strategyName: data.strategyId === s.id ? undefined : s.name,
                            strategyColor: data.strategyId === s.id ? undefined : s.color
                          })}
                          className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2
                            ${data.strategyId === s.id 
                              ? 'border-transparent text-white shadow-lg' 
                              : 'bg-brand-bg border-brand-border text-brand-text-dim hover:border-brand-text-bright'}`}
                          style={{ backgroundColor: data.strategyId === s.id ? s.color : 'transparent', borderColor: data.strategyId === s.id ? 'transparent' : undefined }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                          {data.strategyId === s.id && <Check size={10} />}
                        </button>
                      ))
                    ) : (
                      <div className="w-full p-4 border border-dashed border-brand-border/40 rounded flex flex-col items-center justify-center gap-2 opacity-40">
                         <Zap size={16} />
                         <span className="text-[9px] font-mono uppercase">{t.ui.no_strategies}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 col-span-2 mt-2">
                <label className="label-caps text-[10px] block opacity-50">{t.ui.execution_levels}</label>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-brand-accent uppercase">{t.ui.entry_matrix}</span>
                    <span className="text-[10px] text-brand-text-dim">VALUE</span>
                  </div>
                  <input 
                    type="number"
                    step="any"
                    className="bg-brand-bg border border-brand-border p-4 monospace-data rounded text-base font-bold focus:border-brand-accent transition-colors outline-none"
                    value={data.levels.entry || ''}
                    onChange={e => onDataChange({...data, levels: {...data.levels, entry: parseFloat(e.target.value)}})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-trade-long uppercase leading-none">{t.ui.profit_goal}</span>
                    <input 
                      type="number"
                      step="any"
                      className="bg-brand-bg border border-brand-border p-3 monospace-data rounded text-sm font-bold focus:border-trade-long/50 transition-colors outline-none"
                      value={data.levels.takeProfit || ''}
                      onChange={e => onDataChange({...data, levels: {...data.levels, takeProfit: parseFloat(e.target.value)}})}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-trade-short uppercase leading-none">{t.ui.risk_threshold}</span>
                    <input 
                      type="number"
                      step="any"
                      className="bg-brand-bg border border-brand-border p-3 monospace-data rounded text-sm font-bold focus:border-trade-short/50 transition-colors outline-none"
                      value={data.levels.stopLoss || ''}
                      onChange={e => onDataChange({...data, levels: {...data.levels, stopLoss: parseFloat(e.target.value)}})}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="label-caps text-[10px]">{t.ui.signal_outcome}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Win', 'Loss', 'BE', 'Pending'] as TradeStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => onDataChange({...data, status})}
                      className={`py-2 text-[10px] font-bold rounded border transition-all uppercase tracking-widest
                        ${data.status === status 
                          ? (status === 'Win' ? 'bg-trade-long border-trade-long text-white shadow-lg shadow-trade-long/20' : 
                             status === 'Loss' ? 'bg-trade-short border-trade-short text-white shadow-lg shadow-trade-short/20' : 
                             status === 'BE' ? 'bg-brand-text-bright border-brand-text-bright text-black' :
                             'bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/20')
                          : 'bg-brand-bg border-brand-border text-brand-text-dim hover:border-brand-text-bright'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <button 
                onClick={onConfirm}
                className="w-full py-5 bg-brand-accent text-white font-bold uppercase tracking-[4px] text-[11px] rounded hover:opacity-90 transition-all shadow-xl shadow-brand-accent/30 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <CheckCircle2 size={16} />
                {t.ui.authorize_save}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-brand-text-dim hover:text-brand-text-bright font-bold uppercase tracking-widest text-[9px] transition-colors flex items-center justify-center gap-2"
              >
                {t.ui.abort_interface}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface ExpandedImageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema;
}

export const ExpandedImageOverlay = ({ isOpen, onClose, t }: ExpandedImageOverlayProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-6xl shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-[#0d1117]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all border border-white/20"
          >
            <X size={24} />
          </button>
          
          <div className="w-full aspect-video p-12">
             <svg viewBox="0 0 400 225" className="w-full h-full">
                {/* Grid Lines */}
                <g stroke="#ffffff10" strokeWidth="0.5">
                  {[...Array(20)].map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={i * 11.25} x2="400" y2={i * 11.25} />
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="225" />
                  ))}
                </g>

                {/* SL Region */}
                <rect x="180" y="20" width="180" height="60" fill="#ef4444" fillOpacity="0.1" />
                {/* TP Region */}
                <rect x="180" y="140" width="180" height="60" fill="#10b981" fillOpacity="0.1" />

                {/* Entry/Current Region */}
                <rect x="180" y="80" width="180" height="60" fill="#ffffff" fillOpacity="0.05" />

                {/* SL Line */}
                <g>
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
                  <rect x="360" y="10" width="35" height="15" rx="2" fill="#ef4444" />
                  <text x="377.5" y="21" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">74.550 (SL)</text>
                </g>

                {/* Entry Line */}
                <g>
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="350" y="72" width="45" height="15" rx="2" fill="#94a3b8" />
                  <text x="372.5" y="83" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">74.200 (ENTRY)</text>
                </g>

                {/* TP Line */}
                <g>
                  <line x1="0" y1="205" x2="400" y2="205" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" />
                  <rect x="360" y="195" width="35" height="15" rx="2" fill="#10b981" />
                  <text x="377.5" y="206" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">73.800 (TP)</text>
                </g>

                {/* Indicators */}
                <g fill="#94a3b8" fontSize="6" fontWeight="bold">
                   <text x="10" y="15">MGC1! - 5m - COMEX</text>
                   <text x="10" y="25" fillOpacity="0.6">O: 74.215 H: 74.250 L: 74.200 C: 74.225</text>
                </g>
             </svg>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-bold uppercase tracking-[4px]">
            {t.ui.extraction_protocol_desc}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
