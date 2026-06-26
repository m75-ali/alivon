-- Alivon full schema for a fresh DEV Supabase project.
-- Paste ALL of this into the dev project's SQL Editor and Run once.
-- Safe on an empty DB. Mirrors production exactly.

-- ============================================================
-- supabase/migrations/20260625000001_initial_schema.sql
-- ============================================================
-- ============================================================
-- quests
-- ============================================================
create table public.quests (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  title           text        not null,
  description     text,
  category        text,
  cover_image_url text,
  status          text        not null default 'active'
                              check (status in ('active', 'paused', 'archived')),
  created_at      timestamptz not null default now()
);

alter table public.quests enable row level security;

-- (select auth.uid()) is called once per query, not once per row — see RLS performance
create policy "quests: owner full access"
  on public.quests
  for all
  to authenticated
  using  ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index quests_user_id_idx on public.quests (user_id);


-- ============================================================
-- quest_items
-- ============================================================
create table public.quest_items (
  id          uuid        primary key default gen_random_uuid(),
  quest_id    uuid        not null references public.quests(id) on delete cascade,
  title       text        not null,
  description text,
  status      text        not null default 'queued'
                          check (status in ('queued', 'in_progress', 'done', 'skipped')),
  order_index integer     not null,
  created_at  timestamptz not null default now()
);

alter table public.quest_items enable row level security;

-- No user_id here — ownership is derived through quests
create policy "quest_items: owner full access"
  on public.quest_items
  for all
  to authenticated
  using (
    quest_id in (
      select id from public.quests where user_id = (select auth.uid())
    )
  )
  with check (
    quest_id in (
      select id from public.quests where user_id = (select auth.uid())
    )
  );

create index quest_items_quest_id_idx on public.quest_items (quest_id);


-- ============================================================
-- log_entries
-- ============================================================
create table public.log_entries (
  id            uuid        primary key default gen_random_uuid(),
  quest_item_id uuid        not null references public.quest_items(id) on delete cascade,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  note          text,
  image_url     text,
  mood          smallint    check (mood between 1 and 5),
  created_at    timestamptz not null default now()
);

alter table public.log_entries enable row level security;

create policy "log_entries: owner full access"
  on public.log_entries
  for all
  to authenticated
  using  ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index log_entries_user_id_idx      on public.log_entries (user_id);
create index log_entries_quest_item_id_idx on public.log_entries (quest_item_id);


-- ============================================================
-- Storage bucket for quest photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('quest-images', 'quest-images', false);

-- Authenticated users can upload to their own folder (user_id/*)
create policy "quest-images: owner upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'quest-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "quest-images: owner read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'quest-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "quest-images: owner delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'quest-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- supabase/migrations/20260625000002_delete_user_fn.sql
-- ============================================================
-- Allows a user to delete their own account from the client.
-- security definer runs with elevated privileges so it can delete from auth.users.
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;


-- ============================================================
-- supabase/migrations/20260625000003_quest_completion.sql
-- ============================================================
-- ============================================================
-- Quest completion lifecycle
-- Adds a real `completed` state plus the completion "capstone"
-- (closing reflection) captured directly on the quest.
-- ============================================================

-- Rework the status enum: `completed` is the achievement state;
-- `abandoned` replaces the ambiguous `archived` (= gave up, not finished).
alter table public.quests drop constraint quests_status_check;
update public.quests set status = 'abandoned' where status = 'archived';
alter table public.quests
  add constraint quests_status_check
  check (status in ('active', 'paused', 'completed', 'abandoned'));

-- Completion capstone: when (completed_at is null) the quest is open.
alter table public.quests
  add column completed_at         timestamptz,
  add column completion_note      text,
  add column completion_image_url text,
  add column completion_mood      smallint check (completion_mood between 1 and 5);


-- ============================================================
-- supabase/migrations/20260625000004_v2_reconcile.sql
-- ============================================================
-- ============================================================
-- V2 reconcile (Brief §3): honest base before the social layer.
-- One migration: status cleanup, visibility/nudges, DB length limits.
-- No new tables — the social schema comes later, after V1 has real
-- logged activity (Brief §1).
-- ============================================================

-- ── Status enum: drop `abandoned`, restore `archived` ────────
-- `archived` reads as "set aside", not the gamified "gave up".
-- Map any existing `abandoned` rows back to `archived`.
alter table public.quests drop constraint quests_status_check;
update public.quests set status = 'archived' where status = 'abandoned';
alter table public.quests
  add constraint quests_status_check
  check (status in ('active', 'paused', 'completed', 'archived'));

-- ── Visibility + nudges (defaults keep V1 behaviour) ─────────
-- Default private: going public is always a deliberate choice.
alter table public.quests
  add column visibility     text    not null default 'private'
                            check (visibility in ('private', 'public')),
  add column nudges_enabled boolean not null default true;

-- ── DB-level length limits (mirror the frontend maxLength) ───
-- char_length(null) is null, so these pass for null columns.
alter table public.quests
  add constraint quests_title_len       check (char_length(title) <= 100),
  add constraint quests_description_len check (char_length(description) <= 500);

alter table public.quest_items
  add constraint quest_items_title_len       check (char_length(title) <= 100),
  add constraint quest_items_description_len check (char_length(description) <= 500);

alter table public.log_entries
  add constraint log_entries_note_len check (char_length(note) <= 1000);


