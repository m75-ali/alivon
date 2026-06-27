-- ============================================================
-- email_for_username — resolves a username to its account email so users can
-- log in with either. Runs pre-auth (no session), so it's security definer and
-- granted to anon. Returns null if the username doesn't exist.
--
-- Tradeoff (accepted for a first app): this maps username -> email, which
-- allows email enumeration by username. Acceptable at this scale; revisit
-- (rate-limit / lock down) if abuse appears.
-- ============================================================
create or replace function public.email_for_username(uname text)
returns text
language sql
security definer
set search_path = ''
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = lower(uname)
  limit 1;
$$;

grant execute on function public.email_for_username(text) to anon, authenticated;
