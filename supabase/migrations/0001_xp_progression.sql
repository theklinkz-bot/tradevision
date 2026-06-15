-- XP & Trader Progression System
-- Branch: feature/xp-progression
--
-- Design: XP / streak / job-eligibility are DERIVED client-side from the `trades`
-- table (see src/services/xpEngine.ts). These tables persist ONLY the stateful
-- facts that cannot be derived:
--   * user_progression.current_job   -> user-initiated, latched (never demotes)
--   * user_progression.freeze_used_month -> auto-consumed streak freeze, 1/month
--   * achievement_unlocks            -> permanent badge + the XP granted at unlock
--   * session_notes                  -> pre/post-session journal entries (+5 XP each)
--
-- All tables RLS-scoped to auth.uid(), matching the existing `trades` policy.

-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_progression (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  current_job        text not null default 'novice',
  -- 'YYYY-MM' (GMT+7) of the month the single monthly streak-freeze was consumed.
  -- null = freeze available this month.
  freeze_used_month  text,
  updated_at         timestamptz not null default now()
);

alter table public.user_progression enable row level security;

create policy "progression_select_own" on public.user_progression
  for select using (auth.uid() = user_id);
create policy "progression_insert_own" on public.user_progression
  for insert with check (auth.uid() = user_id);
create policy "progression_update_own" on public.user_progression
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.achievement_unlocks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  achievement_code  text not null,
  unlocked_at       timestamptz not null default now(),
  -- XP granted at unlock time. Latched: never recomputed, so editing/deleting a
  -- trade can never retro-revoke an earned badge's XP.
  xp_granted        integer not null default 0,
  unique (user_id, achievement_code)
);

alter table public.achievement_unlocks enable row level security;

create policy "achievements_select_own" on public.achievement_unlocks
  for select using (auth.uid() = user_id);
create policy "achievements_insert_own" on public.achievement_unlocks
  for insert with check (auth.uid() = user_id);

create index if not exists achievement_unlocks_user_idx
  on public.achievement_unlocks (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Pre/post-session journal notes. Each grants +5 XP (counted in xpEngine).
create table if not exists public.session_notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  -- 'pre'  = pre-session plan (before market open)
  -- 'post' = post-session review (after market close)
  kind         text not null check (kind in ('pre', 'post')),
  -- Trading day this note belongs to, 'YYYY-MM-DD' in GMT+7. At most one
  -- pre and one post per day (prevents XP farming via repeated notes).
  session_date text not null,
  body         text not null default '',
  created_at   timestamptz not null default now(),
  unique (user_id, kind, session_date)
);

alter table public.session_notes enable row level security;

create policy "session_notes_select_own" on public.session_notes
  for select using (auth.uid() = user_id);
create policy "session_notes_insert_own" on public.session_notes
  for insert with check (auth.uid() = user_id);
create policy "session_notes_update_own" on public.session_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "session_notes_delete_own" on public.session_notes
  for delete using (auth.uid() = user_id);

create index if not exists session_notes_user_idx
  on public.session_notes (user_id);
