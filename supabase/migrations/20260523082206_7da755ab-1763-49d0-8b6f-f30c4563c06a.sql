revoke all on function public.grant_credits(uuid, integer, text, jsonb) from public, anon, authenticated;
revoke all on function public.apply_plan(uuid, public.plan_tier, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.grant_credits(uuid, integer, text, jsonb) to service_role;
grant execute on function public.apply_plan(uuid, public.plan_tier, text, text, text, timestamptz) to service_role;