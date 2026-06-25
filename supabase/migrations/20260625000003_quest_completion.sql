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
