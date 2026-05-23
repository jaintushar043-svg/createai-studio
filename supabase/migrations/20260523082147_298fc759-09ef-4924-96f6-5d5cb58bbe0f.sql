-- Plan enum
do $$ begin
  create type public.plan_tier as enum ('free','pro','enterprise');
exception when duplicate_object then null; end $$;

-- Profile: plan + last monthly grant timestamp
alter table public.profiles
  add column if not exists plan public.plan_tier not null default 'free',
  add column if not exists monthly_credit_grant_at timestamptz;

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  plan public.plan_tier not null,
  provider text not null check (provider in ('stripe','razorpay')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

drop policy if exists "users read own subscription" on public.subscriptions;
create policy "users read own subscription" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

create trigger trg_subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Payment orders (top-ups + subscription checkouts)
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('stripe','razorpay')),
  provider_order_id text,
  kind text not null check (kind in ('topup','subscription')),
  plan public.plan_tier,
  credits integer not null default 0,
  amount_cents integer not null,
  currency text not null default 'INR',
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payment_orders enable row level security;

drop policy if exists "users read own orders" on public.payment_orders;
create policy "users read own orders" on public.payment_orders
  for select to authenticated using (auth.uid() = user_id);

create trigger trg_payment_orders_touch
  before update on public.payment_orders
  for each row execute function public.touch_updated_at();

-- Grant credits (used by webhooks via service role)
create or replace function public.grant_credits(
  _user_id uuid,
  _amount integer,
  _reason text,
  _metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare _new integer;
begin
  if _amount <= 0 then raise exception 'amount must be positive'; end if;

  update public.profiles
     set credits = credits + _amount
   where id = _user_id
   returning credits into _new;

  if _new is null then raise exception 'user not found'; end if;

  insert into public.credit_transactions (user_id, delta, reason, balance_after)
  values (_user_id, _amount, _reason, _new);

  return _new;
end $$;

-- Apply plan after a successful payment
create or replace function public.apply_plan(
  _user_id uuid,
  _plan public.plan_tier,
  _provider text,
  _provider_customer_id text,
  _provider_subscription_id text,
  _period_end timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set plan = _plan where id = _user_id;

  insert into public.subscriptions (user_id, plan, provider, provider_customer_id, provider_subscription_id, status, current_period_end)
  values (_user_id, _plan, _provider, _provider_customer_id, _provider_subscription_id, 'active', _period_end)
  on conflict (user_id) do update set
    plan = excluded.plan,
    provider = excluded.provider,
    provider_customer_id = coalesce(excluded.provider_customer_id, public.subscriptions.provider_customer_id),
    provider_subscription_id = coalesce(excluded.provider_subscription_id, public.subscriptions.provider_subscription_id),
    status = 'active',
    current_period_end = excluded.current_period_end,
    updated_at = now();
end $$;