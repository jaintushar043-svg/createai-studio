
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  credits integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Generations
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('image','video')),
  prompt text not null,
  negative_prompt text,
  style text,
  aspect_ratio text,
  model text,
  output_url text,
  status text not null default 'pending' check (status in ('pending','succeeded','failed')),
  error text,
  credits_used integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.generations enable row level security;
create index generations_user_created_idx on public.generations(user_id, created_at desc);

create policy "users read own generations" on public.generations
  for select to authenticated using (auth.uid() = user_id);
create policy "users insert own generations" on public.generations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own generations" on public.generations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own generations" on public.generations
  for delete to authenticated using (auth.uid() = user_id);

-- Credit transactions ledger
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  generation_id uuid references public.generations(id) on delete set null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);
alter table public.credit_transactions enable row level security;
create index credit_tx_user_idx on public.credit_transactions(user_id, created_at desc);

create policy "users read own credit tx" on public.credit_transactions
  for select to authenticated using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Handle new user: create profile + grant 20 credits + default role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    20
  );

  insert into public.user_roles (user_id, role) values (new.id, 'user');

  insert into public.credit_transactions (user_id, delta, reason, balance_after)
  values (new.id, 20, 'signup_bonus', 20);

  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Atomic credit deduction (security definer; auth context required)
create or replace function public.deduct_credits(_amount integer, _reason text, _generation_id uuid default null)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _new_balance integer;
begin
  if _uid is null then raise exception 'not authenticated'; end if;
  if _amount <= 0 then raise exception 'amount must be positive'; end if;

  update public.profiles
     set credits = credits - _amount
   where id = _uid and credits >= _amount
   returning credits into _new_balance;

  if _new_balance is null then
    raise exception 'insufficient_credits';
  end if;

  insert into public.credit_transactions (user_id, delta, reason, generation_id, balance_after)
  values (_uid, -_amount, _reason, _generation_id, _new_balance);

  return _new_balance;
end; $$;

-- Storage bucket (public read)
insert into storage.buckets (id, name, public) values ('generations', 'generations', true)
on conflict (id) do nothing;

create policy "Public read generations"
  on storage.objects for select
  using (bucket_id = 'generations');

create policy "Users upload own generations"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own generations"
  on storage.objects for delete to authenticated
  using (bucket_id = 'generations' and auth.uid()::text = (storage.foldername(name))[1]);
