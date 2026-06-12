import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Check, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { TradeStats } from '../types';
import { PerformanceShareCard, FLIPPED_BG_IMAGES } from './PerformanceShareCard';

type AppTheme = 'default' | 'light' | 'tactical' | 'cyber' | 'nexus' | 'claude';

const BG_IMAGES = Array.from({ length: 10 }, (_, i) => `/assets/sharecards/wild${i + 1}.png`);

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TradeStats;
  theme: AppTheme;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose, stats, theme }) => {
  const cardRef      = useRef<HTMLDivElement>(null);
  const previewRef   = useRef<HTMLDivElement>(null);
  const [copied, setCopied]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [previewScale, setScale]    = useState(0.58);
  const [selectedBg, setSelectedBg] = useState<string>(BG_IMAGES[0]);

  useEffect(() => {
    if (!isOpen) return;
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width - 32;
      setScale(Math.min(0.58, w / 1640));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const capture = useCallback(async () => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: null, scale: 2, useCORS: true, logging: false,
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setSaving(true);
    try {
      const c = await capture(); if (!c) return;
      const a = document.createElement('a');
      a.download = `tradevision-${Date.now()}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
    } finally { setSaving(false); }
  }, [capture]);

  const handleCopy = useCallback(async () => {
    try {
      const c = await capture(); if (!c) return;
      c.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch { handleDownload(); }
  }, [capture, handleDownload]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.93, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-card-title"
            className="bg-brand-elevated border border-brand-border rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: 'min(1180px, 96vw)' }}
          >
            {/* ── Modal header ── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Share2 size={13} className="text-brand-accent" />
                <span id="share-card-title" className="text-[11px] font-bold uppercase tracking-widest text-brand-text-bright font-mono">
                  Share Card
                </span>
              </div>
              <button onClick={onClose} aria-label="Close share card"
                className="text-brand-text-dim hover:text-brand-text-bright transition-colors p-1 rounded hover:bg-brand-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent/40">
                <X size={15} />
              </button>
            </div>

            {/* ── Card preview ── */}
            <div ref={previewRef} className="flex justify-center overflow-hidden bg-black/50" style={{ padding: '20px 16px' }}>
              <div style={{ width: Math.round(1640 * previewScale), height: Math.round(922 * previewScale), position: 'relative', flexShrink: 0 }}>
                <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', position: 'absolute', inset: 0 }}>
                  <PerformanceShareCard ref={cardRef} stats={stats} theme={theme} bgImage={selectedBg} flipped={FLIPPED_BG_IMAGES.includes(selectedBg)} />
                </div>
              </div>
            </div>

            {/* ── Background picker ── */}
            <div className="px-5 py-3 border-t border-brand-border/50">
              <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-brand-text-muted font-mono mb-2">
                Background
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                {BG_IMAGES.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setSelectedBg(src)}
                    className="shrink-0 relative overflow-hidden transition-all"
                    style={{
                      width: 88,
                      height: 50,
                      borderRadius: 8,
                      border: selectedBg === src
                        ? '2px solid #FF9100'
                        : '2px solid rgba(255,255,255,0.10)',
                      boxShadow: selectedBg === src
                        ? '0 0 12px rgba(255,145,0,0.50)'
                        : 'none',
                      padding: 0,
                    }}
                    aria-label={`Background ${i + 1}`}
                    aria-pressed={selectedBg === src}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {selectedBg === src && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(255,145,0,0.20)' }}
                      >
                        <div
                          style={{
                            width: 16, height: 16, borderRadius: 999,
                            background: '#FF9100',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Check size={10} color="#000" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    <div
                      className="absolute bottom-1 left-1"
                      style={{
                        fontSize: 8,
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        color: 'rgba(255,255,255,0.70)',
                        lineHeight: 1,
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      }}
                    >
                      {i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="px-5 py-4 border-t border-brand-border flex gap-3">
              <button onClick={handleCopy} disabled={copied}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           text-[10px] font-bold uppercase tracking-widest font-mono transition-all border"
                style={{
                  background:   copied ? 'var(--brand-accent)' : 'transparent',
                  borderColor:  'var(--brand-accent)',
                  color:        copied ? 'var(--brand-bg)' : 'var(--brand-accent)',
                }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'COPIED!' : 'COPY IMAGE'}
              </button>
              <button onClick={handleDownload} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           text-[10px] font-bold uppercase tracking-widest font-mono transition-all"
                style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)', opacity: saving ? 0.7 : 1 }}>
                <Download size={12} />
                {saving ? 'SAVING...' : 'DOWNLOAD PNG'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
