-- ============================================================
-- profiles (V2 brief §5 foundation; also powers username login)
-- One row per user. Username is the public handle; lowercase
-- [a-z0-9_], 3–30 chars, unique.
-- ============================================================
create table public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  username     text        not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text        check (char_length(display_name) <= 50),
  bio          text        check (char_length(bio) <= 300),
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Owner can read + write their own row.
create policy "profiles: owner full access"
  on public.profiles
  for all
  to authenticated
  using  ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ── Auto-create a profile at signup ──────────────────────────
-- signUp passes the chosen username in user metadata; this trigger copies it
-- into profiles. security definer so it runs before the user has a session.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ? 'username' then
    insert into public.profiles (id, username)
    values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Username availability check ──────────────────────────────
-- Callable before signup (no session yet), so it's security definer and
-- granted to anon. Returns true if the username is free.
create or replace function public.is_username_available(uname text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username = lower(uname)
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
