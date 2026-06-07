import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Plus,
  Palette
} from 'lucide-react';
import { Strategy } from '../types';

interface StrategyManagerProps {
  strategies: Strategy[];
  onAdd: (name: string, color: string) => Promise<Strategy>;
  onUpdate: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STRATEGY_COLORS = [
  '#D97757', // Claude terracotta
  '#E8A850', // Warm amber
  '#5FAD7A', // Muted sage
  '#C4824A', // Burnt sienna
  '#E05C5C', // Warm red
  '#9B7FD4'  // Muted violet
];

export const StrategyManager = ({ strategies, onAdd, onUpdate, onDelete }: StrategyManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(STRATEGY_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await onAdd(name.trim(), color);
      setName('');
      setIsAdding(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await onUpdate(id, name.trim(), color);
      setEditingId(null);
      setName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update strategy');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (s: Strategy) => {
    setEditingId(s.id);
    setName(s.name);
    setColor(s.color);
  };

  return (
    <div className="technical-panel p-4 flex flex-col gap-4 bg-brand-elevated/20 border-brand-border/40">
      {error && (
        <p className="text-[9px] text-brand-danger font-mono uppercase px-1">{error}</p>
      )}
      <div className="flex items-center justify-between border-b border-brand-border/20 pb-3">
        <h3 className="label-caps !mb-0 flex items-center text-brand-text-dim text-[10px]">
          <Zap size={14} className="mr-2 text-brand-accent opacity-50" />
          Strategy Manager
        </h3>
        <button 
          onClick={() => {
            setIsAdding(true);
            setName('');
            setColor(STRATEGY_COLORS[0]);
          }}
          className="text-[9px] font-mono text-brand-accent hover:underline flex items-center gap-1 uppercase"
        >
          <Plus size={10} /> Add New
        </button>
      </div>

      <div className="space-y-2">
        {isAdding && (
          <div className="p-3 bg-brand-bg border border-brand-accent/30 rounded flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
            <input 
              autoFocus
              className="w-full bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs focus:border-brand-accent outline-none"
              placeholder="Strategy Name..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {STRATEGY_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full border border-white/10 transition-transform ${color === c ? 'scale-125 border-white' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-1 px-2 text-[8px] font-bold uppercase text-brand-text-dim hover:text-brand-text-bright"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={isLoading || !name}
                  className="p-1 px-3 bg-brand-accent text-white rounded text-[8px] font-bold uppercase disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {strategies.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2.5 bg-brand-text-bright/[0.02] border border-brand-border/10 rounded group hover:border-brand-border/30 transition-all">
            {editingId === s.id ? (
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  autoFocus
                  className="w-full bg-brand-bg border border-brand-accent/50 p-1.5 monospace-data rounded text-xs outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {STRATEGY_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-3.5 h-3.5 rounded-full border border-white/10 transition-transform ${color === c ? 'scale-125 border-white' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(null)} className="p-1 text-trade-short"><X size={14} /></button>
                    <button onClick={() => handleUpdate(s.id)} className="p-1 text-trade-long"><Check size={14} /></button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-text-bright/90">{s.name}</span>
                    <span className="text-[8px] font-mono opacity-30 uppercase tracking-widest">{s.tradeCount || 0} Trades</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(s)}
                    className="p-1.5 text-brand-text-dim hover:text-brand-accent transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => window.confirm('Delete strategy? Associated trades will be unlinked.') && onDelete(s.id)}
                    className="p-1.5 text-brand-text-dim hover:text-trade-short transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isAdding && strategies.length === 0 && (
          <p className="text-[9px] text-center font-mono opacity-20 py-4 uppercase">No custom strategies mapped</p>
        )}
      </div>
    </div>
  );
};
