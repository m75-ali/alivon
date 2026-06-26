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
