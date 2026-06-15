import React, { useState } from 'react';
import { Flame, Lock, Check, Sparkles, ChevronRight, X, Share2 } from 'lucide-react';
import { XpState, JobClass, AchievementCode, SessionNote } from '../../types';
import { JOB_ORDER, JOB_DEFS } from '../../services/xpEngine';

type Lang = 'EN' | 'TH';

// ─── Display metadata ───────────────────────────────────────────────────────

const JOB_NAME: Record<JobClass, Record<Lang, string>> = {
  novice:     { EN: 'Novice Trader',     TH: 'เทรดเดอร์มือใหม่' },
  apprentice: { EN: 'Apprentice Scalper', TH: 'Apprentice Scalper' },
  scalper:    { EN: 'Scalper',           TH: 'Scalper' },
  elite:      { EN: 'Elite Scalper',     TH: 'Elite Scalper' },
  master:     { EN: 'Master Scalper',    TH: 'Master Scalper' },
};

const ACH_META: Record<AchievementCode, { icon: string; name: Record<Lang, string>; desc: Record<Lang, string> }> = {
  first_step:       { icon: '📔', name: { EN: 'First Step', TH: 'ก้าวแรก' }, desc: { EN: 'Write your first journal', TH: 'เขียน Journal ครั้งแรก' } },
  ignition:         { icon: '🔥', name: { EN: 'Ignition', TH: 'Ignition' }, desc: { EN: '7-day streak', TH: 'Streak 7 วัน' } },
  month_warrior:    { icon: '📅', name: { EN: 'Month Warrior', TH: 'Month Warrior' }, desc: { EN: '30-day streak', TH: 'Streak 30 วัน' } },
  centurion:        { icon: '💯', name: { EN: 'Centurion', TH: 'Centurion' }, desc: { EN: '100-day streak', TH: 'Streak 100 วัน' } },
  obsessive_logger: { icon: '📖', name: { EN: 'Obsessive Logger', TH: 'Obsessive Logger' }, desc: { EN: '100 live journals', TH: 'Journal ครบ 100 ไม้' } },
  the_chronicler:   { icon: '📚', name: { EN: 'The Chronicler', TH: 'The Chronicler' }, desc: { EN: '500 live journals', TH: 'Journal ครบ 500 ไม้' } },
  ghost_protocol:   { icon: '👻', name: { EN: 'Ghost Protocol', TH: 'Ghost Protocol' }, desc: { EN: 'Log a trade 02:00–04:00', TH: 'Log ตอนตี 2–4' } },
  born_again:       { icon: '♻️', name: { EN: 'Born Again', TH: 'Born Again' }, desc: { EN: 'Rebuild a broken streak to 30', TH: 'Streak หักแล้วกลับมา 30' } },
};

const COPY = {
  level: { EN: 'Rank', TH: 'แรงค์' },
  xp: { EN: 'XP', TH: 'XP' },
  streak: { EN: 'Day Streak', TH: 'สตรีค' },
  toNext: { EN: 'to next rank', TH: 'สู่แรงค์ถัดไป' },
  maxed: { EN: 'Max rank reached', TH: 'แรงค์สูงสุดแล้ว' },
  jobTree: { EN: 'Job Path', TH: 'เส้นทางอาชีพ' },
  achievements: { EN: 'Achievements', TH: 'ความสำเร็จ' },
  changeJob: { EN: 'Change Job', TH: 'เปลี่ยนอาชีพ' },
  locked: { EN: 'Locked', TH: 'ล็อก' },
  current: { EN: 'Current', TH: 'ปัจจุบัน' },
  sessionNotes: { EN: 'Session Journal', TH: 'บันทึกเซสชัน' },
  preSession: { EN: 'Pre-session Plan (+5 XP)', TH: 'แผนก่อนเทรด (+5 XP)' },
  postSession: { EN: 'Post-session Review (+5 XP)', TH: 'รีวิวหลังเทรด (+5 XP)' },
  save: { EN: 'Save', TH: 'บันทึก' },
  saved: { EN: 'Saved ✓', TH: 'บันทึกแล้ว ✓' },
  freezeUsed: { EN: '🧊 Streak freeze active', TH: '🧊 ใช้ freeze แล้ว' },
  congrats: { EN: 'RANK UP!', TH: 'เลื่อนแรงค์!' },
  confirm: { EN: 'Confirm', TH: 'ยืนยัน' },
  cancel: { EN: 'Cancel', TH: 'ยกเลิก' },
};

// ─── Dashboard mini XP bar ──────────────────────────────────────────────────

export function XpBar({ xp, lang, onClick }: { xp: XpState; lang: Lang; onClick?: () => void }) {
  const nextDef = xp.nextJob ? JOB_DEFS[xp.nextJob] : null;
  const curReq = JOB_DEFS[xp.currentJob].xpRequired;
  const span = nextDef ? nextDef.xpRequired - curReq : 1;
  const pct = nextDef ? Math.min(100, Math.max(0, ((xp.totalXp - curReq) / span) * 100)) : 100;

  return (
    <button
      onClick={onClick}
      className="technical-panel w-full p-3 flex items-center gap-4 hover:border-brand-accent/40 transition-colors text-left group"
    >
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex flex-col leading-none">
          <span className="text-[9px] uppercase tracking-widest text-brand-text-dim font-bold">{COPY.level[lang]}</span>
          <span className="text-xs font-bold text-brand-text-bright uppercase tracking-tight">{JOB_NAME[xp.currentJob][lang]}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="monospace-data text-[10px] text-brand-accent">{xp.totalXp.toLocaleString()} XP</span>
          {nextDef && (
            <span className="text-[9px] text-brand-text-dim uppercase tracking-wider font-mono">
              {xp.xpToNext.toLocaleString()} {COPY.toNext[lang]}
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-brand-border/40 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-accent to-trade-long transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Flame size={16} className={xp.streak > 0 ? 'text-brand-warning' : 'text-brand-text-dim/40'} />
        <span className="monospace-data text-sm font-bold text-brand-text-bright">{xp.streak}</span>
      </div>

      {xp.eligibleJobChange && (
        <span className="shrink-0 px-2 py-1 rounded-full bg-brand-accent/20 text-brand-accent text-[8px] font-bold uppercase tracking-widest animate-pulse">
          {COPY.changeJob[lang]}
        </span>
      )}
    </button>
  );
}

// ─── Job change celebration modal ───────────────────────────────────────────

export function JobChangeModal({ job, lang, onClose }: { job: JobClass; lang: Lang; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="technical-panel relative p-12 text-center max-w-md mx-4 border-brand-accent/50 animate-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-text-dim hover:text-brand-text-bright"><X size={18} /></button>
        <Sparkles size={48} className="text-brand-accent mx-auto mb-4 animate-pulse" />
        <p className="text-[10px] uppercase tracking-[6px] text-brand-accent font-bold mb-2">{COPY.congrats[lang]}</p>
        <h2 className="text-3xl font-bold text-brand-text-bright uppercase tracking-tight mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          {JOB_NAME[job][lang]}
        </h2>
        <p className="text-xs text-brand-text-dim font-mono uppercase tracking-widest">{JOB_DEFS[job].xpRequired.toLocaleString()} XP</p>
      </div>
    </div>
  );
}

// ─── Full Progress tab ──────────────────────────────────────────────────────

interface ProgressViewProps {
  xp: XpState;
  lang: Lang;
  todayKey: string;
  sessionNotes: SessionNote[];
  onChangeJob: (job: JobClass) => void;
  onSaveSessionNote: (kind: 'pre' | 'post', body: string) => Promise<void> | void;
  onShare?: () => void;
}

export default function ProgressView({ xp, lang, todayKey, sessionNotes, onChangeJob, onSaveSessionNote, onShare }: ProgressViewProps) {
  const currentIdx = JOB_ORDER.indexOf(xp.currentJob);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-brand-border pb-4 flex-wrap gap-4">
        {/* Left: title */}
        <div className="flex items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">{JOB_NAME[xp.currentJob][lang]}</h2>
            <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">
              {xp.totalXp.toLocaleString()} {COPY.xp[lang]} · {xp.nextJob ? `${xp.xpToNext.toLocaleString()} ${COPY.toNext[lang]}` : COPY.maxed[lang]}
            </p>
          </div>
        </div>

        {/* Right: streak + share */}
        <div className="flex items-center gap-3">
          {xp.freezeConsumed && xp.streak > 0 && (
            <span className="text-[10px] text-brand-text-dim uppercase tracking-wider font-mono">{COPY.freezeUsed[lang]}</span>
          )}
          <div className="flex items-center gap-2 technical-panel px-4 py-2">
            <Flame size={20} className={xp.streak > 0 ? 'text-brand-warning' : 'text-brand-text-dim/40'} />
            <div className="flex flex-col leading-none">
              <span className="monospace-data text-lg font-bold text-brand-text-bright">{xp.streak}</span>
              <span className="text-[8px] uppercase tracking-widest text-brand-text-dim">{COPY.streak[lang]}</span>
            </div>
          </div>
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-accent/40 text-brand-accent hover:bg-brand-accent/10 transition-all text-[10px] font-bold uppercase tracking-widest font-mono"
            >
              <Share2 size={12} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Job path */}
      <section>
        <span className="label-caps text-[10px]">{COPY.jobTree[lang]}</span>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mt-3">
          {JOB_ORDER.map((job, i) => {
            const isCurrent = job === xp.currentJob;
            const isPast = i < currentIdx;
            const isEligible = job === xp.eligibleJobChange;
            const def = JOB_DEFS[job];
            return (
              <React.Fragment key={job}>
                {i > 0 && <ChevronRight size={14} className="text-brand-border shrink-0" />}
                <div
                  className={`shrink-0 technical-panel px-4 py-3 min-w-[130px] text-center transition-all ${
                    isCurrent ? 'border-brand-accent bg-brand-accent/10' :
                    isEligible ? 'border-brand-accent/60 animate-pulse' :
                    isPast ? 'opacity-70' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {isPast && <Check size={12} className="text-trade-long" />}
                    {!isPast && !isCurrent && !isEligible && <Lock size={11} className="text-brand-text-dim" />}
                    <span className="text-[11px] font-bold uppercase tracking-tight text-brand-text-bright">{JOB_NAME[job][lang]}</span>
                  </div>
                  <span className="monospace-data text-[9px] text-brand-text-dim">{def.xpRequired.toLocaleString()} XP</span>
                  {isCurrent && <p className="text-[8px] uppercase tracking-widest text-brand-accent font-bold mt-1">{COPY.current[lang]}</p>}
                  {isEligible && (
                    <button
                      onClick={() => onChangeJob(job)}
                      className="mt-2 w-full px-2 py-1 bg-brand-accent text-white text-[8px] font-bold uppercase tracking-widest rounded hover:opacity-80 transition"
                    >
                      {COPY.changeJob[lang]}
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <span className="label-caps text-[10px]">{COPY.achievements[lang]}</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {xp.achievements.map(a => {
            const meta = ACH_META[a.code];
            const concealed = a.hidden && !a.unlocked;
            return (
              <div
                key={a.code}
                className={`technical-panel p-4 flex flex-col items-center text-center gap-1 transition-all ${
                  a.unlocked ? 'border-brand-accent/40 bg-brand-accent/5' : 'opacity-50'
                }`}
              >
                <span className="text-2xl mb-1">{concealed ? '❓' : meta.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-tight text-brand-text-bright">
                  {concealed ? '???' : meta.name[lang]}
                </span>
                <span className="text-[9px] text-brand-text-dim leading-tight">
                  {concealed ? '???' : meta.desc[lang]}
                </span>
                <span className="monospace-data text-[9px] text-brand-accent mt-1">+{a.xp} XP</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Session notes */}
      <section>
        <span className="label-caps text-[10px]">{COPY.sessionNotes[lang]}</span>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <SessionNoteEditor
            kind="pre" label={COPY.preSession[lang]} lang={lang}
            initial={sessionNotes.find(n => n.kind === 'pre' && n.sessionDate === todayKey)?.body || ''}
            onSave={body => onSaveSessionNote('pre', body)}
          />
          <SessionNoteEditor
            kind="post" label={COPY.postSession[lang]} lang={lang}
            initial={sessionNotes.find(n => n.kind === 'post' && n.sessionDate === todayKey)?.body || ''}
            onSave={body => onSaveSessionNote('post', body)}
          />
        </div>
      </section>
    </div>
  );
}

function SessionNoteEditor({ label, lang, initial, onSave }: {
  kind: 'pre' | 'post'; label: string; lang: Lang; initial: string;
  onSave: (body: string) => Promise<void> | void;
}) {
  const [body, setBody] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Re-sync when the persisted note for the day loads/changes.
  React.useEffect(() => { setBody(initial); }, [initial]);

  const handleSave = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await onSave(body.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="technical-panel p-4 flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-bright">{label}</span>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        className="bg-brand-bg/50 border border-brand-border rounded p-2 text-xs text-brand-text-bright resize-none focus:border-brand-accent outline-none"
      />
      <button
        onClick={handleSave}
        disabled={!body.trim() || busy}
        className="self-end px-4 py-1.5 bg-brand-accent/80 text-white text-[9px] font-bold uppercase tracking-widest rounded hover:bg-brand-accent disabled:opacity-30 transition"
      >
        {saved ? COPY.saved[lang] : COPY.save[lang]}
      </button>
    </div>
  );
}
