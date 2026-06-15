import { supabase, isSupabaseConfigured } from './supabase';
import {
  ProgressionState,
  AchievementUnlock,
  AchievementCode,
  JobClass,
  SessionNote,
} from '../types';
import { ACHIEVEMENT_DEFS } from '../services/xpEngine';

// Persistence for the non-derivable XP overlay (see xpEngine.ts for the derived
// state). Every call is guarded by isSupabaseConfigured and degrades to a no-op
// so the app keeps working offline / in demo mode.

const DEFAULT_PROGRESSION: ProgressionState = { currentJob: 'novice', freezeUsedMonth: null };

export async function fetchProgression(userId: string): Promise<ProgressionState> {
  if (!isSupabaseConfigured || !userId) return { ...DEFAULT_PROGRESSION };

  const { data, error } = await supabase
    .from('user_progression')
    .select('current_job, freeze_used_month')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // Table missing / schema cache → treat as fresh user, don't crash UI.
    if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('schema cache')) {
      return { ...DEFAULT_PROGRESSION };
    }
    console.warn('fetchProgression error:', error.message);
    return { ...DEFAULT_PROGRESSION };
  }

  if (!data) return { ...DEFAULT_PROGRESSION };
  return {
    currentJob: (data.current_job as JobClass) || 'novice',
    freezeUsedMonth: data.freeze_used_month ?? null,
  };
}

export async function fetchAchievementUnlocks(userId: string): Promise<AchievementUnlock[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase
    .from('achievement_unlocks')
    .select('achievement_code, unlocked_at, xp_granted')
    .eq('user_id', userId);

  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('schema cache')) {
      return [];
    }
    console.warn('fetchAchievementUnlocks error:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    code: row.achievement_code as AchievementCode,
    unlockedAt: row.unlocked_at,
    xpGranted: row.xp_granted,
  }));
}

// Persist newly-qualified achievements. XP is latched here from the static defs
// so it can never be retro-revoked by later trade edits. Idempotent via the
// (user_id, achievement_code) unique constraint.
export async function persistUnlocks(userId: string, codes: AchievementCode[]): Promise<void> {
  if (!isSupabaseConfigured || !userId || codes.length === 0) return;

  const rows = codes.map(code => ({
    user_id: userId,
    achievement_code: code,
    xp_granted: ACHIEVEMENT_DEFS[code].xp,
  }));

  const { error } = await supabase
    .from('achievement_unlocks')
    .upsert(rows, { onConflict: 'user_id,achievement_code', ignoreDuplicates: true });

  if (error) console.warn('persistUnlocks error:', error.message);
}

// User-initiated job change (RO-style). Caller has already verified eligibility.
export async function saveJobChange(userId: string, job: JobClass): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  const { error } = await supabase
    .from('user_progression')
    .upsert({ user_id: userId, current_job: job, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) console.warn('saveJobChange error:', error.message);
}

// Record that this month's streak freeze was auto-consumed.
export async function markFreezeUsed(userId: string, month: string): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  const { error } = await supabase
    .from('user_progression')
    .upsert({ user_id: userId, freeze_used_month: month, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) console.warn('markFreezeUsed error:', error.message);
}

// ─── Session notes ──────────────────────────────────────────────────────────

export async function fetchSessionNotes(userId: string): Promise<SessionNote[]> {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase
    .from('session_notes')
    .select('id, kind, session_date, body, created_at')
    .eq('user_id', userId)
    .order('session_date', { ascending: false });

  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('schema cache')) {
      return [];
    }
    console.warn('fetchSessionNotes error:', error.message);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    kind: row.kind as 'pre' | 'post',
    sessionDate: row.session_date,
    body: row.body,
    createdAt: row.created_at,
  }));
}

// Upsert one pre/post note for a day. Unique (user_id, kind, session_date)
// prevents XP farming via repeated notes.
export async function saveSessionNote(
  userId: string,
  kind: 'pre' | 'post',
  sessionDate: string,
  body: string,
): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;

  const { error } = await supabase
    .from('session_notes')
    .upsert(
      { user_id: userId, kind, session_date: sessionDate, body },
      { onConflict: 'user_id,kind,session_date' },
    );

  if (error) console.warn('saveSessionNote error:', error.message);
}
