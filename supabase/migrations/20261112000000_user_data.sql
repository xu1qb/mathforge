-- 每个账号一份学习数据快照（localStorage 全量 JSON）
create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "Users can read own data" on public.user_data;
create policy "Users can read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own data" on public.user_data;
create policy "Users can insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own data" on public.user_data;
create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own data" on public.user_data;
create policy "Users can delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);

revoke all on table public.user_data from anon, authenticated;
grant select, insert, update, delete on table public.user_data to authenticated;

create or replace function public.touch_user_data_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_data_touch_updated_at on public.user_data;
create trigger user_data_touch_updated_at
  before update on public.user_data
  for each row
  execute function public.touch_user_data_updated_at();
