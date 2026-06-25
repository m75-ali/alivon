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
