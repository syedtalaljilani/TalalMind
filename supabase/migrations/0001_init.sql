-- TalalMind: Supabase schema
-- Run this in your Supabase project (SQL editor) once.

-- 1. Enable anonymous sign-ins in Dashboard -> Authentication -> Providers -> "Anonymous sign-ins" ON.

-- 2. Single generic key/value table scoped to the anonymous user.
create table if not exists public.app_state (
  user_id uuid not null default auth.uid(),
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.app_state enable row level security;

-- Users can only read/write their own rows (works with anonymous auth sessions).
create policy "own app_state select"
  on public.app_state for select
  to anon, authenticated
  using (auth.uid() = user_id);

create policy "own app_state insert"
  on public.app_state for insert
  to anon, authenticated
  with check (auth.uid() = user_id);

create policy "own app_state update"
  on public.app_state for update
  to anon, authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own app_state delete"
  on public.app_state for delete
  to anon, authenticated
  using (auth.uid() = user_id);

-- Keep updated_at fresh on write.
create or replace function public.touch_app_state()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_app_state_touch
  before insert or update on public.app_state
  for each row execute function public.touch_app_state();
