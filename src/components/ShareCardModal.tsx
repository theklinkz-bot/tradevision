import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Check, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { TradeStats, XpState, JobClass } from '../types';
import { JOB_DEFS, JOB_ORDER } from '../services/xpEngine';

// ─── Per-job theme ───────────────────────────────────────────────────────────

interface JobTheme {
  accent: string;       // primary color — branding, XP bar, stat top-border
  tint: string;         // rgba overlay on top of the image (subtle color mood)
  bottomGrad: string;   // bottom gradient — blends image into stats area
  statBg: string;       // stat cell background
  statBorder: string;   // stat cell side/bottom border
}

const THEMES: Record<JobClass, JobTheme> = {
  novice: {
    accent:      '#f5c842',
    tint:        'rgba(160, 90, 0, 0.18)',
    bottomGrad:  'linear-gradient(to top, rgba(40,18,3,0.97) 0%, rgba(40,18,3,0.75) 55%, transparent 100%)',
    statBg:      'rgba(50,25,0,0.75)',
    statBorder:  'rgba(245,200,66,0.25)',
  },
  apprentice: {
    accent:      '#e83800',
    tint:        'rgba(140, 20, 0, 0.22)',
    bottomGrad:  'linear-gradient(to top, rgba(18,4,2,0.97) 0%, rgba(18,4,2,0.75) 55%, transparent 100%)',
    statBg:      'rgba(30,6,2,0.80)',
    statBorder:  'rgba(232,56,0,0.28)',
  },
  scalper: {
    accent:      '#cc0000',
    tint:        'rgba(80, 20, 0, 0.15)',
    bottomGrad:  'linear-gradient(to top, rgba(10,4,2,0.97) 0%, rgba(10,4,2,0.75) 55%, transparent 100%)',
    statBg:      'rgba(15,4,2,0.80)',
    statBorder:  'rgba(200,0,0,0.28)',
  },
  elite: {
    accent:      '#ffd700',
    tint:        'rgba(120, 90, 0, 0.18)',
    bottomGrad:  'linear-gradient(to top, rgba(4,6,20,0.97) 0%, rgba(4,6,20,0.75) 55%, transparent 100%)',
    statBg:      'rgba(6,8,30,0.82)',
    statBorder:  'rgba(255,215,0,0.28)',
  },
  master: {
    accent:      '#00ffcc',
    tint:        'rgba(0, 80, 60, 0.18)',
    bottomGrad:  'linear-gradient(to top, rgba(0,4,10,0.98) 0%, rgba(0,4,10,0.76) 55%, transparent 100%)',
    statBg:      'rgba(0,4,14,0.85)',
    statBorder:  'rgba(0,255,204,0.25)',
  },
};

const JOB_DISPLAY: Record<JobClass, string> = {
  novice:     'NOVICE TRADER',
  apprentice: 'APPRENTICE SCALPER',
  scalper:    'SCALPER',
  elite:      'ELITE SCALPER',
  master:     'MASTER SCALPER',
};

const JOB_FLAVOR: Record<JobClass, { EN: string; TH: string }> = {
  novice:     { EN: 'FARMER OF FIELDS',    TH: 'เกษตรกรแห่งทุ่งนา' },
  apprentice: { EN: 'THE AWAKENED',        TH: 'ผู้ตื่นรู้' },
  scalper:    { EN: 'THE WANDERING BLADE', TH: 'ดาบพเนจร' },
  elite:      { EN: 'HONOR BEFORE ALL',   TH: 'เกียรติยศเหนือสิ่งอื่น' },
  master:     { EN: 'SHADOW OF THE MARKET', TH: 'เงาแห่งตลาด' },
};

// ─── Background options ──────────────────────────────────────────────────────

interface BgOption {
  file: string;
  label: string;
  minJob: JobClass;
}

const BG_OPTIONS: BgOption[] = [
  { file: 'farmer.png',   label: 'Farmer',    minJob: 'novice' },
  { file: 'ashigaru.png', label: 'Ashigaru',  minJob: 'apprentice' },
  { file: 'sohe.png',     label: 'Sōhei',     minJob: 'apprentice' },
  { file: 'ronin.png',    label: 'Ronin',     minJob: 'scalper' },
  { file: 'samurai.png',  label: 'Samurai',   minJob: 'elite' },
  { file: 'samurai2.png', label: 'Samurai II', minJob: 'elite' },
  { file: 'ninja.png',    label: 'Ninja',     minJob: 'master' },
  { file: 'ninja2.png',   label: 'Ninja II',  minJob: 'master' },
];

// Returns all bg options the user has unlocked (current job + all below)
function getAvailableBgs(currentJob: JobClass): BgOption[] {
  const rank = JOB_ORDER.indexOf(currentJob);
  return BG_OPTIONS.filter(bg => JOB_ORDER.indexOf(bg.minJob) <= rank);
}

// Default bg = first option whose minJob matches current job
function getDefaultBg(currentJob: JobClass): string {
  const match = BG_OPTIONS.find(bg => bg.minJob === currentJob);
  return (match ?? BG_OPTIONS[0]).file;
}

// ─── The visual card (captured by html2canvas) ───────────────────────────────

interface CardVisualProps {
  xpState: XpState;
  stats: TradeStats;
  lang: 'EN' | 'TH';
  bgFile: string;
  orientation: 'portrait' | 'landscape';
}

const CARD_DIMS = {
  portrait:  { w: 480, h: 680, titleSize: 42, topGradH: 220, botGradH: 320, statSize: 21, statPad: '8px 10px 20px' },
  landscape: { w: 680, h: 480, titleSize: 34, topGradH: 160, botGradH: 220, statSize: 18, statPad: '7px 9px 19px' },
};

// Draw image onto canvas with cover + objectPosition: center 35%
function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cw = canvas.width, ch = canvas.height;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih);
  const sw = cw / scale, sh = ch / scale;
  const sx = (iw - sw) * 0.5;      // center x
  const sy = (ih - sh) * 0.35;     // 35% from top
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

const JobShareCardVisual = React.forwardRef<HTMLDivElement, CardVisualProps>(
  ({ xpState, stats, lang, bgFile, orientation }, ref) => {
    const job = xpState.currentJob;
    const t = THEMES[job];
    const accent = t.accent;
    const dim = CARD_DIMS[orientation];
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;
      const img = new Image();
      img.onload = () => drawCover(canvas, img);
      img.src = `/assets/sharecard2/${bgFile}`;
    }, [bgFile, dim.w, dim.h]);

    const f1 = (n: number) => isNaN(n) || !isFinite(n) ? '--' : n.toFixed(1);
    const f2 = (n: number) => isNaN(n) || !isFinite(n) ? '--' : n.toFixed(2);

    const curReq = JOB_DEFS[job].xpRequired;
    const nextDef = xpState.nextJob ? JOB_DEFS[xpState.nextJob] : null;
    const xpSpan = nextDef ? nextDef.xpRequired - curReq : 1;
    const xpPct = nextDef ? Math.min(100, Math.max(0, ((xpState.totalXp - curReq) / xpSpan) * 100)) : 100;

    const allStats = [
      { label: lang === 'TH' ? 'วิน เรต' : 'WIN RATE',          value: `${f1(stats.winRate)}%` },
      { label: lang === 'TH' ? 'จำนวนไม้' : 'TRADES',           value: String(stats.totalTrades) },
      { label: lang === 'TH' ? 'สตรีค' : 'STREAK',              value: `🔥 ${xpState.streak}` },
      { label: lang === 'TH' ? 'พอยต์สะสม' : 'XP',             value: xpState.totalXp.toLocaleString() },
      { label: lang === 'TH' ? 'โปรฟิต แฟกเตอร์' : 'PROF. FACTOR', value: f2(stats.profitFactor) },
      { label: lang === 'TH' ? 'ความคาดหวัง' : 'EXPECTANCY',   value: `${f2(stats.expectancy)}R` },
    ];

    // Portrait: 2 rows × 3. Landscape: 1 row × 6.
    const statRows = orientation === 'portrait'
      ? [allStats.slice(0, 3), allStats.slice(3)]
      : [allStats];

    return (
      <div
        ref={ref}
        style={{
          width: dim.w, height: dim.h,
          background: '#000',
          position: 'relative', overflow: 'hidden',
          fontFamily: '"Barlow Condensed", sans-serif',
          userSelect: 'none',
        }}
      >
        {/* Background — canvas pre-drawn with cover math, pixel-perfect for html2canvas */}
        <canvas
          ref={bgCanvasRef}
          width={dim.w}
          height={dim.h}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* Color tint — mood layer per job */}
        <div style={{ position: 'absolute', inset: 0, background: t.tint, pointerEvents: 'none' }} />

        {/* Top dark gradient */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: dim.topGradH,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: dim.botGradH,
          background: t.bottomGrad,
          pointerEvents: 'none',
        }} />

        {/* Top bar — branding */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 10,
        }}>
          <span style={{ color: accent, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase' }}>
            flowtheedge
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '1px' }}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Job title block */}
        <div style={{
          position: 'absolute', top: 44,
          left: orientation === 'landscape' ? 20 : 0,
          right: orientation === 'landscape' ? 20 : 0,
          textAlign: orientation === 'landscape' ? 'left' : 'center',
          padding: orientation === 'portrait' ? '0 20px' : 0,
          zIndex: 10,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: '5px', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace', marginBottom: 5 }}>
            {lang === 'TH' ? 'แรงค์' : 'RANK'}
          </div>
          <div style={{ color: '#ffffff', fontSize: dim.titleSize, fontWeight: 800, letterSpacing: '-0.5px', textTransform: 'uppercase', lineHeight: 1.15, textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
            {JOB_DISPLAY[job]}
          </div>
          <div style={{ color: accent, fontSize: 11, letterSpacing: '4px', marginTop: 5, fontFamily: '"IBM Plex Mono", monospace' }}>
            {lang === 'TH' ? JOB_FLAVOR[job].TH : JOB_FLAVOR[job].EN}
          </div>
        </div>

        {/* Stats panel */}
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 10 }}>
          {/* XP bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: accent, fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '2px', fontWeight: 700 }}>
                {xpState.totalXp.toLocaleString()} XP
              </span>
              {nextDef && (
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: '"IBM Plex Mono", monospace' }}>
                  {xpState.xpToNext.toLocaleString()} to {JOB_DISPLAY[xpState.nextJob!]}
                </span>
              )}
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.12)', borderRadius: 1 }}>
              <div style={{ height: '100%', background: accent, borderRadius: 1, width: `${xpPct}%` }} />
            </div>
          </div>

          {/* Stat grid */}
          {statRows.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 5, marginBottom: ri < statRows.length - 1 ? 5 : 0 }}>
              {row.map(item => (
                <div key={item.label} style={{ background: t.statBg, border: `1px solid ${t.statBorder}`, borderTop: `2px solid ${accent}`, padding: dim.statPad }}>
                  <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 7, letterSpacing: '1.5px', fontFamily: '"IBM Plex Mono", monospace', marginBottom: 3, textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#ffffff', fontSize: dim.statSize, fontWeight: 800, lineHeight: 1 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer URL */}
          <div style={{ marginTop: 7, textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 8, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '1.5px' }}>
              flowtheedge.com
            </span>
          </div>
        </div>
      </div>
    );
  }
);
JobShareCardVisual.displayName = 'JobShareCardVisual';

// ─── Modal wrapper ───────────────────────────────────────────────────────────

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TradeStats;
  xpState?: XpState;
  lang?: 'EN' | 'TH';
  theme?: string; // ignored — kept for backward compat
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen, onClose, stats, xpState, lang = 'EN',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.7);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fallback dummy xpState
  const safeXp: XpState = xpState ?? {
    totalXp: 0, breakdown: { journal: 0, session: 0, achievement: 0 },
    streak: 0, maxStreakEver: 0, freezeConsumed: false,
    currentJob: 'novice', nextJob: 'apprentice', xpToNext: 300,
    eligibleJobChange: null, achievements: [], pendingUnlocks: [],
  };

  const availableBgs = getAvailableBgs(safeXp.currentJob);
  const [selectedBg, setSelectedBg] = useState(() => getDefaultBg(safeXp.currentJob));
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Reset bg + orientation when job changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBg(getDefaultBg(safeXp.currentJob));
      setOrientation('portrait');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, safeXp.currentJob]);

  useEffect(() => {
    if (!isOpen) return;
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width - 40;
      const cardW = CARD_DIMS[orientation].w;
      setPreviewScale(Math.min(0.85, w / cardW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, orientation]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const capture = useCallback(async () => {
    if (!cardRef.current) return null;
    // Wait for web fonts so html2canvas doesn't fall back to a wider default font
    try { await (document as any).fonts?.ready; } catch { /* noop */ }
    // Let the bg <canvas> finish its async drawImage (2 frames)
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const el = cardRef.current;
    const w = el.offsetWidth, h = el.offsetHeight;
    return html2canvas(el, {
      backgroundColor: null, scale: 2, useCORS: true, logging: false,
      width: w, height: h, windowWidth: w, windowHeight: h,
      scrollX: 0, scrollY: 0,
    });
  }, []);

  const handleDownload = useCallback(async () => {
    setSaving(true);
    try {
      const c = await capture(); if (!c) return;
      const a = document.createElement('a');
      a.download = `flowtheedge-${safeXp.currentJob}-${Date.now()}.png`;
      a.href = c.toDataURL('image/png');
      a.click();
    } finally { setSaving(false); }
  }, [capture, safeXp]);

  const handleCopy = useCallback(async () => {
    setCopying(true);
    try {
      const c = await capture(); if (!c) return;
      c.toBlob(async blob => {
        if (!blob) { handleDownload(); return; }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch { handleDownload(); }
      });
    } finally { setCopying(false); }
  }, [capture, handleDownload]);

  const accent = THEMES[safeXp.currentJob].accent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(16px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            role="dialog"
            aria-modal="true"
            className="bg-brand-elevated border border-brand-border rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: 'min(560px, 96vw)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Share2 size={13} className="text-brand-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-text-bright font-mono">
                  Share Card
                </span>
                <span className="text-[9px] text-brand-text-dim font-mono uppercase tracking-wider opacity-60">
                  — {JOB_DISPLAY[safeXp.currentJob]}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-brand-text-dim hover:text-brand-text-bright transition-colors p-1 rounded hover:bg-brand-bg"
              >
                <X size={15} />
              </button>
            </div>

            {/* Preview — scaled for display only (NOT captured) */}
            <div ref={previewRef} className="flex justify-center overflow-hidden bg-black/60 py-5 px-4">
              <div style={{
                width: Math.round(CARD_DIMS[orientation].w * previewScale),
                height: Math.round(CARD_DIMS[orientation].h * previewScale),
                position: 'relative', flexShrink: 0,
              }}>
                <div style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute', top: 0, left: 0,
                }}>
                  <JobShareCardVisual
                    xpState={safeXp}
                    stats={stats}
                    lang={lang}
                    bgFile={selectedBg}
                    orientation={orientation}
                  />
                </div>
              </div>
            </div>

            {/* Hidden full-size clone — THIS is what html2canvas captures.
                No transform / no scale wrapper → pixel-perfect, no drift. */}
            <div style={{ position: 'fixed', top: 0, left: -99999, opacity: 0, pointerEvents: 'none', zIndex: -1 }} aria-hidden>
              <JobShareCardVisual
                ref={cardRef}
                xpState={safeXp}
                stats={stats}
                lang={lang}
                bgFile={selectedBg}
                orientation={orientation}
              />
            </div>

            {/* Controls: orientation toggle + background selector */}
            <div className="px-5 py-3 border-t border-brand-border flex flex-col gap-3">
              {/* Orientation toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest text-brand-text-dim font-mono">Format</span>
                <div className="flex gap-1 ml-2">
                  {(['portrait', 'landscape'] as const).map(o => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className="px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest font-mono transition-all border"
                      style={{
                        background: orientation === o ? accent : 'transparent',
                        borderColor: accent,
                        color: orientation === o ? '#000' : accent,
                      }}
                    >
                      {o === 'portrait' ? '↕ Portrait' : '↔ Landscape'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background selector */}
              {availableBgs.length > 1 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-text-dim font-mono mb-2">Background</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableBgs.map(bg => (
                    <button
                      key={bg.file}
                      onClick={() => setSelectedBg(bg.file)}
                      title={bg.label}
                      style={{
                        flexShrink: 0,
                        width: 56, height: 40,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: selectedBg === bg.file ? `2px solid ${accent}` : '2px solid transparent',
                        padding: 0,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <img
                        src={`/assets/sharecard2/${bg.file}`}
                        alt={bg.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-brand-border flex gap-3">
              <button
                onClick={handleCopy}
                disabled={copying || copied}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono transition-all border"
                style={{
                  background: copied ? accent : 'transparent',
                  borderColor: accent,
                  color: copied ? '#000' : accent,
                  opacity: copying ? 0.6 : 1,
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'COPIED!' : copying ? 'COPYING...' : 'COPY IMAGE'}
              </button>
              <button
                onClick={handleDownload}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono transition-all"
                style={{ background: accent, color: '#000', opacity: saving ? 0.7 : 1 }}
              >
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
