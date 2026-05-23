
-- Lock down search_path on remaining function
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Restrict SECURITY DEFINER execution
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.deduct_credits(integer, text, uuid) from public, anon;
grant execute on function public.deduct_credits(integer, text, uuid) to authenticated;

-- Drop broad public listing policy on storage (public bucket still serves files via CDN URLs)
drop policy if exists "Public read generations" on storage.objects;
