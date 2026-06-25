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
